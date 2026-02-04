# Linear Schema Visualization

## Entity-Relationship Diagram

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    LINEAR TICKETING SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌───────────┐
                                    │   USERS   │
                                    └───────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
      ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
      │    TEAMS      │         │   PROJECTS    │         │  INITIATIVES  │
      └───────────────┘         └───────────────┘         └───────────────┘
            │                          │                          │
            │                          │                          │
     ┌──────┴──────┐           ┌───────┴───────┐                │
     │             │           │               │                │
     ▼             ▼           ▼               ▼                ▼
 ┌───────┐   ┌─────────┐ ┌─────────┐     ┌─────────┐     ┌─────────────┐
 │ LABELS│   │CYCLES   │ │MILESTONES│     │ISSUES   │     │ DOCUMENTS   │
 │       │   │(Sprints)│ │         │     │(Core)   │     │             │
 └───────┘   └─────────┘ └─────────┘     └─────────┘     └─────────────┘
   │            │                           │                    │
   │            │                           │                    │
   │            │            ┌──────────────┼────────────────────┘
   │            │            │              │
   │            │            │   ┌──────────┴──────────┐
   │            │            │   │                     │
   │            ▼            ▼   ▼                     ▼
   │    ┌─────────────────────────────┐      ┌─────────────────────┐
   │    │          ISSUES             │      │      COMMENTS       │
   │    │                             │      │                     │
   │    │  id, identifier, title      │      └─────────────────────┘
   │    │  description, priority      │
   │    │  status, assignee, ...      │      ┌─────────────────────┐
   │    └─────────────────────────────┘      │    ATTACHMENTS      │
   │               │                         │                     │
   │   ┌───────────┼───────────┐            └─────────────────────┘
   │   │           │           │
   │   ▼           ▼           ▼
   │ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ │ LABELS  │ │COMMENTS │ │ATTACH-  │
   │ │ (M:N)   │ │         │ │MENTS    │
   │ └─────────┘ └─────────┘ └─────────┘
   │
   └─────────────────────────────────────────────────────────────────┐
                                                                   │
                                        ┌──────────────────────────┘
                                        │
                                        ▼
                              ┌─────────────────┐
                              │ ISSUE_RELATIONS │
                              │                 │
                              │ blocks, blocked │
                              │ by, related...  │
                              └─────────────────┘
```

## Table Relationships

```
USERS ──────────┬──► PROJECTS (lead_id)
                ├──► ISSUES (assignee_id, creator_id)
                └──► INITIATIVES (owner_id)

TEAMS ──────────┬──► PROJECTS (team_id)
                ├──► ISSUES (team_id)
                ├──► LABELS (team_id)
                ├──► CYCLES (team_id)
                └──► ISSUE_STATUSES (team_id)

PROJECTS ───────┼──► ISSUES (project_id)
                ├──► MILESTONES (project_id)
                └──► DOCUMENTS (project_id)

ISSUES ─────────┼──► LABELS (via issue_labels M:N)
                ├──► COMMENTS (issue_id)
                ├──► ATTACHMENTS (issue_id)
                ├──► ISSUE_RELATIONS (source & target)
                ├──► SUB-ISSUES (parent_id)
                ├──► CYCLES (cycle_id)
                └──► MILESTONES (milestone_id)

INITIATIVES ────└──► DOCUMENTS (initiative_id)

ISSUE_STATUSES ─┴──► PRIORITIES (referenced by priority_id)
```

## Key Entities

| Entity | Purpose | Key Relationships |
|--------|---------|-------------------|
| **USERS** | People in the system | projects.lead, issues.assignee/creator, initiatives.owner |
| **TEAMS** | Groups of users | projects, issues, labels, cycles |
| **PROJECTS** | Containers for issues | team, lead, milestone, documents |
| **ISSUES** | Work items (core) | status, priority, assignee, labels, relations |
| **LABELS** | Categorization | Team-scoped, supports hierarchy via parent_id |
| **CYCLES** | Sprints/time-boxed work | Team-scoped, contains issues |
| **MILESTONES** | Release targets | Belongs to project, contains issues |
| **INITIATIVES** | High-level goals | Contains projects, documents |