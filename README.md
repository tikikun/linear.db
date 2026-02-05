# Linear SQLite Project

A local Linear-style ticketing system using SQLite, featuring an MCP (Model Context Protocol) server for AI assistant integration.

## Features

- **MCP Server** - 29 tools for managing issues, projects, teams, users, labels, cycles, and comments
- **Agentic PM** - Multi-agent orchestration using Linear DB as coordination layer (see [agentic-pm/](agentic-pm/))

## Documentation

| Document | Description |
|----------|-------------|
| [Installation](docs/installation.md) | Setup guide, dependencies, MCP client config |
| [Architecture](docs/architecture.md) | System design, components, request flow |
| [API Reference](docs/api.md) | Complete tool documentation (29 tools) |
| [Configuration](docs/configuration.md) | Environment variables, default data |
| [E2E Testing](docs/e2e-testing.md) | End-to-end testing workflow and checklist |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |

## Project Structure

```
/
├── linear_schema.sql          # SQLite schema definition
├── schema_diagram.md          # Entity relationship diagram
├── README.md                  # This file
├── sqlite-mcp-server/         # MCP server implementation
│   ├── README.md              # Server documentation
│   ├── linear.db              # SQLite database (after init)
│   ├── package.json
│   └── src/
│       ├── index.ts           # MCP server entry point
│       ├── init-db.ts         # Database initialization
│       ├── schema.ts          # Schema definitions
│       ├── db.ts              # Database utilities
│       └── tools/             # MCP tool implementations
└── agentic-pm/                # Multi-agent orchestration
    ├── README.md              # Agentic PM documentation
    ├── alan.py                # PM agent (PRD → tasks)
    ├── worker.py              # Developer agent (executes tasks)
    ├── linear_client.py       # HTTP client for Linear DB MCP
    └── docs/                  # Detailed documentation
```

## Quick Start

### 1. Initialize the Database

```bash
cd sqlite-mcp-server
npm install
npm run init-db
```

### 2. Run the MCP Server

```bash
# Development mode (with hot reload)
npm run dev

# Or production mode
npm run build
npm start
```

The server will start at `http://localhost:3000/mcp`

### 3. Test the Server

```bash
curl http://localhost:3000/health
```

## Database Schema

This project uses a normalized SQLite schema that mimics Linear's data model:

| Entity | Description |
|--------|-------------|
| `users` | Team members |
| `teams` | Teams/organizations |
| `initiatives` | High-level goals |
| `projects` | Projects within teams |
| `labels` | Issue labels with hierarchy support |
| `issue_statuses` | Backlog, Todo, In Progress, Done, Canceled |
| `issue_priorities` | None, Urgent, High, Normal, Low |
| `cycles` | Sprints/time-boxed work periods |
| `milestones` | Project milestones |
| `issues` | Core work items |
| `issue_labels` | Many-to-many relationships |
| `issue_relations` | Blocks, blockedBy, related, duplicate |
| `attachments` | File attachments |
| `documents` | Project/initiative docs |
| `comments` | Issue comments |

See `schema_diagram.md` for the entity relationship diagram.

## MCP Tools (29 total)

Available tools for AI assistants:

| Category | Tools |
|----------|-------|
| **Issues** | `list_issues`, `get_issue`, `create_issue`, `update_issue` |
| **Projects** | `list_projects`, `get_project`, `create_project`, `update_project` |
| **Milestones** | `list_milestones`, `create_milestone` |
| **Teams** | `list_teams`, `get_team`, `create_team`, `list_issue_statuses` |
| **Users** | `list_users`, `get_user`, `create_user` |
| **Labels** | `list_issue_labels`, `create_issue_label`, `update_issue_label`, `delete_issue_label` |
| **Cycles** | `list_cycles`, `get_cycle`, `create_cycle`, `update_cycle`, `delete_cycle` |
| **Comments** | `list_comments`, `create_comment`, `update_comment`, `delete_comment` |

See [API Reference](docs/api.md) for detailed documentation.

## Usage with MCP Clients

### Cursor (URL-based, recommended)

1. Start the server: `PORT=3334 npm run dev`
2. Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "linear-db": {
      "url": "http://localhost:3334/mcp"
    }
  }
}
```

### Claude Code (stdio-based)

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "linear-sqlite": {
      "command": "node",
      "args": ["/path/to/sqlite-mcp-server/dist/index.js"],
      "env": {
        "DB_PATH": "/path/to/sqlite-mcp-server/linear.db"
      }
    }
  }
}
```

## Example Queries

```sql
-- Active issues with assignee info
SELECT * FROM active_issues;

-- Issues with labels
SELECT * FROM issues_with_labels;

-- High priority issues
SELECT * FROM issues WHERE priority_value <= 2 ORDER BY priority_value ASC;

-- Issues blocked by another
SELECT * FROM issue_relations WHERE relation_type = 'blockedBy';
```

## Commands

```bash
# Initialize database
sqlite3 database.db < linear_schema.sql

# Verify schema
sqlite3 database.db ".schema"

# List all tables
sqlite3 database.db ".tables"
```

## Dependencies

- **better-sqlite3** - SQLite bindings
- **@modelcontextprotocol/sdk** - MCP protocol
- **zod** - Schema validation

## License

MIT