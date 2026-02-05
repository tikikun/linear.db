# Agentic PM

Multi-agent orchestration using Linear DB as the coordination layer.

## Overview

Two AI agents collaborate to complete tasks:

```
┌─────────────────────────────────────────────────────────────────┐
│  ALAN (PM Agent)                                                │
│  • Analyzes PRDs using Claude                                   │
│  • Creates minimal, atomic tasks                                │
│  • Assigns to workers (round-robin)                             │
└─────────────────────────────┬───────────────────────────────────┘
                              │ creates issues
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LINEAR DB (../sqlite-mcp-server)                               │
│  • Single source of truth for tasks                             │
│  • Status: Backlog → In Progress → Done                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │ polls for tasks
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  WORKER (Developer Agent)                                       │
│  • Polls for assigned tasks                                     │
│  • Executes using Claude Agent SDK                              │
│  • Updates status and adds result comments                      │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

1. Linear DB MCP server running (from parent directory):
   ```bash
   cd ../sqlite-mcp-server
   npm install && npm run init-db
   PORT=3335 npm run dev
   ```

2. `ANTHROPIC_API_KEY` set in environment

### Run

```bash
# Install dependencies
bash run.sh help

# Alan: Create tasks from PRD
bash run.sh alan "Build a single HTML file with a bouncing ball" worker1@local

# Worker: Execute assigned tasks
bash run.sh worker worker1@local --dir ./workspace
```

## Architecture

| Component | File | Purpose |
|-----------|------|---------|
| Alan | `alan.py` | PM agent - PRD → tasks |
| Worker | `worker.py` | Developer agent - executes tasks |
| Linear Client | `linear_client.py` | HTTP client for Linear DB MCP |
| Config | `config.py` | Environment configuration |

## Documentation

- [Architecture](docs/architecture.md) - System design and data flow
- [API Reference](docs/api.md) - Function documentation
- [Configuration](docs/configuration.md) - Environment variables
- [Troubleshooting](docs/troubleshooting.md) - Common issues

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LINEAR_DB_URL` | `http://localhost:3335/mcp` | Linear DB MCP endpoint |
| `TEAM_KEY` | `AGT` | Team identifier |
| `POLL_INTERVAL` | `5` | Worker polling interval (seconds) |
| `CLAUDE_MODEL` | `sonnet` | Claude model for workers |

## Example

```bash
# Terminal 1: Start Linear DB
cd ../sqlite-mcp-server && PORT=3335 npm run dev

# Terminal 2: Alan creates tasks
cd ../agentic-pm
bash run.sh alan "Build HTML Flappy Bird game with bird, pipes, score, game over screen" worker1@local

# Terminal 3: Worker executes
bash run.sh worker worker1@local --dir ./workspace

# Result: workspace/index.html contains the game
```
