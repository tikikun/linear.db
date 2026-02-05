# Linear SQLite MCP Server

A Model Context Protocol (MCP) server that provides a Linear-style ticketing system backed by SQLite.

## Quick Start

```bash
npm install
npm run init-db
PORT=3334 npm run dev
```

Server runs at `http://localhost:3334/mcp`

## Documentation

See the main [docs/](../docs/) directory for detailed documentation:

| Document | Description |
|----------|-------------|
| [Installation](../docs/installation.md) | Setup guide, MCP client config |
| [Architecture](../docs/architecture.md) | System design, request flow |
| [API Reference](../docs/api.md) | All 27 tools with parameters |
| [Configuration](../docs/configuration.md) | Environment variables |
| [Troubleshooting](../docs/troubleshooting.md) | Common issues |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `DB_PATH` | `./linear.db` | SQLite database path |

## MCP Tools (27 total)

| Category | Tools |
|----------|-------|
| **Issues** | `list_issues`, `get_issue`, `create_issue`, `update_issue` |
| **Projects** | `list_projects`, `get_project`, `create_project`, `update_project` |
| **Milestones** | `list_milestones`, `create_milestone` |
| **Teams** | `list_teams`, `get_team`, `list_issue_statuses` |
| **Users** | `list_users`, `get_user` |
| **Labels** | `list_issue_labels`, `create_issue_label`, `update_issue_label`, `delete_issue_label` |
| **Cycles** | `list_cycles`, `get_cycle`, `create_cycle`, `update_cycle`, `delete_cycle` |
| **Comments** | `list_comments`, `create_comment`, `update_comment`, `delete_comment` |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/mcp` | MCP protocol (JSON-RPC) |
| `DELETE` | `/mcp` | Session termination |

## Database

After `npm run init-db`, the database contains:
- Issue statuses (Backlog, Todo, In Progress, Done, Canceled, Duplicate)
- Issue priorities (None, Urgent, High, Normal, Low)

**Note**: No default teams or users. Create them via your application.

## Example

```bash
# Health check
curl http://localhost:3334/health

# Initialize MCP session
curl -X POST http://localhost:3334/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test"}}}'
```

## License

MIT
