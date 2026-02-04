# Linear MCP Tools Documentation

This document describes all available Linear MCP (Model Context Protocol) tools for interacting with Linear's issue tracking system programmatically.

## Overview

The Linear MCP tools provide full access to Linear's data model including:
- **Issues** - Create, read, update, and manage issues
- **Projects** - Project management and milestones
- **Teams** - Team configuration and members
- **Labels** - Issue labeling system
- **Cycles** - Sprint/iteration management
- **Initiatives** - High-level goal tracking
- **Documents** - Documentation attached to issues/projects
- **Comments** - Issue discussions
- **Attachments** - File attachments
- **Relations** - Issue dependencies (blocks, blockedBy, related)

---

## Issues

### list_issues

List issues in the Linear workspace with filtering options.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name or ID to filter by |
| `project` | string | Project name or ID to filter by |
| `assignee` | string | User ID, name, email, or "me" |
| `state` | string | State type, name, or ID (backlog, unstarted, started, completed, canceled) |
| `cycle` | string | Cycle name, number, or ID |
| `label` | string | Label name or ID |
| `query` | string | Search issue title or description |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor for next page |
| `includeArchived` | boolean | Include archived items (default: true) |
| `parentId` | string | Parent issue ID for sub-issues |

**Example:**
```json
{
  "team": "Engineering",
  "assignee": "me",
  "state": "started",
  "limit": 20
}
```

---

### get_issue

Retrieve detailed information about a specific issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Issue ID (e.g., "ENG-123") |
| `includeRelations` | boolean | Include blocking/related/duplicate relations (default: false) |

**Example:**
```json
{
  "id": "ENG-456",
  "includeRelations": true
}
```

---

### create_issue

Create a new Linear issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | **Required.** Issue title |
| `team` | string | **Required.** Team name or ID |
| `description` | string | Issue description (Markdown supported) |
| `project` | string | Project name or ID |
| `assignee` | string | User ID, name, email, or "me" |
| `priority` | number | Priority: 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low |
| `state` | string | State type, name, or ID |
| `labels` | string[] | Label names or IDs |
| `cycle` | string | Cycle name, number, or ID |
| `milestone` | string | Milestone name or ID |
| `estimate` | number | Story points/estimate value |
| `dueDate` | string | Due date (ISO format) |
| `parentId` | string | Parent issue ID (for sub-issues) |
| `blocks` | string[] | Issue IDs this issue blocks |
| `blockedBy` | string[] | Issue IDs blocking this issue |
| `relatedTo` | string[] | Related issue IDs |
| `duplicateOf` | string | Duplicate of issue ID |
| `links` | object[] | Link attachments: `[{url, title}]` |
| `delegate` | string | Agent name or ID for delegation |

**Example:**
```json
{
  "title": "Implement user authentication",
  "team": "Engineering",
  "project": "Backend API",
  "description": "## Requirements\n- OAuth 2.0 support\n- JWT tokens\n- Session management",
  "assignee": "john@company.com",
  "priority": 2,
  "labels": ["backend", "security"],
  "estimate": 5
}
```

---

### update_issue

Update an existing Linear issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Issue ID |
| `title` | string | New issue title |
| `description` | string | New description (Markdown) |
| `assignee` | string \| null | User ID, name, email, "me", or null to remove |
| `state` | string | State type, name, or ID |
| `priority` | number | Priority: 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low |
| `labels` | string[] | Label names or IDs |
| `estimate` | number | Story points |
| `dueDate` | string | Due date (ISO format) |
| `cycle` | string | Cycle name, number, or ID |
| `milestone` | string | Milestone name or ID |
| `parentId` | string \| null | Parent issue ID or null to remove |
| `blocks` | string[] | Issues this blocks (replaces existing) |
| `blockedBy` | string[] | Issues blocking this (replaces existing) |
| `relatedTo` | string[] | Related issues (replaces existing) |
| `duplicateOf` | string \| null | Duplicate of issue ID or null to remove |
| `links` | object[] | Link attachments: `[{url, title}]` |
| `team` | string | Team name or ID |
| `project` | string | Project name or ID |
| `delegate` | string \| null | Agent or null to remove |
| `description` | string | Content as Markdown |
| `archivedAt` | string | Archive date |
| `completedAt` | string | Completion date |
| `canceledAt` | string | Cancellation date |

**Example:**
```json
{
  "id": "ENG-456",
  "title": "Update: User authentication implementation",
  "assignee": "jane@company.com",
  "state": "In Progress",
  "priority": 1
}
```

---

### list_issue_labels

List available issue labels in a workspace or team.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name or ID to filter by |
| `name` | string | Filter by label name |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |

---

### create_issue_label

Create a new issue label.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | **Required.** Label name |
| `teamId` | string | Team UUID (omit for workspace label) |
| `color` | string | Hex color code (e.g., "#FF5733") |
| `description` | string | Label description |
| `isGroup` | boolean | Is label group (default: false) |
| `parentId` | string | Parent label group UUID |

---

### list_issue_statuses

List available issue statuses in a Linear team.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | **Required.** Team name or ID |

---

### get_issue_status

Retrieve detailed information about an issue status.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Status ID |
| `name` | string | **Required.** Status name |
| `team` | string | **Required.** Team name or ID |

---

## Comments

### list_comments

List comments for a specific Linear issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `issueId` | string | **Required.** Issue ID to get comments for |

---

### create_comment

Create a comment on a specific Linear issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `issueId` | string | **Required.** Issue ID |
| `body` | string | **Required.** Comment content (Markdown supported) |
| `parentId` | string | Parent comment ID (for replies/threads) |

**Example:**
```json
{
  "issueId": "ENG-456",
  "body": "Great progress! Just a few suggestions:\n1. Add error handling\n2. Write unit tests",
  "parentId": "comment-abc123"
}
```

---

## Attachments

### get_attachment

Retrieve an attachment's content by ID.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Attachment ID |

---

### create_attachment

Upload a file attachment to an issue.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `issue` | string | **Required.** Issue ID or identifier |
| `filename` | string | **Required.** Filename for the upload |
| `base64Content` | string | **Required.** Base64-encoded file content |
| `contentType` | string | **Required.** MIME type (e.g., "image/png", "application/pdf") |
| `title` | string | Optional title for the attachment |
| `subtitle` | string | Optional subtitle for the attachment |

---

### delete_attachment

Delete an attachment by ID.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Attachment ID |

---

### extract_images

Extract and fetch images from markdown content (issue descriptions, comments, documents).

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `markdown` | string | **Required.** Markdown content containing image references |

---

## Projects

### list_projects

List projects in the Linear workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name or ID to filter by |
| `state` | string | Project state type, name, or ID |
| `query` | string | Search project name |
| `member` | string | User ID, name, email, or "me" |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |
| `includeArchived` | boolean | Include archived items (default: false) |
| `includeMilestones` | boolean | Include milestones (default: false) |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `initiative` | string | Initiative name or ID |
| `createdAt` | string | Filter: ISO-8601 date/duration (e.g., "-P1D") |
| `updatedAt` | string | Filter: ISO-8601 date/duration |

---

### get_project

Retrieve details of a specific project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** Project ID or name |
| `includeMilestones` | boolean | Include milestones (default: false) |

---

### create_project

Create a new project in Linear.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | **Required.** Project name |
| `team` | string | **Required.** Team name or ID |
| `description` | string | Project description (Markdown) |
| `icon` | string | Icon emoji (e.g., ":eagle:") |
| `color` | string | Hex color |
| `state` | string | Project state |
| `priority` | number | Priority: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low |
| `startDate` | string | Start date (ISO format) |
| `targetDate` | string | Target date (ISO format) |
| `lead` | string | User ID, name, email, or "me" |
| `labels` | string[] | Label names or IDs |
| `summary` | string | Short summary (max 255 chars) |
| `initiative` | string | Initiative name or ID |

---

### update_project

Update an existing project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Project ID |
| `name` | string | New project name |
| `description` | string | New description (Markdown) |
| `icon` | string | Icon emoji |
| `color` | string | Hex color |
| `state` | string | Project state |
| `priority` | number | Priority: 0-4 |
| `startDate` | string | Start date (ISO format) |
| `targetDate` | string | Target date (ISO format) |
| `lead` | string \| null | User ID, name, email, "me", or null to remove |
| `labels` | string[] | Label names or IDs |
| `initiatives` | string[] | Initiative IDs or names |
| `summary` | string | Short summary (max 255 chars) |

---

### list_project_labels

List available project labels in the workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Filter by label name |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |

---

## Milestones

### list_milestones

List all milestones in a Linear project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | **Required.** Project name or ID |

---

### get_milestone

Retrieve details of a specific milestone.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | **Required.** Project name or ID |
| `query` | string | **Required.** Milestone name or ID |

---

### create_milestone

Create a new milestone in a Linear project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | **Required.** Project name or ID |
| `name` | string | **Required.** Milestone name |
| `description` | string | Milestone description |
| `targetDate` | string | Target completion date (ISO format) |

---

### update_milestone

Update an existing milestone.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | **Required.** Project name or ID |
| `id` | string | **Required.** Milestone name or ID |
| `name` | string | New milestone name |
| `description` | string | New description |
| `targetDate` | string \| null | Target date or null to remove |

---

## Cycles (Sprints)

### list_cycles

Retrieve cycles for a specific Linear team.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | **Required.** Team ID |
| `type` | string | Filter: `current`, `previous`, `next` (default: all) |

---

## Teams

### list_teams

List teams in the Linear workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search query |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |
| `includeArchived` | boolean | Include archived items (default: false) |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `createdAt` | string | Filter: ISO-8601 date/duration |
| `updatedAt` | string | Filter: ISO-8601 date/duration |

---

### get_team

Retrieve details of a specific Linear team.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** Team UUID, key, or name |

---

## Users

### list_users

Retrieve users in the Linear workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Filter by name or email |
| `team` | string | Team name or ID to filter by |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |

---

### get_user

Retrieve details of a specific Linear user.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** User ID, name, email, or "me" |

---

## Initiatives

### list_initiatives

List initiatives in the Linear workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search initiative name |
| `status` | string | Initiative status (Planned, Active, Completed) |
| `owner` | string | User ID, name, email, or "me" |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |
| `includeArchived` | boolean | Include archived items (default: false) |
| `includeProjects` | boolean | Include projects (default: false) |
| `includeSubInitiatives` | boolean | Include sub-initiatives (default: false) |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `createdAt` | string | Filter: ISO-8601 date/duration |
| `updatedAt` | string | Filter: ISO-8601 date/duration |

---

### get_initiative

Retrieve detailed information about a specific initiative.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** Initiative ID or name |
| `includeProjects` | boolean | Include projects (default: false) |
| `includeSubInitiatives` | boolean | Include sub-initiatives (default: false) |

---

### create_initiative

Create a new initiative in Linear.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | **Required.** Initiative name |
| `description` | string | Initiative description (Markdown) |
| `icon` | string | Icon emoji or name |
| `color` | string | Hex color |
| `status` | string | Initiative status (Planned, Active, Completed) |
| `owner` | string | User ID, name, email, or "me" |
| `targetDate` | string | Target date (ISO format) |

---

### update_initiative

Update an existing Linear initiative.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Initiative ID |
| `name` | string | New initiative name |
| `description` | string | New description (Markdown) |
| `icon` | string | Icon emoji or name |
| `color` | string | Hex color |
| `status` | string | Initiative status (Planned, Active, Completed) |
| `owner` | string \| null | User ID, name, email, "me", or null to remove |
| `parentInitiative` | string \| null | Parent initiative or null to remove |
| `targetDate` | string | Target date (ISO format) |

---

## Initiative/Project Updates

### list_initiative_updates

List initiative updates in the workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `initiative` | string | Initiative name or ID |
| `user` | string | User ID, name, email, or "me" |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |
| `includeArchived` | boolean | Include archived items (default: false) |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `createdAt` | string | Filter: ISO-8601 date/duration |
| `updatedAt` | string | Filter: ISO-8601 date/duration |

---

### get_initiative_update

Retrieve a specific initiative update by ID.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Initiative update ID |

---

### create_initiative_update

Create a new initiative update.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `initiative` | string | **Required.** Initiative name or ID |
| `body` | string | **Required.** Content as Markdown |
| `health` | string | Health status: `onTrack`, `atRisk`, `offTrack` |
| `isDiffHidden` | boolean | Hide diff with previous update (default: false) |

---

### update_initiative_update

Update an existing initiative update.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Initiative update ID |
| `body` | string | New content as Markdown |
| `health` | string | Health status: `onTrack`, `atRisk`, `offTrack` |
| `isDiffHidden` | boolean | Hide diff with previous update |

---

### delete_initiative_update

Delete (archive) an existing initiative update.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Initiative update ID |

---

### list_project_updates

List project updates in the workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | Project name or ID |
| `user` | string | User ID, name, email, or "me" |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |
| `includeArchived` | boolean | Include archived items (default: false) |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `createdAt` | string | Filter: ISO-8601 date/duration |
| `updatedAt` | string | Filter: ISO-8601 date/duration |

---

### get_project_update

Retrieve a specific project update by ID.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Project update ID |

---

### create_project_update

Create a new project update.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | **Required.** Project name or ID |
| `body` | string | **Required.** Content as Markdown |
| `health` | string | Health status: `onTrack`, `atRisk`, `offTrack` |
| `isDiffHidden` | boolean | Hide diff with previous update (default: false) |

---

### update_project_update

Update an existing project update.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Project update ID |
| `body` | string | New content as Markdown |
| `health` | string | Health status: `onTrack`, `atRisk`, `offTrack` |
| `isDiffHidden` | boolean | Hide diff with previous update |

---

## Documents

### list_documents

List documents in the workspace.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project` | string | Project name or ID to filter by |
| `initiative` | string | Initiative ID to filter by |
| `creatorId` | string | Filter by creator ID |
| `query` | string | Search query |
| `orderBy` | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`) |
| `limit` | number | Max results 1-250 (default: 50) |
| `cursor` | string | Pagination cursor |
| `includeArchived` | boolean | Include archived items (default: false) |
| `createdAt` | string | Filter: ISO-8601 date/duration (e.g., "-P1D") |
| `updatedAt` | string | Filter: ISO-8601 date/duration (e.g., "-P1D") |

---

### get_document

Retrieve a Linear document by ID or slug.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Document ID or slug |

---

### create_document

Create a new document in Linear.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | **Required.** Document title |
| `project` | string | **Required.** Project name or ID |
| `content` | string | Content as Markdown |
| `icon` | string | Icon emoji |
| `color` | string | Hex color |

---

### update_document

Update an existing Linear document.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Document ID or slug |
| `title` | string | New document title |
| `content` | string | New content as Markdown |
| `icon` | string | Icon emoji |
| `color` | string | Hex color |
| `project` | string | New project name or ID |

---

## Search & Documentation

### search_documentation

Search Linear's documentation to learn about features and usage.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** Search query |
| `page` | number | Page number (default: 0) |

---

## Common Patterns

### Assignee Options

For any field accepting a user reference, you can use:
- **User ID**: Full UUID (e.g., "a1b2c3d4-e5f6...")
- **Name**: User's display name (e.g., "John Doe")
- **Email**: User's email (e.g., "john@company.com")
- **"me"**: Refers to the authenticated user

### Date Formats

All date parameters accept ISO-8601 format:
- **Specific date**: `"2024-03-15"`
- **With time**: `"2024-03-15T10:30:00Z"`
- **Relative duration**: `"-P1D"` (1 day ago), `"-P1W"` (1 week ago)

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

## Error Handling

All tools return structured responses. Check for:
- `success`: Boolean indicating operation result
- `data`: The requested/created/updated entity
- `errors`: Array of error messages if applicable

---

## Rate Limits

Refer to Linear's API documentation for current rate limits. Consider:
- Batching operations when possible
- Using pagination for large result sets
- Caching frequently accessed data