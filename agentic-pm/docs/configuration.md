# Configuration

All configuration via environment variables. Loaded from `.env` file.

**Source**: `config.py:1-22`

## Environment Variables

| Variable | Default | Description | Source |
|----------|---------|-------------|--------|
| `LINEAR_DB_URL` | `http://localhost:3335/mcp` | Linear DB MCP server URL | `config.py:8` |
| `TEAM_KEY` | `AGT` | Team key (2-5 uppercase letters) | `config.py:11` |
| `TEAM_NAME` | `Agentic PM` | Team display name | `config.py:12` |
| `ALAN_USER_EMAIL` | `alan@agentic.local` | Alan agent email | `config.py:15` |
| `WORKER_PREFIX` | `worker` | Worker name prefix | `config.py:16` |
| `POLL_INTERVAL` | `5` | Worker polling interval (seconds) | `config.py:19` |
| `CLAUDE_MODEL` | `sonnet` | Claude model (sonnet/opus/haiku) | `config.py:22` |
| `ANTHROPIC_API_KEY` | - | **Required**. Anthropic API key | Claude SDK |

## Example `.env`

```bash
# Linear DB MCP Server
LINEAR_DB_URL=http://localhost:3335/mcp

# Team configuration
TEAM_KEY=AGT
TEAM_NAME=Agentic PM

# Worker configuration
POLL_INTERVAL=5

# Claude configuration
CLAUDE_MODEL=sonnet

# Required
ANTHROPIC_API_KEY=sk-ant-...
```

## Configuration Details

### `LINEAR_DB_URL`

URL to Linear DB MCP server endpoint.

**Used in**: `alan.py:126`, `worker.py:79`, `worker.py:135`

```python
client = LinearDBClient(LINEAR_DB_URL)
```

### `TEAM_KEY`

Team key for all created issues. Must be 2-5 uppercase letters.

**Used in**: `alan.py:71`, `alan.py:103`, `worker.py:86`

### `POLL_INTERVAL`

How often workers poll for new tasks (in seconds).

**Used in**: `worker.py:100`, `worker.py:128`

```python
await asyncio.sleep(POLL_INTERVAL)
```

### `CLAUDE_MODEL`

Model for worker task execution.

**Used in**: `worker.py:54`

```python
options = ClaudeAgentOptions(
    model=CLAUDE_MODEL,
    ...
)
```

Options: `sonnet` (default), `opus`, `haiku`

## Agent-Specific Configuration

### Alan System Prompt

Hardcoded in `alan.py:11-34`. Instructs Claude to output JSON task array.

### Worker System Prompt

Hardcoded in `worker.py:10-23`. Instructs Claude to execute tasks.

### Worker Tool Selection

Based on task labels (`worker.py:32-39`):

| Labels | Tools |
|--------|-------|
| (base) | `Read`, `Bash` |
| `code`, `feature`, `bug` | + `Write`, `Edit` |
| `test` | + `Write`, `Edit` |
| `docs` | + `Write`, `Edit` |

### Worker Max Turns

Hardcoded to 20 in `worker.py:56`:

```python
options = ClaudeAgentOptions(
    max_turns=20,
    ...
)
```
