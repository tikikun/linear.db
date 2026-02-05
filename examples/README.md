# Demo Database Examples

This folder contains demo data for testing and demonstrating the Linear DB MCP server and Agentic PM (Master Mind) system.

## Quick Start

### Generate Fresh Demo Database

```bash
cd examples
python3 generate_demo_data.py
```

This creates `demo_linear.db` with sanitized, fictional data.

### Use Custom Output Path

```bash
python3 generate_demo_data.py /path/to/custom.db
```

## Demo Data Contents

The demo database includes realistic but fictional data:

### Users (6)
| Name | Email | Role |
|------|-------|------|
| Alice Chen | alice@acme-tech.ai | Platform Lead |
| Bob Johnson | bob@acme-tech.ai | Infrastructure |
| Charlie Kim | charlie@acme-tech.ai | AI Research |
| Diana Patel | diana@acme-tech.ai | Frontend |
| Alan (PM Bot) | alan@acme-tech.ai | PM Agent |
| Worker Bot | worker@acme-tech.ai | Worker Agent |

### Teams (4)
| Team | Key | Description |
|------|-----|-------------|
| Platform | PLT | Core platform engineering |
| AI Research | AIR | ML/AI research and development |
| Frontend | FE | UI/UX development |
| Infrastructure | INF | DevOps and infrastructure |

### Projects (5)
1. **API Gateway v2** - Next-gen API gateway (Platform)
2. **ML Pipeline Optimization** - 2x throughput improvement (AI Research)
3. **Dashboard Redesign** - Modern UI refresh (Frontend)
4. **Infrastructure as Code** - Terraform migration (Infrastructure)
5. **Agentic PM Demo** - Master Mind demo project (AI Research)

### Issues (10)
Various realistic issues across all projects:
- Feature requests
- Bug reports
- Research tasks
- Tech debt items
- Demo tasks for Agentic PM

## Use with Agentic PM (Master Mind)

To demo the multi-agent system with this database:

```bash
# 1. Copy demo database to MCP server location
cp demo_linear.db ../sqlite-mcp-server/linear.db

# 2. Start the MCP server
cd ../sqlite-mcp-server
npm run dev

# 3. In another terminal, run Alan PM agent
cd ../agentic-pm
source .venv/bin/activate
python alan.py "Build a simple todo list HTML app"

# 4. Run Worker to execute assigned tasks
python worker.py worker@acme-tech.ai
```

## Database Schema

The demo database uses the full Linear-style schema from `linear_schema.sql`:

- `users` - Team members
- `teams` - Engineering teams  
- `projects` - Active projects
- `issues` - Tasks and tickets
- `labels` - Issue categorization
- `comments` - Issue discussions
- `issue_statuses` - Workflow states
- `issue_priorities` - Priority levels

## Querying Demo Data

```bash
# List all issues with status
sqlite3 demo_linear.db "
  SELECT 
    i.identifier, 
    i.title,
    u.name as assignee,
    s.name as status
  FROM issues i
  LEFT JOIN users u ON i.assignee_id = u.id
  LEFT JOIN issue_statuses s ON i.status_id = s.id
"

# Show issues by project
sqlite3 demo_linear.db "
  SELECT 
    p.name as project,
    COUNT(*) as issue_count
  FROM issues i
  JOIN projects p ON i.project_id = p.id
  GROUP BY p.name
"
```

## License

Demo data is fictional and safe to use for testing, demos, and documentation.
