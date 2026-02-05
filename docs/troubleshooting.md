# Troubleshooting

## Common Issues

### NODE_MODULE_VERSION Error

**Symptom**:
```
Error: The module '.../better_sqlite3.node' was compiled against 
a different Node.js version using NODE_MODULE_VERSION 141.
This version of Node.js requires NODE_MODULE_VERSION 127.
```

**Cause**: `better-sqlite3` native module compiled for different Node.js version.

**Fix**:
```bash
npm rebuild better-sqlite3
```

### Connection Refused (ECONNREFUSED)

**Symptom**:
```
connect ECONNREFUSED 127.0.0.1:3334
```

**Cause**: Server not running.

**Fix**:
1. Start the server first:
   ```bash
   PORT=3334 npm run dev
   ```
2. Then configure MCP client.

### MCP Client Shows "Loading tools..."

**Symptom**: Cursor MCP panel shows "Loading tools" indefinitely.

**Causes**:
1. Server not running
2. Wrong port in configuration
3. Server started but not responding

**Fix**:
1. Verify server is running:
   ```bash
   curl http://localhost:3334/health
   ```
2. Check `~/.cursor/mcp.json` has correct URL:
   ```json
   {"linear-db": {"url": "http://localhost:3334/mcp"}}
   ```
3. Restart Cursor or reload MCP connections.

### "Team not found" Error

**Symptom**: Tools like `list_issue_statuses` return "Team not found".

**Cause**: Missing `team` parameter.

**Fix**: Provide team name, key, or ID:
```json
{"team": "ENG"}
```

### "Issue not found" for Comments

**Symptom**: `list_comments` returns "Issue not found" with identifier like `ENG-123`.

**Cause**: Comments tools require internal issue ID, not identifier.

**Fix**: Use internal ID format:
```json
{"issueId": "issue_1770272391705_ubxl0a3"}
```

Get internal ID from `get_issue` response.

### Database Not Initialized

**Symptom**: Tables don't exist, queries fail.

**Fix**:
```bash
npm run init-db
```

### Port Already in Use

**Symptom**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix**:
1. Use different port:
   ```bash
   PORT=3334 npm run dev
   ```
2. Or kill existing process:
   ```bash
   lsof -i :3000
   kill <PID>
   ```

## Debugging

### Check Server Health

```bash
curl http://localhost:3334/health
```

Expected: `{"status":"ok","server":"linear-sqlite-mcp"}`

### Test MCP Initialize

```bash
curl -X POST http://localhost:3334/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test"}}}'
```

### Test Tool Call

```bash
curl -X POST http://localhost:3334/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: <session-id-from-initialize>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_teams","arguments":{}}}'
```

### View Server Logs

Server logs to stdout:
- Session initialized/closed
- Errors during request handling

## Reset Database

To start fresh:

```bash
rm sqlite-mcp-server/linear.db
npm run init-db
```
