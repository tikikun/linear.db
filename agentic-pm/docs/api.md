# API Reference

## Alan Agent (`alan.py`)

### `alan_process_prd()`

Main workflow: PRD → Tasks → Linear DB.

**Source**: `alan.py:121-155`

```python
async def alan_process_prd(
    prd: str,
    worker_emails: list[str] | None = None
) -> list[dict]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `prd` | `str` | PRD or requirement text |
| `worker_emails` | `list[str] \| None` | Worker emails for assignment |

**Returns**: List of created issues.

**Example**:

```python
import asyncio
from alan import alan_process_prd

issues = asyncio.run(alan_process_prd(
    "Build a REST API for user management",
    ["worker1@local", "worker2@local"]
))
```

### `parse_prd_to_tasks()`

Use Claude to parse PRD into tasks.

**Source**: `alan.py:37-64`

```python
async def parse_prd_to_tasks(prd: str) -> list[dict]
```

**Returns**: List of task dicts with keys:
- `title` (str): Task title
- `description` (str): Task description
- `labels` (list[str]): Labels (code, test, docs, etc.)
- `priority` (int): 1=Urgent, 2=High, 3=Normal, 4=Low

### `setup_team()`

Ensure team and labels exist.

**Source**: `alan.py:67-91`

```python
async def setup_team(client: LinearDBClient) -> None
```

Creates team with key from `config.TEAM_KEY` and standard labels:
- `code` (#5e6ad2)
- `test` (#4EA7FC)
- `docs` (#26B5CE)
- `refactor` (#F2C94C)
- `bug` (#EB5757)
- `feature` (#6FCF97)
- `research` (#BB6BD9)

### `create_tasks()`

Create issues in Linear DB.

**Source**: `alan.py:94-118`

```python
async def create_tasks(
    client: LinearDBClient,
    tasks: list[dict],
    worker_emails: list[str]
) -> list[dict]
```

Assignment is round-robin: `worker_emails[i % len(worker_emails)]` (`alan.py:100`).

---

## Worker Agent (`worker.py`)

### `worker_loop()`

Continuous polling loop.

**Source**: `worker.py:75-128`

```python
async def worker_loop(
    worker_email: str,
    working_dir: str = "."
) -> None
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `worker_email` | `str` | Worker identity for assignment lookup |
| `working_dir` | `str` | Working directory for task execution |

Polls every `config.POLL_INTERVAL` seconds (`worker.py:100`).

### `worker_once()`

Execute one task and exit.

**Source**: `worker.py:131-176`

```python
async def worker_once(
    worker_email: str,
    working_dir: str = "."
) -> bool
```

**Returns**: `True` if task executed, `False` if no pending tasks.

### `execute_task()`

Execute task using Claude Agent SDK.

**Source**: `worker.py:26-72`

```python
async def execute_task(
    task: dict,
    working_dir: str = "."
) -> str
```

**Returns**: Execution result text.

Tools allowed based on labels (`worker.py:32-39`):
- Always: `Read`, `Bash`
- If `code`/`feature`/`bug`/`test`/`docs`: + `Write`, `Edit`

---

## Linear DB Client (`linear_client.py`)

### `LinearDBClient`

**Source**: `linear_client.py:7-157`

```python
class LinearDBClient:
    def __init__(self, base_url: str = "http://localhost:3335/mcp")
```

### `initialize()`

Initialize MCP session.

**Source**: `linear_client.py:45-52`

```python
async def initialize(self) -> None
```

Must be called before other operations.

### `create_issue()`

Create a new issue.

**Source**: `linear_client.py:86-103`

```python
async def create_issue(
    self,
    team: str,
    title: str,
    description: str | None = None,
    assignee: str | None = None,
    labels: list[str] | None = None,
    priority: int = 3,
) -> dict
```

### `list_issues()`

List issues with filters.

**Source**: `linear_client.py:105-119`

```python
async def list_issues(
    self,
    team: str | None = None,
    assignee: str | None = None,
    state: str | None = None,
) -> dict
```

### `update_issue()`

Update issue.

**Source**: `linear_client.py:125-143`

```python
async def update_issue(
    self,
    issue_id: str,
    state: str | None = None,
    assignee: str | None = None,
    title: str | None = None,
    description: str | None = None,
) -> dict
```

### `create_comment()`

Add comment to issue.

**Source**: `linear_client.py:147-149`

```python
async def create_comment(
    self,
    issue_id: str,
    body: str
) -> dict
```

---

## CLI Usage

### Alan

```bash
python alan.py '<PRD text>' [worker1@email,worker2@email]
```

**Source**: `alan.py:159-172`

### Worker

```bash
python worker.py <worker_email> [--loop] [--dir <working_dir>]
```

**Source**: `worker.py:180-203`

| Flag | Description |
|------|-------------|
| `--loop` | Continuous polling mode |
| `--dir <path>` | Working directory for execution |
