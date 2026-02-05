# Linear SQLite MCP Server

A Model Context Protocol (MCP) server that provides a Linear-style ticketing system backed by SQLite. This project enables AI assistants to interact with a local SQLite database using Linear's data model and terminology.

## Overview

This server provides MCP tools for managing issues, projects, teams, labels, cycles, users, and comments through a Linear-like interface. The database schema is reverse-engineered from Linear's data model and designed for local development, testing, and prototyping.

### Features

- **Linear-compatible data model**: Issues, projects, teams, labels, cycles, milestones
- **MCP tools**: Full CRUD operations for all entities
- **SQLite storage**: Lightweight, portable database with WAL mode for concurrency
- **Views and triggers**: Active issues view, automatic timestamp updates

## Installation

```bash
cd sqlite-mcp-server
npm install
```

## Database Initialization

Initialize the SQLite database with the Linear schema:

```bash
npm run init-db
```

This creates `linear.db` in the project directory. You can use a custom path:

```bash
DB_PATH=/path/to/your/database.db npm run init-db
```

## Running the Server

### Development Mode

```bash
npm run dev
```

Runs the server using `tsx` with hot reload support.

### Production Mode

```bash
npm run build
npm start
```

Builds the TypeScript and starts the Node.js server.

The server runs at: `http://localhost:3000/mcp`

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `linear.db` in project root | Path to SQLite database file |
| `PORT` | `3000` | HTTP server port |

## MCP Tools

### Issues

| Tool | Description |
|------|-------------|
| `list_issues` | List issues with filtering by team, project, assignee, state, label |
| `get_issue` | Get a single issue by ID |
| `create_issue` | Create a new issue |
| `update_issue` | Update an existing issue |

### Projects

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects |
| `get_project` | Get a single project by ID |
| `create_project` | Create a new project |

### Teams

| Tool | Description |
|------|-------------|
| `list_teams` | List all teams |
| `get_team` | Get a single team by ID |

### Users

| Tool | Description |
|------|-------------|
| `list_users` | List all users |
| `get_user` | Get a single user by ID |

### Labels

| Tool | Description |
|------|-------------|
| `list_labels` | List labels for a team |
| `create_label` | Create a new label |

### Cycles

| Tool | Description |
|------|-------------|
| `list_cycles` | List cycles for a team (current, previous, next) |

### Comments

| Tool | Description |
|------|-------------|
| `list_comments` | List comments for an issue |
| `create_comment` | Add a comment to an issue |

## Database Schema

```
users           - Users and team members
teams           - Teams/organizations
initiatives     - High-level goals containing projects
projects        - Projects belonging to a team
labels          - Issue labels (supports hierarchy via parent_id)
issue_statuses  - Statuses: backlog, unstarted, started, completed, canceled
issue_priorities - Priorities: None, Urgent, High, Normal, Low
cycles          - Sprints/time-boxed work periods
milestones      - Project milestones
issues          - Core work items
issue_labels    - Many-to-many issue-label relationships
issue_relations - Issue relationships (blocks, blockedBy, related, duplicate)
attachments     - File attachments on issues
documents       - Project/initiative documentation
comments        - Comments on issues
```

### Views

- `active_issues` - Issues not in completed or canceled status with joined user/project/team data
- `issues_with_labels` - Issues with aggregated label names

### Triggers

Automatic `updated_at` timestamp updates for: users, teams, projects, issues, documents, comments

## Example Usage

```typescript
// List all active issues for a team
await mcp.callTool("list_issues", {
  team: "Engineering",
  state: "started"
});

// Create a new issue
await mcp.callTool("create_issue", {
  team: "Engineering",
  project: "Website",
  title: "Fix login bug",
  description: "Users cannot log in with SSO",
  priority: "Urgent",
  assignee: "john@example.com"
});
```

## API Endpoints

- `GET /health` - Health check
- `POST /mcp` - MCP protocol endpoint (Streamable HTTP)

## License

MIT