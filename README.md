# Linear SQLite Project

A local Linear-style ticketing system using SQLite, featuring an MCP (Model Context Protocol) server for AI assistant integration.

## Project Structure

```
/
├── linear_schema.sql          # SQLite schema definition
├── schema_diagram.md          # Entity relationship diagram
├── README.md                  # This file
└── sqlite-mcp-server/         # MCP server implementation
    ├── README.md              # Server documentation
    ├── linear.db              # SQLite database (after init)
    ├── package.json
    ├── src/
    │   ├── index.ts           # MCP server entry point
    │   ├── init-db.ts         # Database initialization
    │   ├── schema.ts          # Schema definitions
    │   ├── db.ts              # Database utilities
    │   └── tools/             # MCP tool implementations
    │       ├── base.ts
    │       ├── issues.ts
    │       ├── projects.ts
    │       ├── teams.ts
    │       ├── users.ts
    │       ├── labels.ts
    │       ├── cycles.ts
    │       └── comments.ts
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

## MCP Tools

Available tools for AI assistants:

- **Issues**: list_issues, get_issue, create_issue, update_issue
- **Projects**: list_projects, get_project, create_project
- **Teams**: list_teams, get_team
- **Users**: list_users, get_user
- **Labels**: list_labels, create_label
- **Cycles**: list_cycles
- **Comments**: list_comments, create_comment

See `sqlite-mcp-server/README.md` for detailed tool documentation.

## Usage with Claude Code

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