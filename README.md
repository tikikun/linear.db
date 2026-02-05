# Linear.DB

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

A Linear-style, agentic project management system powered by SQLite with an MCP (Model Context Protocol) server for seamless AI assistant integration.

![Demo](linear-sqlite-mcp-demo.png)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API Reference](docs/api.md)

</div>

---

## The Problem

Coding agents like Claude Code and Cursor are powerful, but they struggle to stay aligned on a project. Without a shared source of truth:

- **Context drift** - Each new session forgets previous decisions and direction
- **No persistent memory** - Trade-offs, architectural choices, and task progress are lost
- **Scattered tracking** - Tasks live in chat, not in a structured system the agent can reference
- **Disconnected workflows** - The agent can't see what work is in progress or completed

## What is Linear.DB?

Linear.DB is a **self-hosted, Linear-style project management system** designed specifically for AI agents. It provides:

- **Persistent project memory** - Architectural decisions, trade-offs, and direction survive across sessions
- **Structured task tracking** - Issues, cycles, and milestones the agent can query and update
- **MCP-powered integration** - Full CRUD access via the Model Context Protocol
- **Zero infrastructure** - Runs locally with just Node.js and SQLite

### Full Human Observability

When running a swarm of coding agents, transparency is critical. Linear.DB gives you:

- **Complete audit trail** - See every issue created, updated, and completed by your agents
- **Work visible to humans** - All task state lives in a structured database you can query anytime
- **Agent coordination insight** - Track which agent is working on what, cycle progress, and blockers
- **Swarm transparency** - Multiple agents working in parallel leave a clear trail you can follow

Perfect for:
- **Agentic development** - Give your AI a shared source of truth it can query and update
- **Multi-agent orchestration** - Run swarms with full visibility into their coordination
- **Local development** - No API rate limits or external dependencies
- **Offline scenarios** - Everything runs on your machine
- **Learning MCP patterns** - Well-documented Streamable HTTP transport implementation

## Features

- **29 MCP Tools** for full ticketing operations
- **Normalized SQLite schema** mirroring Linear's data model
- **Streamable HTTP transport** - run as a remote server accessible via HTTP
- **Multi-team support** with projects, cycles, labels, and relations
- **AI-ready** - designed for Claude Code, Cursor, and other MCP clients
- **Zero dependencies** - runs with Node.js and SQLite

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tikikun/linear.db.git
cd linear.db

# Install dependencies and initialize database
cd sqlite-mcp-server
npm install
npm run init-db

# Start the MCP server (development mode)
npm run dev
```

The server will start at `http://localhost:3000/mcp`.

### Connect to Claude Code

Start the server first, then add it using the Claude Code CLI:

```bash
# Start the MCP server (in a separate terminal)
npm run dev
```

Then connect Claude Code:

```bash
claude mcp add linear-sqlite --url http://localhost:3000/mcp
```

### Connect to Cursor

Add to your Cursor settings (`~/.cursor/settings.json`):

```json
{
  "mcpServers": {
    "linear-sqlite": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Project Structure

```
linear.db/
├── linear_schema.sql          # SQLite schema definition
├── schema_diagram.md          # Entity relationship diagram
├── README.md                  # This file
├── sqlite-mcp-server/         # MCP server implementation
│   ├── README.md              # Server documentation
│   ├── linear.db              # SQLite database (after init)
│   ├── package.json
│   └── src/
│       ├── index.ts           # MCP server entry point (Streamable HTTP)
│       ├── init-db.ts         # Database initialization
│       ├── schema.ts          # Schema definitions
│       ├── db.ts              # Database utilities
│       └── tools/             # MCP tool implementations
│           ├── base.ts
│           ├── issues.ts
│           ├── projects.ts
│           ├── teams.ts
│           ├── users.ts
│           ├── labels.ts
│           ├── cycles.ts
│           └── comments.ts
```

## Database Schema

The project uses a normalized SQLite schema that mimics Linear's data model:

| Entity | Description |
|--------|-------------|
| `users` | Team members |
| `teams` | Teams/organizations |
| `initiatives` | High-level goals |
| `projects` | Projects within teams |
| `labels` | Issue labels with hierarchy support |
| `issue_statuses` | Backlog, Todo, In Progress, Done, Canceled |
| `cycles` | Sprints/time-boxed work periods |
| `milestones` | Project milestones |
| `issues` | Core work items |
| `issue_labels` | Many-to-many relationships |
| `issue_relations` | Blocks, blockedBy, related, duplicate |
| `attachments` | File attachments |
| `documents` | Project/initiative docs |
| `comments` | Issue comments |

See `schema_diagram.md` for the entity relationship diagram.

## Available MCP Tools

### Issues

| Tool | Description |
|------|-------------|
| `list_issues` | List issues with filtering options |
| `get_issue` | Get a single issue by ID |
| `create_issue` | Create a new issue |
| `update_issue` | Update an existing issue |

### Projects

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects |
| `get_project` | Get a single project |
| `create_project` | Create a new project |
| `update_project` | Update a project |

### Teams

| Tool | Description |
|------|-------------|
| `list_teams` | List all teams |
| `get_team` | Get team details |
| `create_team` | Create a new team |
| `list_issue_statuses` | Get statuses for a team |

### And more...

- **Users** - list_users, get_user, create_user
- **Labels** - list_issue_labels, create_issue_label, update_issue_label, delete_issue_label
- **Cycles** - list_cycles, get_cycle, create_cycle, update_cycle, delete_cycle
- **Comments** - list_comments, create_comment, update_comment, delete_comment

See [API Reference](docs/api.md) for complete documentation.

## Example Usage

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

## Documentation

| Document | Description |
|----------|-------------|
| [Installation](docs/installation.md) | Setup guide, dependencies, MCP client config |
| [Architecture](docs/architecture.md) | System design, components, request flow |
| [API Reference](docs/api.md) | Complete tool documentation |
| [Configuration](docs/configuration.md) | Environment variables, default data |
| [E2E Testing](docs/e2e-testing.md) | End-to-end testing workflow |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |

## Technologies

- **better-sqlite3** - SQLite bindings
- **@modelcontextprotocol/sdk** - MCP protocol with Streamable HTTP support
- **zod** - Schema validation
- **TypeScript** - Type safety

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with care by the community
</div>