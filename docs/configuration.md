# Configuration

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DB_PATH` | `<project>/linear.db` | SQLite database path |

Default DB_PATH resolves to `sqlite-mcp-server/linear.db` (relative to `src/`).

**Source**: `src/index.ts:194`, `src/db.ts:6`

## Example

```bash
PORT=3334 DB_PATH=/data/linear.db npm run dev
```

## Database Location

By default, `linear.db` is created in `sqlite-mcp-server/` directory.

To use a custom path:

```bash
DB_PATH=/custom/path/linear.db npm run init-db
DB_PATH=/custom/path/linear.db npm run dev
```

## Server Options

### Port Configuration

```bash
# Default port 3000
npm run dev

# Custom port
PORT=3334 npm run dev
```

### Development vs Production

```bash
# Development (hot reload via tsx)
npm run dev

# Production (compiled)
npm run build
npm start
```

## MCP Transport Settings

The server uses `StreamableHTTPServerTransport` with:

```typescript
{
  sessionIdGenerator: () => randomUUID(),
  enableJsonResponse: true  // Fast JSON instead of SSE
}
```

**Source**: `src/index.ts:111-115`

These settings are not configurable via environment variables.

## Default Data

After `npm run init-db`, the database contains:

### Teams
| ID | Name | Key |
|----|------|-----|
| `team_eng` | Engineering | `ENG` |
| `team_design` | Design | `DES` |

### Users
| ID | Name | Email |
|----|------|-------|
| `user_thinh` | Thinh Le | `thinh@test.com` |

### Issue Statuses
| Type | Name | Color |
|------|------|-------|
| `backlog` | Backlog | `#bec2c8` |
| `unstarted` | Todo | `#4EA7FC` |
| `started` | In Progress | `#5e6ad2` |
| `completed` | Done | `#5e6ad2` |
| `canceled` | Canceled | `#bec2c8` |
| `canceled` | Duplicate | `#bec2c8` |

### Issue Priorities
| Value | Name |
|-------|------|
| 0 | None |
| 1 | Urgent |
| 2 | High |
| 3 | Normal |
| 4 | Low |

**Source**: `src/init-db.ts`
