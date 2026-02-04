# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a SQLite schema (`linear_schema.sql`) that mimics Linear's ticketing system data model. The schema was reverse-engineered from Linear's GraphQL API and is designed for local development, testing, and prototyping without requiring Linear API access.

## Commands

```bash
# Initialize the schema in a SQLite database
sqlite3 database.db < linear_schema.sql

# Verify schema was loaded correctly
sqlite3 database.db ".schema"

# List all tables
sqlite3 database.db ".tables"

# Explore the entity relationships visually in schema_diagram.md
cat schema_diagram.md
```

## Architecture

The schema follows a normalized relational design with these key patterns:

| Pattern | Implementation |
|---------|---------------|
| **Central entity** | `issues` with denormalized `priority_value` for fast sorting |
| **Label hierarchy** | Self-referencing `parent_id` on `labels` table |
| **Issue relations** | Composite PK `(source_issue_id, target_issue_id, relation_type)` |
| **Multi-team** | `team_id` on Projects, Issues, Labels, Cycles, Statuses |
| **Data integrity** | Cascade deletes for issue-related data; triggers auto-maintain `updated_at` |

### Key Entities

- **USERS** → referenced by `projects.lead`, `issues.assignee/creator`, `initiatives.owner`
- **TEAMS** → scope for projects, issues, labels, cycles, issue statuses
- **PROJECTS** → contain issues, milestones, documents; belong to a team
- **ISSUES** → core work items with status, priority, assignee, labels, relations, sub-issues
- **CYCLES** → sprints/time-boxed work, team-scoped
- **INITIATIVES** → high-level goals containing projects and documents

## Available MCP Tools

Two MCP servers are configured for this project:

| Server | Tools | Purpose |
|--------|-------|---------|
| **Linear** (`mcp__plugin_linear_linear__*`) | Issues, Projects, Teams, Labels, Cycles, Initiatives, Documents, Comments, Attachments | Programmatic access to Linear's API |
| **Exa** (`mcp__exa__*`) | Web search, code context retrieval | Research and documentation lookup |

See `LINEAR_MCP.md` for full API documentation.

## Common Queries

```sql
-- Active issues with assignee and project info
SELECT * FROM active_issues;

-- Issues with their labels (JSON array)
SELECT id, title, identifier, labels FROM issues_with_labels;

-- Issues blocked by another
SELECT * FROM issue_relations WHERE relation_type = 'blockedBy';

-- Find issues by priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)
SELECT * FROM issues WHERE priority_value <= 2 ORDER BY priority_value ASC;

-- Issues in a specific cycle
SELECT * FROM issues WHERE cycle_id = 'cycle-uuid';
```