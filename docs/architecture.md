# Architecture

## Overview

Linear SQLite MCP is a local ticketing system that mimics Linear's data model, exposed via Model Context Protocol (MCP) for AI assistant integration.

```
┌─────────────────┐    HTTP/JSON    ┌──────────────────────┐
│   MCP Client    │ ◄────────────► │  MCP Server (Express)│
│ (Cursor/Claude) │                 │                      │
└─────────────────┘                 │  StreamableHTTP      │
                                    │  Transport           │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │   Tool Handlers      │
                                    │  issues, projects,   │
                                    │  teams, labels, ...  │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │   SQLite (linear.db) │
                                    │   better-sqlite3     │
                                    └──────────────────────┘
```

## Components

### 1. MCP Server (`src/index.ts`)

Entry point using `@modelcontextprotocol/sdk`:

```typescript
// Uses StreamableHTTPServerTransport with JSON response mode
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
  enableJsonResponse: true,  // Fast JSON responses
  onsessioninitialized: (sid) => { transports[sid] = transport; }
});
```

**Source**: `src/index.ts:111-118`

Key features:
- Session management with `mcp-session-id` header
- JSON response mode (not SSE) for fast responses
- DNS rebinding protection via `createMcpExpressApp()`

### 2. Tool Handlers (`src/tools/`)

Each module exports:
- `get*Tools()` - Tool definitions with input schemas
- `register*Tools()` - Handler implementations

```
src/tools/
├── base.ts      # Shared utilities, PRIORITY_MAP
├── issues.ts    # list_issues, get_issue, create_issue, update_issue
├── projects.ts  # list_projects, get_project, create_project, update_project
├── teams.ts     # list_teams, get_team, list_issue_statuses
├── users.ts     # list_users, get_user
├── labels.ts    # list_issue_labels, create_issue_label, update_issue_label, delete_issue_label
├── cycles.ts    # list_cycles, get_cycle, create_cycle, update_cycle, delete_cycle
├── comments.ts  # list_comments, create_comment, update_comment, delete_comment
└── types.ts     # Type definitions
```

### 3. Database Layer (`src/db.ts`)

Synchronous SQLite via `better-sqlite3`:

```typescript
import Database from "better-sqlite3";

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");  // Write-Ahead Logging
```

**Source**: `src/db.ts`

### 4. Schema (`src/schema.ts`, `linear_schema.sql`)

Entities:
| Table | Description |
|-------|-------------|
| `users` | Team members |
| `teams` | Organizations |
| `projects` | Projects within teams |
| `issues` | Core work items |
| `issue_statuses` | Backlog, Todo, In Progress, Done, Canceled |
| `issue_priorities` | None, Urgent, High, Normal, Low |
| `labels` | Issue labels with hierarchy |
| `cycles` | Sprints/iterations |
| `milestones` | Project milestones |
| `comments` | Issue comments |
| `issue_labels` | Many-to-many: issues ↔ labels |
| `issue_relations` | Blocks, blockedBy, related, duplicate |

**Source**: `linear_schema.sql`, `schema_diagram.md`

## Request Flow

```
1. Client POST /mcp with JSON-RPC request
2. Server checks mcp-session-id header
3. If new session: create StreamableHTTPServerTransport
4. Transport routes to Server.handleRequest()
5. Server matches method to handler (ListTools, CallTool)
6. Tool handler executes SQL query
7. Response returned as JSON
```

**Source**: `src/index.ts:99-162`

## Session Management

Sessions are stored in memory:

```typescript
const transports: Record<string, StreamableHTTPServerTransport> = {};
```

- Created on `initialize` request
- Reused via `mcp-session-id` header
- Cleaned up on DELETE /mcp or transport close

**Source**: `src/index.ts:88, 104-107, 172-190`
