# End-to-End Testing Guide

This guide documents the complete end-to-end testing workflow for the Linear.db MCP server. Use this to verify all functionality works correctly after changes or fresh installations.

## Prerequisites

- Node.js 22+ installed
- Server running on port 3334 (or configured port)
- MCP client configured (Cursor, Claude Code, etc.)

## Quick Start

```bash
# 1. Wipe database and restart server
rm -f /path/to/linear.db/sqlite-mcp-server/linear.db*
cd /path/to/linear.db/sqlite-mcp-server
PORT=3334 npx tsx src/index.ts

# 2. Verify server is running
curl -s http://localhost:3334/health
# Expected: {"status":"ok","server":"linear-sqlite-mcp"}
```

## Complete Test Flow

### Phase 1: Foundation Setup

#### 1.1 Create Team

```json
{
  "tool": "create_team",
  "arguments": {
    "name": "Engineering",
    "key": "ENG"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "team_eng",
    "name": "Engineering",
    "key": "ENG"
  }
}
```

#### 1.2 Create Users

```json
{
  "tool": "create_user",
  "arguments": {
    "name": "Alice Developer",
    "email": "alice@example.com"
  }
}
```

```json
{
  "tool": "create_user",
  "arguments": {
    "name": "Bob Designer",
    "email": "bob@example.com"
  }
}
```

#### 1.3 Verify Foundation

```json
// List teams
{ "tool": "list_teams", "arguments": {} }

// List users
{ "tool": "list_users", "arguments": {} }

// List available statuses
{ "tool": "list_issue_statuses", "arguments": { "team": "ENG" } }
```

**Expected Statuses (seeded automatically):**
- `Backlog` (type: backlog)
- `Todo` (type: unstarted)
- `In Progress` (type: started)
- `Done` (type: completed)
- `Canceled` (type: canceled)
- `Duplicate` (type: canceled)

---

### Phase 2: Project Setup

#### 2.1 Create Project

```json
{
  "tool": "create_project",
  "arguments": {
    "name": "Mobile App MVP",
    "team": "ENG",
    "state": "started"
  }
}
```

#### 2.2 Create Cycle (Sprint)

```json
{
  "tool": "create_cycle",
  "arguments": {
    "team": "ENG",
    "name": "Sprint 1",
    "startDate": "2026-02-03",
    "endDate": "2026-02-14"
  }
}
```

#### 2.3 Create Labels

```json
// Bug label (red)
{
  "tool": "create_issue_label",
  "arguments": {
    "name": "bug",
    "color": "#E53935",
    "team": "ENG"
  }
}

// Feature label (green)
{
  "tool": "create_issue_label",
  "arguments": {
    "name": "feature",
    "color": "#43A047",
    "team": "ENG"
  }
}

// Documentation label (blue)
{
  "tool": "create_issue_label",
  "arguments": {
    "name": "docs",
    "color": "#1E88E5",
    "team": "ENG"
  }
}
```

---

### Phase 3: Issue Management

#### 3.1 Create Issues with Various Options

**Issue with assignee, labels, and project:**
```json
{
  "tool": "create_issue",
  "arguments": {
    "title": "Setup React Native project",
    "team": "ENG",
    "description": "Initialize RN project with TypeScript",
    "priority": 1,
    "assignee": "Alice Developer",
    "project": "Mobile App MVP",
    "labels": ["feature"]
  }
}
```

**Issue with different priority:**
```json
{
  "tool": "create_issue",
  "arguments": {
    "title": "Design login screen",
    "team": "ENG",
    "description": "Create Figma designs for login/signup flow",
    "priority": 2,
    "assignee": "Bob Designer",
    "project": "Mobile App MVP"
  }
}
```

**Bug issue:**
```json
{
  "tool": "create_issue",
  "arguments": {
    "title": "Fix navigation crash on Android",
    "team": "ENG",
    "description": "App crashes when navigating back from profile",
    "priority": 1,
    "project": "Mobile App MVP",
    "labels": ["bug"]
  }
}
```

**Issue with estimate:**
```json
{
  "tool": "create_issue",
  "arguments": {
    "title": "Write API documentation",
    "team": "ENG",
    "description": "Document all REST endpoints",
    "priority": 4,
    "estimate": 3,
    "labels": ["docs"]
  }
}
```

#### 3.2 Priority Values

| Value | Name | Description |
|-------|------|-------------|
| 0 | None | No priority set |
| 1 | Urgent | Critical/blocking |
| 2 | High | Important |
| 3 | Normal | Standard priority |
| 4 | Low | Nice to have |

---

### Phase 4: Issue Updates

#### 4.1 Update Status

```json
// Move to In Progress
{
  "tool": "update_issue",
  "arguments": {
    "id": "ENG-1",
    "state": "In Progress"
  }
}

// Mark as Done
{
  "tool": "update_issue",
  "arguments": {
    "id": "ENG-1",
    "state": "Done"
  }
}
```

#### 4.2 Update Assignee

```json
{
  "tool": "update_issue",
  "arguments": {
    "id": "ENG-3",
    "assignee": "Alice Developer"
  }
}
```

#### 4.3 Update Labels

```json
// Replace all labels
{
  "tool": "update_issue",
  "arguments": {
    "id": "ENG-2",
    "labels": ["feature", "docs"]
  }
}
```

#### 4.4 Update Multiple Fields

```json
{
  "tool": "update_issue",
  "arguments": {
    "id": "ENG-4",
    "assignee": "Bob Designer",
    "due_date": "2026-02-10",
    "estimate": 5
  }
}
```

---

### Phase 5: Comments

#### 5.1 Add Comments

```json
{
  "tool": "create_comment",
  "arguments": {
    "issueId": "<issue_id>",
    "body": "Started working on this. Using React Native 0.73 with TypeScript."
  }
}
```

```json
{
  "tool": "create_comment",
  "arguments": {
    "issueId": "<issue_id>",
    "body": "Done! All dependencies configured and tested."
  }
}
```

---

### Phase 6: Querying & Filtering

#### 6.1 List All Issues

```json
{
  "tool": "list_issues",
  "arguments": {
    "team": "ENG"
  }
}
```

#### 6.2 Filter by Status

```json
{
  "tool": "list_issues",
  "arguments": {
    "team": "ENG",
    "state": "In Progress"
  }
}
```

#### 6.3 Filter by Assignee

```json
{
  "tool": "list_issues",
  "arguments": {
    "team": "ENG",
    "assignee": "Alice Developer"
  }
}
```

#### 6.4 Filter by Label

```json
{
  "tool": "list_issues",
  "arguments": {
    "team": "ENG",
    "label": "bug"
  }
}
```

#### 6.5 Filter by Project

```json
{
  "tool": "list_issues",
  "arguments": {
    "team": "ENG",
    "project": "Mobile App MVP"
  }
}
```

#### 6.6 Search by Text

```json
{
  "tool": "list_issues",
  "arguments": {
    "team": "ENG",
    "query": "navigation"
  }
}
```

#### 6.7 Get Issue with Full Details

```json
{
  "tool": "get_issue",
  "arguments": {
    "id": "ENG-1",
    "includeRelations": true
  }
}
```

**Response includes:**
- Issue details
- Labels array
- Comments array
- Blocking/blocked_by relations
- Related issues

---

## Test Checklist

Use this checklist to verify all functionality:

### Foundation
- [ ] `create_team` - Create team with name and key
- [ ] `create_user` - Create users with name and email
- [ ] `list_teams` - Returns created team
- [ ] `list_users` - Returns created users
- [ ] `list_issue_statuses` - Returns 6 global statuses

### Project Management
- [ ] `create_project` - Create project with team
- [ ] `create_cycle` - Create sprint with dates
- [ ] `create_issue_label` - Create colored labels
- [ ] `list_projects` - Returns created project
- [ ] `list_cycles` - Returns created cycle
- [ ] `list_issue_labels` - Returns created labels

### Issue CRUD
- [ ] `create_issue` - With priority, assignee, labels, project
- [ ] `create_issue` - With estimate
- [ ] `get_issue` - Returns full details with relations
- [ ] `update_issue` - Update status (In Progress → Done)
- [ ] `update_issue` - Update assignee
- [ ] `update_issue` - Update labels only
- [ ] `update_issue` - Update due_date and estimate

### Comments
- [ ] `create_comment` - Add comment to issue
- [ ] `get_issue` - Returns comments in response

### Filtering
- [ ] `list_issues` - Filter by team
- [ ] `list_issues` - Filter by state
- [ ] `list_issues` - Filter by assignee
- [ ] `list_issues` - Filter by label
- [ ] `list_issues` - Filter by project
- [ ] `list_issues` - Search by query text

---

## Common Issues & Solutions

### Issue: "No updates provided" when updating labels only

**Cause:** Fixed in latest version. Labels are now processed before the early return check.

**Solution:** Update to latest version of `src/tools/issues.ts`.

### Issue: Status update not working

**Cause:** Fixed in latest version. Global statuses (team_id IS NULL) were not being found.

**Solution:** The query now includes `OR team_id IS NULL` to find global statuses.

### Issue: First MCP call fails after server restart

**Cause:** Stale session from previous server instance.

**Solution:** This is expected behavior. The second call will establish a new session.

---

## Automated Test Script

For automated testing, use the provided `test.sh` script:

```bash
cd sqlite-mcp-server
./test.sh
```

Or run manually:

```bash
# Wipe and restart
rm -f linear.db* && PORT=3334 npx tsx src/index.ts &
sleep 3

# Run test sequence via MCP client
# ... (use your MCP client to execute the test flow above)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-05 | Initial release with full E2E test coverage |
