"""Configuration for Agentic PM."""
import os
from dotenv import load_dotenv

load_dotenv()

# Linear DB MCP Server
LINEAR_DB_URL = os.getenv("LINEAR_DB_URL", "http://localhost:3335/mcp")

# Team configuration
TEAM_KEY = os.getenv("TEAM_KEY", "AGT")  # Agentic team
TEAM_NAME = os.getenv("TEAM_NAME", "Agentic PM")

# Agent configuration
ALAN_USER_EMAIL = os.getenv("ALAN_USER_EMAIL", "alan@agentic.local")
WORKER_PREFIX = "worker"

# Polling interval (seconds)
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))

# Claude configuration
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "sonnet")
