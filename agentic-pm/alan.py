"""Alan Agent - The PM that breaks down PRDs into tasks and assigns them."""
import asyncio
import json
from loguru import logger
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock

from linear_client import LinearDBClient
from config import LINEAR_DB_URL, TEAM_KEY, TEAM_NAME


ALAN_SYSTEM_PROMPT = """You are Alan, a technical project manager agent.

Your job is to analyze requirements and create MINIMAL, actionable tasks.

CRITICAL RULES:
1. For SINGLE-FILE outputs (one HTML, one Python script, etc.):
   - Create EXACTLY ONE task that produces the entire file
   - Do NOT break it into multiple tasks
   
2. For MULTI-FILE projects:
   - Create tasks that are INDEPENDENTLY COMPLETABLE
   - Each task should produce a working deliverable
   - Maximum 3-5 tasks total

3. Tasks must be atomic - one developer, one sitting, complete result

Output ONLY a JSON array in this EXACT format:

```json
[
  {
    "title": "Short imperative title",
    "description": "Full description with all requirements inline",
    "labels": ["code"],
    "priority": 2
  }
]
```

Labels: code, test, docs, feature
Priority: 2=High, 3=Normal

IMPORTANT: Output ONLY the JSON array. For single-file projects, output EXACTLY ONE task."""


async def parse_prd_to_tasks(prd: str) -> list[dict]:
    """Use Claude to parse PRD into tasks."""
    import re
    
    options = ClaudeAgentOptions(
        allowed_tools=[],
        permission_mode="bypassPermissions",
        system_prompt=ALAN_SYSTEM_PROMPT,
        model="sonnet",
    )
    
    full_response = ""
    async for message in query(prompt=f"Break down this PRD into tasks:\n\n{prd}", options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    full_response += block.text
    
    # Extract JSON from response
    start = full_response.find("[")
    end = full_response.rfind("]") + 1
    
    if start < 0 or end <= start:
        logger.warning("No JSON array found in Claude response")
        return []
    
    json_str = full_response[start:end]
    
    # Try to parse with auto-repair for common LLM JSON errors
    for attempt in range(3):
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            if attempt == 0:
                # Fix missing opening braces: },  "title" -> }, { "title"
                json_str = re.sub(r'},\s*"title"', '},\n  {\n    "title"', json_str)
            elif attempt == 1:
                # Fix truncated JSON by closing array
                if not json_str.rstrip().endswith("]"):
                    last_brace = json_str.rfind("}")
                    if last_brace > 0:
                        json_str = json_str[:last_brace+1] + "\n]"
            else:
                logger.error(f"Failed to parse tasks JSON: {e}")
    
    return []


async def setup_team(client: LinearDBClient) -> None:
    """Ensure team and labels exist."""
    # Check if team exists
    teams = await client.list_teams()
    team_exists = any(t.get("key") == TEAM_KEY for t in teams.get("data", []))
    
    if not team_exists:
        logger.info(f"Creating team {TEAM_NAME} ({TEAM_KEY})")
        await client.create_team(TEAM_NAME, TEAM_KEY)
        
        # Create standard labels
        labels = [
            ("code", "#5e6ad2"),
            ("test", "#4EA7FC"),
            ("docs", "#26B5CE"),
            ("refactor", "#F2C94C"),
            ("bug", "#EB5757"),
            ("feature", "#6FCF97"),
            ("research", "#BB6BD9"),
        ]
        for name, color in labels:
            try:
                await client.create_label(TEAM_KEY, name, color)
            except Exception:
                pass  # Label may already exist


async def create_tasks(client: LinearDBClient, tasks: list[dict], worker_emails: list[str]) -> list[dict]:
    """Create issues in Linear DB and assign to workers (round-robin)."""
    created = []
    
    for i, task in enumerate(tasks):
        # Round-robin assignment
        assignee = worker_emails[i % len(worker_emails)] if worker_emails else None
        
        result = await client.create_issue(
            team=TEAM_KEY,
            title=task["title"],
            description=task.get("description", ""),
            assignee=assignee,
            labels=task.get("labels", []),
            priority=task.get("priority", 3),
        )
        
        if result.get("success"):
            issue = result["data"]
            logger.info(f"Created {issue['identifier']}: {task['title']} → {assignee or 'unassigned'}")
            created.append(issue)
        else:
            logger.error(f"Failed to create task: {result.get('error')}")
    
    return created


async def alan_process_prd(prd: str, worker_emails: list[str] | None = None) -> list[dict]:
    """Main Alan workflow: PRD → Tasks → Linear DB."""
    logger.info("Alan starting PRD analysis...")
    
    # Connect to Linear DB
    client = LinearDBClient(LINEAR_DB_URL)
    await client.initialize()
    
    # Ensure team setup
    await setup_team(client)
    
    # Create worker users if needed
    if worker_emails:
        for email in worker_emails:
            name = email.split("@")[0].replace(".", " ").title()
            try:
                await client.create_user(name, email)
                logger.info(f"Created worker user: {name}")
            except Exception:
                pass  # User may exist
    
    # Parse PRD to tasks
    logger.info("Analyzing PRD with Claude...")
    tasks = await parse_prd_to_tasks(prd)
    logger.info(f"Generated {len(tasks)} tasks")
    
    if not tasks:
        logger.warning("No tasks generated from PRD")
        return []
    
    # Create issues in Linear DB
    created = await create_tasks(client, tasks, worker_emails or [])
    
    logger.info(f"Alan created {len(created)} issues in Linear DB")
    return created


# CLI interface
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python alan.py '<PRD text>' [worker1@email,worker2@email]")
        print("\nExample:")
        print('  python alan.py "Build a REST API for user management" worker1@local,worker2@local')
        sys.exit(1)
    
    prd_text = sys.argv[1]
    workers = sys.argv[2].split(",") if len(sys.argv) > 2 else []
    
    result = asyncio.run(alan_process_prd(prd_text, workers))
    print(f"\nCreated {len(result)} tasks")
