# Installation Guide

## Prerequisites

- **Node.js**: v20+ (required for `better-sqlite3` native module)
- **npm**: v9+

## Quick Start

```bash
cd sqlite-mcp-server
npm install
npm run init-db
PORT=3334 npm run dev
```

Server starts at `http://localhost:3334/mcp`

## Step-by-Step

### 1. Clone Repository

```bash
git clone https://github.com/thinhlpg/linear.db.git
cd linear.db/sqlite-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `@modelcontextprotocol/sdk` - MCP protocol SDK
- `better-sqlite3` - SQLite bindings (requires Node.js native build)
- `zod` - Schema validation

**Source**: `package.json:13-17`

### 3. Initialize Database

```bash
npm run init-db
```

Creates `linear.db` with:
- Default teams (Engineering, Design)
- Default user
- Issue statuses (Backlog, Todo, In Progress, Done, Canceled, Duplicate)
- Issue priorities (None, Urgent, High, Normal, Low)

**Source**: `src/init-db.ts`

### 4. Start Server

```bash
# Development (hot reload)
PORT=3334 npm run dev

# Production
npm run build
PORT=3334 npm start
```

### 5. Verify

```bash
curl http://localhost:3334/health
# {"status":"ok","server":"linear-sqlite-mcp"}
```

## MCP Client Configuration

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "linear-db": {
      "url": "http://localhost:3334/mcp"
    }
  }
}
```

**Important**: Server must be running before Cursor connects.

### Claude Code

Add to MCP configuration:

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

## Native Module Issues

If you see `NODE_MODULE_VERSION` errors:

```bash
npm rebuild better-sqlite3
```

This recompiles `better-sqlite3` for your Node.js version.

**Source**: Error handling for `ERR_DLOPEN_FAILED`
