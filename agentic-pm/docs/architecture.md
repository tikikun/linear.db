# Architecture

Multi-agent orchestration using Linear DB as a local coordination layer.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         ALAN                                │
│                    (PM Agent)                               │
│   alan.py:121 - alan_process_prd()                         │
│                                                             │
│   PRD/Requirements → Break down → Create issues → Assign    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      LINEAR DB                              │
│                  (Local SQLite MCP)                         │
│   linear_client.py:7 - LinearDBClient                       │
│                                                             │
│   Issues, Statuses, Assignments, Comments, Labels           │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Worker 1 │  │ Worker 2 │  │ Worker N │
        │          │  │          │  │          │
        │ Poll →   │  │ Poll →   │  │ Poll →   │
        │ Execute  │  │ Execute  │  │ Execute  │
        │ → Update │  │ → Update │  │ → Update │
        └──────────┘  └──────────┘  └──────────┘
        worker.py:75 - worker_loop()
```

## Components

### Alan Agent (`alan.py`)

PM agent that breaks down PRDs into tasks.

| Function | Purpose |
|----------|---------|
| `parse_prd_to_tasks()` | Use Claude to parse PRD into JSON task array |
| `setup_team()` | Create team and labels if not exist |
| `create_tasks()` | Create issues with round-robin assignment |
| `alan_process_prd()` | Main workflow: PRD → Tasks → Linear DB |

**System Prompt**: Instructs Claude to output minimal, atomic tasks. Single-file projects get exactly one task.

### Worker Agent (`worker.py`)

Executor agent that polls and executes tasks.

| Function | Line | Purpose |
|----------|------|---------|
| `execute_task()` | 26 | Execute task using Claude Agent SDK |
| `worker_loop()` | 75 | Continuous polling loop |
| `worker_once()` | 131 | Execute single task and exit |

**Source**: `worker.py:32-39` - Tools determined by task labels.

### Linear DB Client (`linear_client.py`)

HTTP client for Linear DB MCP server.

| Method | Line | Purpose |
|--------|------|---------|
| `initialize()` | 45 | Start MCP session |
| `call_tool()` | 54 | Generic tool call |
| `create_issue()` | 86 | Create issue |
| `update_issue()` | 125 | Update issue state/assignee |
| `create_comment()` | 147 | Add comment to issue |

**Source**: `linear_client.py:15-43` - JSON-RPC over HTTP with session management.

## Data Flow

### 1. Alan Creates Tasks

```
PRD Input
    │
    ▼
parse_prd_to_tasks() ─── Claude API ──→ JSON Tasks
    │                     (alan.py:47)
    ▼
create_tasks() ─── Linear DB MCP ──→ Issues Created
    │               (alan.py:102)
    ▼
Round-robin Assignment
    (alan.py:100)
```

### 2. Worker Executes Tasks

```
worker_loop() polls every POLL_INTERVAL seconds
    │                     (worker.py:100)
    ▼
list_issues(assignee=worker_email)
    │                     (worker.py:85-88)
    ▼
Filter: status_type in (None, "backlog", "unstarted")
    │                     (worker.py:93-96)
    ▼
update_issue(state="In Progress")
    │                     (worker.py:111)
    ▼
execute_task() ─── Claude API ──→ Work Done
    │               (worker.py:61)
    ▼
update_issue(state="Done")
    │                     (worker.py:118)
    ▼
create_comment(result)
                          (worker.py:119-122)
```

## Communication Protocol

Linear DB MCP uses JSON-RPC 2.0 over HTTP.

**Source**: `linear_client.py:26-31`

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_issue",
    "arguments": {"team": "AGT", "title": "..."}
  }
}
```

Session maintained via `mcp-session-id` header (`linear_client.py:23-24`).

## Dependencies

| Package | Purpose | Source |
|---------|---------|--------|
| `claude-agent-sdk` | Agent execution | `alan.py:5`, `worker.py:4` |
| `httpx` | HTTP client | `linear_client.py:2` |
| `loguru` | Logging | All files |
| `python-dotenv` | Config loading | `config.py:3` |

**Source**: `requirements.txt`
