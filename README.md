# Linear.DB

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

A Linear-style, agentic project management system powered by SQLite with MCP integration for AI assistants.

[Why Linear.DB?](docs/why.md) • [Features](#features) • [Quick Start](#quick-start) • [API Reference](docs/api.md)

</div>

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone and install
git clone https://github.com/tikikun/linear.db.git
cd linear.db/sqlite-mcp-server
npm install
npm run init-db

# Start the MCP server
npm run dev
```

The server runs at `http://localhost:3000/mcp` using Streamable HTTP transport.

### Connect to Claude Code

```bash
claude mcp add linear-sqlite --url http://localhost:3000/mcp
```

### Connect to Cursor

Add to `~/.cursor/settings.json`:

```json
{
  "mcpServers": {
    "linear-sqlite": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

---

## Features

- **29 MCP Tools** - Full ticketing operations (issues, projects, teams, cycles, labels, comments)
- **Streamable HTTP transport** - Remote server accessible via HTTP
- **Multi-team support** - Projects, cycles, labels, and relations
- **Normalized SQLite schema** - Mirrors Linear's data model
- **Zero dependencies** - Just Node.js and SQLite

---

## Project Structure

```
linear.db/
├── linear_schema.sql          # SQLite schema definition
├── schema_diagram.md          # Entity relationship diagram
├── docs/
│   ├── why.md                 # Philosophy and use cases
│   ├── api.md                 # Complete tool documentation
│   └── architecture.md        # System design
└── sqlite-mcp-server/
    ├── linear.db              # SQLite database
    └── src/
        └── tools/             # MCP tool implementations
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Why Linear.DB?](docs/why.md) | Problem statement and observability |
| [API Reference](docs/api.md) | Complete tool documentation |
| [Architecture](docs/architecture.md) | System design and components |
| [Schema](schema_diagram.md) | Entity relationship diagram |

---

## Technologies

- **better-sqlite3** - SQLite bindings
- **@modelcontextprotocol/sdk** - MCP protocol with Streamable HTTP support
- **zod** - Schema validation
- **TypeScript** - Type safety

---

MIT License