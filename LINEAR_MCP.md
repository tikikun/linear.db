# Linear SQLite MCP Tools Documentation

This document describes all available Linear MCP (Model Context Protocol) tools for interacting with a Linear-style ticketing system backed by SQLite. This is a local development tool that mirrors Linear's data model without requiring API access.

## Quick Start

```bash
cd sqlite-mcp-server
npm install
npm run build
npm start

# Server runs on http://localhost:3000/mcp
```

---

## Issues

### list_issues

List issues with optional filtering.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name, key, or ID |
| `project` | string | Project name or ID |
| `assignee` | string | User ID, name, email, or "me" |
| `state` | string | State type (backlog, unstarted, started, completed, canceled) or name |
| `label` | string | Label name or ID |
| `query` | string | Search in title or description |
| `orderBy` | string | "createdAt" or "updatedAt" |
| `limit` | number | Max results |
| `includeArchived` | boolean | Include archived (default: false) |

**Example:**
```json
{ "team": "Engineering", "assignee": "me", "state": "started", "limit": 20 }
```

---

### get_issue

Get a single issue by ID or identifier (e.g., "ENG-123").

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Issue ID or identifier |
| `includeRelations` | boolean | Include blocking/related relations |

**Example:**
```json
{ "id": "ENG-1", "includeRelations": true }
```

---

### create_issue

Create a new issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | **Required.** Issue title |
| `team` | string | **Required.** Team name or ID |
| `description` | string | Issue description (Markdown) |
| `project` | string | Project name or ID |
| `assignee` | string | User ID, name, email, or "me" |
| `priority` | number | 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low |
| `state` | string | State name (Backlog, Todo, In Progress, Done) |
| `labels` | string[] | Label names or IDs |
| `estimate` | number | Story points |
| `due_date` | string | Due date (ISO format) |
| `blocks` | string[] | Issue IDs this issue blocks |
| `blocked_by` | string[] | Issue IDs blocking this issue |
| `related_to` | string[] | Related issue IDs |

**Example:**
```json
{
  "title": "Implement user authentication",
  "team": "Engineering",
  "description": "## Requirements\n- OAuth 2.0 support\n- JWT tokens",
  "priority": 2,
  "labels": ["backend", "security"],
  "estimate": 5
}
```

---

### update_issue

Update an existing issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Issue ID or identifier |
| `title` | string | New title |
| `description` | string | New description |
| `assignee` | string \| null | User ID, name, email, "me", or null to remove |
| `priority` | number | 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low |
| `state` | string | State name or ID |
| `labels` | string[] | New label list |
| `estimate` | number | Story points |
| `due_date` | string | Due date (ISO format) |

**Example:**
```json
{
  "id": "ENG-1",
  "title": "Updated: User authentication",
  "assignee": "jane@company.com",
  "state": "In Progress",
  "priority": 1
}
```

---

## Projects

### list_projects

List projects with optional filtering.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name or ID |
| `state` | string | Project state |
| `query` | string | Search project name |
| `member` | string | Filter by team lead |
| `limit` | number | Max results |
| `includeArchived` | boolean | Include archived |

---

### get_project

Get a single project by ID or name.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** Project ID or name |
| `includeMilestones` | boolean | Include milestones |

---

### create_project

Create a new project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | **Required.** Project name |
| `team` | string | **Required.** Team name or ID |
| `description` | string | Project description |
| `icon` | string | Icon emoji |
| `color` | string | Hex color |
| `state` | string | Project state (default: "started") |
| `priority` | number | 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low |
| `lead` | string | User ID, name, email, or "me" |

---

### update_project

Update an existing project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Project ID or name |
| `name` | string | New project name |
| `description` | string | New description |
| `state` | string | Project state |
| `lead` | string \| null | User or null to remove |

---

### list_milestones

List milestones for a project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | **Required.** Project name or ID |

---

### create_milestone

Create a new milestone.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | **Required.** Project name or ID |
| `name` | string | **Required.** Milestone name |
| `description` | string | Milestone description |
| `target_date` | string | Target date (ISO format) |

---

## Teams

### list_teams

List all teams.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search by name or key |
| `limit` | number | Max results |
| `includeArchived` | boolean | Include archived |

---

### get_team

Get a team by ID, key, or name.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** Team UUID, key, or name |

---

### list_issue_statuses

List available issue statuses in a team.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | **Required.** Team name, key, or ID |

---

## Labels

### list_issue_labels

List issue labels in a workspace or team.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name or ID |
| `name` | string | Filter by label name |
| `limit` | number | Max results |

---

### create_issue_label

Create a new issue label.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | **Required.** Label name |
| `team` | string | Team name or ID |
| `color` | string | Hex color code (default: "#999999") |
| `description` | string | Label description |

---

## Cycles (Sprints)

### list_cycles

List cycles (sprints) for a team.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | **Required.** Team name or ID |
| `type` | string | "current", "previous", or "next" |

---

## Users

### list_users

List all users.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Filter by name or email |
| `limit` | number | Max results |

---

### get_user

Get a user by ID, name, email, or "me".

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** User ID, name, email, or "me" |

---

## Comments

### list_comments

List comments for an issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `issue_id` | string | **Required.** Issue ID or identifier |

---

### create_comment

Create a comment on an issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `issue_id` | string | **Required.** Issue ID or identifier |
| `body` | string | **Required.** Comment content (Markdown) |
| `parent_id` | string | Parent comment ID for replies |

---

## Common Patterns

### Assignee Options

For any field accepting a user reference:
- **User ID**: Full UUID
- **Name**: User's display name
- **Email**: User's email
- **"me"**: Refers to the first user in the database

### Date Formats

All date parameters accept ISO-8601 format:
- **Specific date**: `"2024-03-15"`
- **With time**: `"2024-03-15T10:30:00Z"`

### Status Types

| Type | Description |
|------|-------------|
| `backlog` | Low priority, not yet planned |
| `unstarted` | Ready to work on |
| `started` | Currently in progress |
| `completed` | Finished |
| `canceled` | Cancelled or not pursued |

### Priority Values

| Value | Name |
|-------|------|
| 0 | None |
| 1 | Urgent |
| 2 | High |
| 3 | Normal |
| 4 | Low |

---

## Database Location

The SQLite database is stored at `sqlite-mcp-server/linear.db`. You can query it directly:

```bash
sqlite3 sqlite-mcp-server/linear.db "SELECT * FROM issues LIMIT 10;"
```