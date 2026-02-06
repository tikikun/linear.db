# Installation

## Prerequisites

1. **Python 3.11+** with `uv` package manager
2. **Node.js 18+** for Linear DB MCP server
3. **Anthropic API Key**

## Quick Install

```bash
# From linear.db root directory
cd agentic-pm
bash run.sh help  # Installs deps automatically
```

## Step-by-Step Install

### 1. Start Linear DB MCP Server

```bash
# From linear.db root
cd sqlite-mcp-server
npm install
npm run init-db
PORT=3335 npm run dev
```

Verify running:

```bash
curl http://localhost:3335/health
# Expected: {"status":"ok","server":"linear-sqlite-mcp"}
```

### 2. Install Agentic PM dependencies

```bash
cd ../agentic-pm
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

**Dependencies** (`requirements.txt`):
- `claude-agent-sdk>=0.1.0` - Claude Agent SDK for task execution
- `httpx>=0.27.0` - HTTP client for Linear DB MCP
- `pydantic>=2.0.0` - Data validation
- `loguru>=0.7.0` - Logging
- `python-dotenv>=1.0.0` - Environment configuration

### 3. Configure environment

```bash
cp .env.example .env
```

Required:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

Optional (see [Configuration](configuration.md)):

```bash
LINEAR_DB_URL=http://localhost:3335/mcp
TEAM_KEY=AGT
POLL_INTERVAL=5
CLAUDE_MODEL=sonnet
```

## Verify Installation

```bash
# Terminal 1: Linear DB (already running from step 1)
cd sqlite-mcp-server && PORT=3335 npm run dev

# Terminal 2: Test Alan
cd ../agentic-pm
export ANTHROPIC_API_KEY=your-key
bash run.sh alan "Build hello world Python script" worker1@local
```

Expected output:
```
Alan starting PRD analysis...
Creating team Agentic PM (AGT)
Analyzing PRD with Claude...
Generated 1 tasks
Created AGT-1: Build hello world Python script → worker1@local
```

## Troubleshooting

See [Troubleshooting](troubleshooting.md) for common issues.
