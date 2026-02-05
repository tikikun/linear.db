# API Reference

All tools return `{ success: true, data: ... }` or `{ success: false, error: "..." }`.

## Issues

### list_issues

List issues with optional filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name, key, or ID |
| `project` | string | Project name or ID |
| `assignee` | string | User ID, name, email, or 'me' |
| `state` | string | Status type or name |
| `label` | string | Label name or ID |
| `query` | string | Search in title/description |
| `orderBy` | string | `createdAt` or `updatedAt` |
| `limit` | number | Max results |
| `includeArchived` | boolean | Include archived issues |

**Source**: `src/tools/issues.ts:6-24`

### get_issue

Get a single issue by ID or identifier.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Issue ID or identifier (e.g., `ENG-123`) |
| `includeRelations` | boolean | | Include blocking/related issues |

Returns issue with `labels` and `comments` arrays.

**Source**: `src/tools/issues.ts:26-36`

### create_issue

Create a new issue.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ | Issue title |
| `team` | string | ✅ | Team name, key, or ID |
| `description` | string | | Markdown description |
| `project` | string | | Project name or ID |
| `assignee` | string | | User ID, name, email, or 'me' |
| `priority` | number | | 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low |
| `state` | string | | Status name |
| `labels` | string[] | | Label names or IDs |
| `estimate` | number | | Story points |
| `due_date` | string | | ISO date |
| `blocks` | string[] | | Issue IDs this blocks |
| `blocked_by` | string[] | | Issue IDs blocking this |
| `related_to` | string[] | | Related issue IDs |

**Source**: `src/tools/issues.ts:38-59`

### update_issue

Update an existing issue.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Issue ID or identifier |
| `title` | string | | New title |
| `description` | string | | New description |
| `assignee` | string | | User or `null` to remove |
| `priority` | number | | 0-4 |
| `state` | string | | Status name or ID |
| `labels` | string[] | | Replace all labels |
| `estimate` | number | | Story points |
| `due_date` | string | | ISO date |

**Source**: `src/tools/issues.ts:61-79`

---

## Projects

### list_projects

| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Team name or ID |
| `state` | string | Project state |
| `query` | string | Search name |
| `member` | string | Filter by lead |
| `limit` | number | Max results |
| `includeArchived` | boolean | Include archived |

**Source**: `src/tools/projects.ts:5-19`

### get_project

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Project ID or name |
| `includeMilestones` | boolean | | Include milestones |

**Source**: `src/tools/projects.ts:21-30`

### create_project

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Project name |
| `team` | string | ✅ | Team name or ID |
| `description` | string | | Description |
| `icon` | string | | Emoji icon |
| `color` | string | | Hex color |
| `state` | string | | State (default: `started`) |
| `priority` | number | | 0-4 |
| `lead` | string | | User ID, name, email, or 'me' |

**Source**: `src/tools/projects.ts:32-49`

### update_project

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Project ID or name |
| `name` | string | | New name |
| `description` | string | | New description |
| `state` | string | | New state |
| `lead` | string | | User or `null` to remove |

**Source**: `src/tools/projects.ts:51-65`

---

## Milestones

### list_milestones

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project` | string | ✅ | Project name or ID |

**Source**: `src/tools/projects.ts:67-76`

### create_milestone

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project` | string | ✅ | Project name or ID |
| `name` | string | ✅ | Milestone name |
| `description` | string | | Description |
| `target_date` | string | | ISO date |

**Source**: `src/tools/projects.ts:78-90`

---

## Teams

### list_teams

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search in name or key |
| `limit` | number | Max results |
| `includeArchived` | boolean | Include archived teams |

**Source**: `src/tools/teams.ts:7-17`

### get_team

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Team UUID, key, or name |

**Source**: `src/tools/teams.ts:19-27`

### list_issue_statuses

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `team` | string | ✅ | Team name, key, or ID |

Returns team-specific and global statuses.

**Source**: `src/tools/teams.ts`

---

## Users

### list_users

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Filter by name or email |
| `limit` | number | Max results |

**Source**: `src/tools/users.ts:5-16`

### get_user

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | User ID, name, email, or `'me'` |

**Source**: `src/tools/users.ts:18-27`

---

## Labels

### list_issue_labels

| Parameter | Type | Description |
|-----------|------|-------------|
| `team` | string | Filter by team |
| `name` | string | Search by name |
| `limit` | number | Max results (default: 50) |

**Source**: `src/tools/labels.ts:7-9`

### create_issue_label

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Label name |
| `team` | string | | Team name or ID (optional) |
| `color` | string | | Hex color (default: `#bec2c8`) |
| `description` | string | | Description |

**Note**: `team` is optional. If omitted, creates a global label.

**Source**: `src/tools/labels.ts:11-18`

### update_issue_label

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Label ID |
| `name` | string | | New name |
| `color` | string | | New color |

**Source**: `src/tools/labels.ts:20-23`

### delete_issue_label

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Label ID |

**Source**: `src/tools/labels.ts:25-28`

---

## Cycles (Sprints)

### list_cycles

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `team` | string | ✅ | Team name, key, or ID |
| `type` | string | | `current`, `previous`, or `next` |

**Source**: `src/tools/cycles.ts:5-9`

### get_cycle

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Cycle ID |

**Source**: `src/tools/cycles.ts:11-14`

### create_cycle

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `team` | string | ✅ | Team name, key, or ID |
| `name` | string | ✅ | Cycle name |
| `startDate` | string | ✅ | ISO date |
| `endDate` | string | ✅ | ISO date |
| `description` | string | | Description |

**Source**: `src/tools/cycles.ts:16-24`

### update_cycle

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Cycle ID |
| `name` | string | | New name |
| `description` | string | | New description |
| `status` | string | | New status |
| `startDate` | string | | New start date |
| `endDate` | string | | New end date |

**Source**: `src/tools/cycles.ts:26-29`

### delete_cycle

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Cycle ID |

**Source**: `src/tools/cycles.ts:31-34`

---

## Comments

### list_comments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string | ✅ | Issue internal ID |

**Note**: Use internal ID (`issue_...`), not identifier (`ENG-123`).

**Source**: `src/tools/comments.ts:8-10`

### create_comment

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string | ✅ | Issue internal ID |
| `body` | string | ✅ | Comment text |
| `parentId` | string | | Parent comment ID (for replies) |

**Source**: `src/tools/comments.ts:12-15`

### update_comment

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Comment ID |
| `body` | string | | New body |

**Source**: `src/tools/comments.ts:17-20`

### delete_comment

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Comment ID |

**Source**: `src/tools/comments.ts:22-25`
