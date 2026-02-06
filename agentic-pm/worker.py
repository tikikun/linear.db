"""Worker Agent - Polls for assigned tasks and executes them."""
import asyncio
from loguru import logger
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock, ResultMessage

from linear_client import LinearDBClient
from config import LINEAR_DB_URL, TEAM_KEY, POLL_INTERVAL, CLAUDE_MODEL


WORKER_SYSTEM_PROMPT = """You are a developer agent. Execute the assigned task precisely.

Guidelines:
1. Read the task description carefully
2. Execute the required work (code, test, docs, etc.)
3. Report what you accomplished
4. Be concise but thorough

If the task involves code:
- Write clean, well-documented code
- Follow best practices
- Include error handling

Output a brief summary of what you did at the end."""


async def execute_task(task: dict, working_dir: str = ".") -> str:
    """Execute a task using Claude Agent SDK."""
    title = task.get("title", "Unknown task")
    description = task.get("description", "")
    labels = task.get("labels", [])
    
    # Determine allowed tools based on labels
    allowed_tools = ["Read", "Bash"]
    if "code" in labels or "feature" in labels or "bug" in labels:
        allowed_tools.extend(["Write", "Edit"])
    if "test" in labels:
        allowed_tools.extend(["Write", "Edit"])
    if "docs" in labels:
        allowed_tools.extend(["Write", "Edit"])
    
    prompt = f"""Execute this task:

**Title**: {title}

**Description**:
{description}

Complete this task and report what you accomplished."""

    options = ClaudeAgentOptions(
        allowed_tools=allowed_tools,
        permission_mode="bypassPermissions",  # Full automation mode
        system_prompt=WORKER_SYSTEM_PROMPT,
        model=CLAUDE_MODEL,
        cwd=working_dir,
        max_turns=20,
    )
    
    full_response = ""
    try:
        async for message in query(prompt=prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        full_response += block.text
            elif isinstance(message, ResultMessage):
                logger.info(f"Task completed. Cost: ${message.total_cost_usd:.4f}")
    except Exception as e:
        logger.error(f"Task execution failed: {e}")
        full_response = f"Error: {e}"
    
    return full_response


async def worker_loop(worker_email: str, working_dir: str = "."):
    """Main worker loop - poll for tasks, execute, update status."""
    logger.info(f"Worker {worker_email} starting...")
    
    client = LinearDBClient(LINEAR_DB_URL)
    await client.initialize()
    
    while True:
        try:
            # Poll for assigned tasks in Backlog or Todo state
            result = await client.list_issues(
                team=TEAM_KEY,
                assignee=worker_email,
            )
            
            issues = result.get("data", [])
            
            # Filter for pending tasks (Backlog, Todo)
            pending = [
                i for i in issues
                if i.get("status_type") in (None, "backlog", "unstarted")
            ]
            
            if not pending:
                logger.debug(f"No pending tasks for {worker_email}")
                await asyncio.sleep(POLL_INTERVAL)
                continue
            
            # Pick first pending task
            task = pending[0]
            issue_id = task["id"]
            identifier = task.get("identifier", issue_id)
            
            logger.info(f"Worker picking up {identifier}: {task['title']}")
            
            # Update to In Progress
            await client.update_issue(issue_id, state="In Progress")
            await client.create_comment(issue_id, f"🤖 Worker `{worker_email}` starting task...")
            
            # Execute task
            result_text = await execute_task(task, working_dir)
            
            # Update to Done and add result comment
            await client.update_issue(issue_id, state="Done")
            await client.create_comment(
                issue_id,
                f"✅ Task completed by `{worker_email}`\n\n**Result:**\n{result_text[:2000]}"
            )
            
            logger.info(f"Completed {identifier}")
            
        except Exception as e:
            logger.error(f"Worker error: {e}")
            await asyncio.sleep(POLL_INTERVAL)


async def worker_once(worker_email: str, working_dir: str = ".") -> bool:
    """Execute one task and exit. Returns True if task was executed."""
    logger.info(f"Worker {worker_email} checking for tasks...")
    
    client = LinearDBClient(LINEAR_DB_URL)
    await client.initialize()
    
    # Poll for assigned tasks
    result = await client.list_issues(
        team=TEAM_KEY,
        assignee=worker_email,
    )
    
    issues = result.get("data", [])
    pending = [
        i for i in issues
        if i.get("status_type") in (None, "backlog", "unstarted")
    ]
    
    if not pending:
        logger.info("No pending tasks")
        return False
    
    # Pick first task
    task = pending[0]
    issue_id = task["id"]
    identifier = task.get("identifier", issue_id)
    
    logger.info(f"Executing {identifier}: {task['title']}")
    
    # Update to In Progress
    await client.update_issue(issue_id, state="In Progress")
    await client.create_comment(issue_id, f"🤖 Worker `{worker_email}` starting task...")
    
    # Execute
    result_text = await execute_task(task, working_dir)
    
    # Update to Done
    await client.update_issue(issue_id, state="Done")
    await client.create_comment(
        issue_id,
        f"✅ Task completed by `{worker_email}`\n\n**Result:**\n{result_text[:2000]}"
    )
    
    logger.info(f"Completed {identifier}")
    return True


# CLI interface
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python worker.py <worker_email> [--loop] [--dir <working_dir>]")
        print("\nExamples:")
        print("  python worker.py worker1@local           # Execute one task")
        print("  python worker.py worker1@local --loop    # Continuous polling")
        print("  python worker.py worker1@local --dir /path/to/workspace")
        sys.exit(1)
    
    worker_email = sys.argv[1]
    loop_mode = "--loop" in sys.argv
    
    working_dir = "."
    if "--dir" in sys.argv:
        dir_idx = sys.argv.index("--dir")
        if dir_idx + 1 < len(sys.argv):
            working_dir = sys.argv[dir_idx + 1]
    
    if loop_mode:
        asyncio.run(worker_loop(worker_email, working_dir))
    else:
        asyncio.run(worker_once(worker_email, working_dir))
