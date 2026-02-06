# Troubleshooting

## Connection Issues

### "MCP Error: Bad Request: No valid session ID provided"

**Symptom**: Linear DB client fails with session error.

**Cause**: `initialize()` not called before operations.

**Fix**: Call `await client.initialize()` first.

**Source**: `linear_client.py:45-52`

```python
client = LinearDBClient(LINEAR_DB_URL)
await client.initialize()  # Required
await client.create_issue(...)
```

### "Connection refused" to Linear DB

**Symptom**: `httpx.ConnectError` when connecting to Linear DB.

**Cause**: Linear DB MCP server not running.

**Fix**: Start the server:

```bash
cd /path/to/linear.db/sqlite-mcp-server
PORT=3335 npm run dev
```

Verify with curl:

```bash
curl http://localhost:3335/mcp -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

## Alan Issues

### "No tasks generated from PRD"

**Symptom**: `alan.py` creates 0 tasks.

**Cause**: Claude response doesn't contain valid JSON array.

**Debug**: Check `parse_prd_to_tasks()` response parsing (`alan.py:54-63`).

**Fix**: PRD may be too vague. Provide more specific requirements.

### "Failed to create task" errors

**Symptom**: Tasks not created in Linear DB.

**Cause**: Team doesn't exist or label missing.

**Fix**: `setup_team()` should auto-create team and labels (`alan.py:67-91`).

If issue persists, manually create team:

```python
await client.create_team("Agentic PM", "AGT")
```

## Worker Issues

### Worker not picking up tasks

**Symptom**: Worker polls but doesn't execute.

**Cause 1**: No tasks assigned to worker email.

**Debug**: Check `list_issues()` result:

```python
result = await client.list_issues(team=TEAM_KEY, assignee=worker_email)
print(result)
```

**Cause 2**: Tasks not in pending state.

**Fix**: Filter checks `status_type in (None, "backlog", "unstarted")` (`worker.py:93-96`).

### "Task execution failed"

**Symptom**: Worker catches exception during `execute_task()`.

**Cause**: Claude Agent SDK error.

**Debug**: Check `worker.py:68-70` for error logging.

**Common causes**:
- `ANTHROPIC_API_KEY` not set
- API rate limit
- Invalid working directory

### Worker stuck on one task

**Symptom**: Worker keeps retrying same task.

**Cause**: Task update failed, state not changed to "In Progress" or "Done".

**Fix**: Check Linear DB connection. Task should be updated at:
- `worker.py:111` - Set "In Progress"
- `worker.py:118` - Set "Done"

## Configuration Issues

### "ANTHROPIC_API_KEY not set"

**Symptom**: Claude SDK fails immediately.

**Fix**: Set API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or add to `.env` file.

### Wrong team key

**Symptom**: Issues created in wrong team or "Team not found".

**Cause**: `TEAM_KEY` mismatch.

**Fix**: Ensure `TEAM_KEY` in `.env` matches existing team, or let `setup_team()` create it (`alan.py:73-75`).

## Performance Issues

### High API costs

**Symptom**: Claude API costs higher than expected.

**Cause**: Worker `max_turns=20` (`worker.py:56`) allows many iterations.

**Fix**: Reduce `max_turns` or use `haiku` model:

```bash
CLAUDE_MODEL=haiku
```

### Slow polling

**Symptom**: Worker responds slowly to new tasks.

**Cause**: `POLL_INTERVAL` too high.

**Fix**: Reduce polling interval:

```bash
POLL_INTERVAL=2
```

**Trade-off**: More frequent polling = more Linear DB requests.

## Debugging Tips

### Enable debug logging

Loguru is used throughout. Set level:

```python
from loguru import logger
logger.enable("agentic_pm")
```

### Check Linear DB directly

Use MCP tools to inspect state:

```bash
curl -X POST http://localhost:3335/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: YOUR_SESSION_ID" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_issues","arguments":{"team":"AGT"}}}'
```

### Test components separately

1. Test Linear DB connection:
```python
client = LinearDBClient()
await client.initialize()
print(await client.list_teams())
```

2. Test PRD parsing:
```python
tasks = await parse_prd_to_tasks("Build hello world")
print(tasks)
```

3. Test single task execution:
```python
result = await execute_task({"title": "Test", "description": "Print hello"})
print(result)
```
