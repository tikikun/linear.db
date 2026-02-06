# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Linear-style ticketing system powered by SQLite with an MCP server for AI assistants. The server exposes 29 MCP tools for managing issues, projects, teams, labels, cycles, and comments.

## Building the Project

```bash
cd sqlite-mcp-server

# Install dependencies
npm install

# Initialize the SQLite database from schema
npm run init-db

# Development (uses tsx for hot reload)
npm run dev

# Build TypeScript to dist/
npm run build

# Run production server
npm start
```

## Running the Server

The server uses Streamable HTTP with JSON response mode. By default, it listens on `http://localhost:3000/mcp`.

**Development mode (recommended for hacking):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Once the server is running, add it to Claude Code:
```bash
claude mcp add linear_db http://localhost:3000/mcp
```

## Architecture

```
sqlite-mcp-server/src/
├── index.ts           # Express + MCP server, session management, routes
├── schema.ts          # Database initialization from linear_schema.sql
├── db.ts              # SQLite connection (better-sqlite3)
└── tools/
    ├── base.ts        # Shared utilities (getTeamId, getIssueId, PRIORITY_MAP)
    ├── issues.ts      # Issue CRUD tools
    ├── projects.ts    # Project CRUD tools
    ├── teams.ts       # Team CRUD tools
    ├── labels.ts      # Label CRUD tools
    ├── cycles.ts      # Cycle CRUD tools
    ├── comments.ts    # Comment CRUD tools
    └── users.ts       # User CRUD tools
```

### Tool Module Pattern

Each tool module follows this pattern:
1. `get[Entity]Tools()` - returns array of MCP tool definitions
2. `register[Entity]Tools(registerHandler)` - registers handlers with the server

See `issues.ts` for the complete pattern with SQL query building and foreign key resolution.

### Database Schema

The schema is defined in `linear_schema.sql` at the project root. Key tables:
- `users` - referenced by `projects.lead`, `issues.assignee`, `initiatives.owner`
- `teams` - scope for projects, issues, labels, cycles
- `projects` - belong to a team, contain issues and milestones
- `issues` - core work items with denormalized `priority_value` for sorting
- `cycles` - sprints/time-boxed work, team-scoped
- `labels` - self-referencing `parent_id` for hierarchy

### Connecting to Claude Code

Start the server first, then add it to Claude Code:

```bash
cd sqlite-mcp-server
npm run dev
```

Then in your terminal, add the MCP server:

```bash
claude mcp add linear_db http://localhost:3000/mcp
```

## MCP Server Transport

Uses Streamable HTTP with JSON response mode (not SSE). Server endpoint: `http://localhost:3000/mcp`

## MCP Tools Reference

All tools accept entity IDs or names/keys. Helper functions in `base.ts` resolve names to IDs:
- `getTeamId(team)` - finds by id, name, or key
- `getUserId(user)` - finds by id, email, name, or 'me'
- `getProjectId(project, teamId?)` - finds by id or name
- `getIssueId(issue)` - finds by id or identifier (e.g., "ENG-123")
- `getLabelId(label, teamId?)` - finds by id or name

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database file path (default: `sqlite-mcp-server/linear.db`)