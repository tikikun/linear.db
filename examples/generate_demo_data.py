#!/usr/bin/env python3
"""
Generate demo data for Linear DB (Master Mind / Agentic PM)

This script creates a sanitized demo database with realistic but fictional data
for demonstrating the multi-agent PM system.

Usage:
    python generate_demo_data.py [output_db_path]
    
Default output: ./demo_linear.db
"""

import sqlite3
import uuid
from datetime import datetime, timedelta
from pathlib import Path
import sys

# Default output path
DEFAULT_DB_PATH = Path(__file__).parent / "demo_linear.db"


def generate_uuid():
    """Generate a UUID string."""
    return str(uuid.uuid4())


def create_tables(conn):
    """Create database tables using the schema."""
    schema_path = Path(__file__).parent.parent / "linear_schema.sql"
    with open(schema_path, "r") as f:
        schema = f.read()
    conn.executescript(schema)


def insert_demo_data(conn):
    """Insert sanitized demo data."""
    cursor = conn.cursor()
    
    now = datetime.now()
    
    # ========================================
    # USERS - Fictional team members
    # ========================================
    users = [
        {
            "id": generate_uuid(),
            "name": "Alice Chen",
            "email": "alice@acme-tech.ai",
            "avatar_url": "https://avatar.example.com/alice.png"
        },
        {
            "id": generate_uuid(),
            "name": "Bob Johnson",
            "email": "bob@acme-tech.ai",
            "avatar_url": "https://avatar.example.com/bob.png"
        },
        {
            "id": generate_uuid(),
            "name": "Charlie Kim",
            "email": "charlie@acme-tech.ai",
            "avatar_url": "https://avatar.example.com/charlie.png"
        },
        {
            "id": generate_uuid(),
            "name": "Diana Patel",
            "email": "diana@acme-tech.ai",
            "avatar_url": "https://avatar.example.com/diana.png"
        },
        {
            "id": generate_uuid(),
            "name": "Alan (PM Bot)",
            "email": "alan@acme-tech.ai",
            "avatar_url": "https://avatar.example.com/alan.png"
        },
        {
            "id": generate_uuid(),
            "name": "Worker Bot",
            "email": "worker@acme-tech.ai",
            "avatar_url": "https://avatar.example.com/worker.png"
        },
    ]
    
    for user in users:
        cursor.execute(
            "INSERT INTO users (id, name, email, avatar_url) VALUES (?, ?, ?, ?)",
            (user["id"], user["name"], user["email"], user["avatar_url"])
        )
    
    # Create lookup dict
    users_by_name = {u["name"]: u for u in users}
    
    # ========================================
    # TEAMS - Engineering teams
    # ========================================
    teams = [
        {
            "id": generate_uuid(),
            "name": "Platform",
            "key": "PLT",
            "icon": ":rocket:",
            "color": "#5e6ad2"
        },
        {
            "id": generate_uuid(),
            "name": "AI Research",
            "key": "AIR",
            "icon": ":brain:",
            "color": "#4cb782"
        },
        {
            "id": generate_uuid(),
            "name": "Frontend",
            "key": "FE",
            "icon": ":art:",
            "color": "#F2C94C"
        },
        {
            "id": generate_uuid(),
            "name": "Infrastructure",
            "key": "INF",
            "icon": ":cloud:",
            "color": "#2F80ED"
        },
    ]
    
    for team in teams:
        cursor.execute(
            "INSERT INTO teams (id, name, key, icon, color) VALUES (?, ?, ?, ?, ?)",
            (team["id"], team["name"], team["key"], team["icon"], team["color"])
        )
    
    teams_by_name = {t["name"]: t for t in teams}
    
    # ========================================
    # LABELS - Common issue labels
    # ========================================
    labels = [
        {"id": generate_uuid(), "name": "Bug", "color": "#EB5757"},
        {"id": generate_uuid(), "name": "Feature", "color": "#2F80ED"},
        {"id": generate_uuid(), "name": "Enhancement", "color": "#27AE60"},
        {"id": generate_uuid(), "name": "Documentation", "color": "#9B51E0"},
        {"id": generate_uuid(), "name": "Research", "color": "#F2994A"},
        {"id": generate_uuid(), "name": "Tech Debt", "color": "#828282"},
        {"id": generate_uuid(), "name": "High Impact", "color": "#F2C94C"},
        {"id": generate_uuid(), "name": "Quick Win", "color": "#6FCF97"},
    ]
    
    for label in labels:
        cursor.execute(
            "INSERT INTO labels (id, name, color) VALUES (?, ?, ?)",
            (label["id"], label["name"], label["color"])
        )
    
    labels_by_name = {l["name"]: l for l in labels}
    
    # ========================================
    # PROJECTS - Active projects
    # ========================================
    projects = [
        {
            "id": generate_uuid(),
            "name": "API Gateway v2",
            "description": "Next-generation API gateway with rate limiting and caching",
            "status": "started",
            "team": "Platform",
            "lead": "Alice Chen",
            "start_date": (now - timedelta(days=30)).isoformat(),
            "target_date": (now + timedelta(days=60)).isoformat(),
            "priority": 2
        },
        {
            "id": generate_uuid(),
            "name": "ML Pipeline Optimization",
            "description": "Optimize inference pipeline for 2x throughput improvement",
            "status": "started",
            "team": "AI Research",
            "lead": "Charlie Kim",
            "start_date": (now - timedelta(days=14)).isoformat(),
            "target_date": (now + timedelta(days=45)).isoformat(),
            "priority": 1
        },
        {
            "id": generate_uuid(),
            "name": "Dashboard Redesign",
            "description": "Modern UI/UX refresh for the main dashboard",
            "status": "planned",
            "team": "Frontend",
            "lead": "Diana Patel",
            "start_date": (now + timedelta(days=7)).isoformat(),
            "target_date": (now + timedelta(days=90)).isoformat(),
            "priority": 3
        },
        {
            "id": generate_uuid(),
            "name": "Infrastructure as Code",
            "description": "Migrate all infrastructure to Terraform/Pulumi",
            "status": "started",
            "team": "Infrastructure",
            "lead": "Bob Johnson",
            "start_date": (now - timedelta(days=21)).isoformat(),
            "target_date": (now + timedelta(days=30)).isoformat(),
            "priority": 2
        },
        {
            "id": generate_uuid(),
            "name": "Agentic PM Demo",
            "description": "Demo project for Master Mind multi-agent orchestration",
            "status": "started",
            "team": "AI Research",
            "lead": "Alice Chen",
            "start_date": now.isoformat(),
            "target_date": (now + timedelta(days=7)).isoformat(),
            "priority": 1
        },
    ]
    
    for project in projects:
        cursor.execute(
            """INSERT INTO projects 
               (id, name, description, status, team_id, lead_id, start_date, target_date, priority)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                project["id"], 
                project["name"], 
                project["description"], 
                project["status"],
                teams_by_name[project["team"]]["id"],
                users_by_name[project["lead"]]["id"],
                project["start_date"],
                project["target_date"],
                project["priority"]
            )
        )
    
    projects_by_name = {p["name"]: p for p in projects}
    
    # ========================================
    # ISSUES - Sample issues with realistic content
    # ========================================
    
    # Get status IDs
    cursor.execute("SELECT id, name FROM issue_statuses")
    status_rows = cursor.fetchall()
    status_by_name = {row[1]: row[0] for row in status_rows}
    
    # Get priority IDs
    cursor.execute("SELECT id, name FROM issue_priorities")
    priority_rows = cursor.fetchall()
    priority_by_name = {row[1]: row[0] for row in priority_rows}
    
    issues = [
        # API Gateway issues
        {
            "identifier": "PLT-101",
            "title": "[Feature] Implement rate limiting middleware",
            "description": """## Goal
Implement token bucket rate limiting for API endpoints.

## Requirements
- Configurable limits per endpoint
- Redis backend for distributed rate limiting
- Return proper 429 responses with retry-after header

## Acceptance Criteria
- [ ] Rate limiter middleware implemented
- [ ] Redis integration working
- [ ] Unit tests passing
- [ ] Load tests show 10k req/s handled""",
            "priority": "High",
            "status": "In Progress",
            "project": "API Gateway v2",
            "team": "Platform",
            "assignee": "Alice Chen",
            "labels": ["Feature", "High Impact"]
        },
        {
            "identifier": "PLT-102",
            "title": "[Bug] Memory leak in connection pool",
            "description": """## Issue
Connection pool is not properly releasing connections after timeout.

## Steps to Reproduce
1. Start server
2. Send 1000 concurrent requests
3. Observe memory growth that doesn't stabilize

## Expected Behavior
Memory should stabilize after connections are released.

## Logs
```
WARN: Connection pool exhausted, waiting for available connection
```""",
            "priority": "Urgent",
            "status": "Todo",
            "project": "API Gateway v2",
            "team": "Platform",
            "assignee": "Bob Johnson",
            "labels": ["Bug"]
        },
        
        # ML Pipeline issues
        {
            "identifier": "AIR-201",
            "title": "[Research] Evaluate TensorRT optimization for inference",
            "description": """## Goal
Benchmark TensorRT vs vanilla PyTorch for production inference.

## Scope
- Test on Llama-3B, Qwen-7B models
- Measure latency, throughput, memory usage
- Document findings with reproducible benchmarks

## Success Metrics
- At least 2x throughput improvement
- <50ms p99 latency for batch size 1""",
            "priority": "High",
            "status": "In Progress",
            "project": "ML Pipeline Optimization",
            "team": "AI Research",
            "assignee": "Charlie Kim",
            "labels": ["Research", "High Impact"]
        },
        {
            "identifier": "AIR-202",
            "title": "[Feature] Implement KV-cache optimization",
            "description": """## Goal
Implement paged attention with KV-cache for 40% memory reduction.

## Technical Approach
- Use vLLM's paged attention implementation
- Support continuous batching
- Integrate with existing inference server""",
            "priority": "High",
            "status": "Todo",
            "project": "ML Pipeline Optimization",
            "team": "AI Research",
            "assignee": "Charlie Kim",
            "labels": ["Feature", "Enhancement"]
        },
        
        # Frontend issues
        {
            "identifier": "FE-301",
            "title": "[Feature] Dark mode support",
            "description": """## Goal
Add dark mode toggle to dashboard with system preference detection.

## Requirements
- Persist user preference
- Smooth transition animation
- All components support both modes

## Design
See Figma link: [Dashboard Dark Mode]""",
            "priority": "Normal",
            "status": "Backlog",
            "project": "Dashboard Redesign",
            "team": "Frontend",
            "assignee": "Diana Patel",
            "labels": ["Feature"]
        },
        {
            "identifier": "FE-302",
            "title": "[Enhancement] Improve loading states",
            "description": """## Goal
Replace spinner with skeleton loaders for better perceived performance.

## Components to Update
- [ ] Dashboard cards
- [ ] Data tables
- [ ] Charts
- [ ] Navigation""",
            "priority": "Normal",
            "status": "Todo",
            "project": "Dashboard Redesign",
            "team": "Frontend",
            "assignee": "Diana Patel",
            "labels": ["Enhancement", "Quick Win"]
        },
        
        # Infrastructure issues
        {
            "identifier": "INF-401",
            "title": "[Feature] Terraform module for Kubernetes cluster",
            "description": """## Goal
Create reusable Terraform module for k8s cluster provisioning.

## Requirements
- Support AWS EKS and self-managed k3s
- Configurable node pools
- Integrated monitoring stack
- GitOps-ready with ArgoCD""",
            "priority": "High",
            "status": "In Progress",
            "project": "Infrastructure as Code",
            "team": "Infrastructure",
            "assignee": "Bob Johnson",
            "labels": ["Feature"]
        },
        {
            "identifier": "INF-402",
            "title": "[Tech Debt] Migrate secrets to External Secrets Operator",
            "description": """## Goal
Migrate from Kubernetes secrets to ESO with AWS Secrets Manager backend.

## Current State
- 47 hardcoded secrets in manifests
- No rotation policy
- Manual sync required

## Target State
- All secrets synced from AWS SM
- Automatic rotation every 90 days
- GitOps-friendly""",
            "priority": "Normal",
            "status": "Todo",
            "project": "Infrastructure as Code",
            "team": "Infrastructure",
            "assignee": "Bob Johnson",
            "labels": ["Tech Debt"]
        },
        
        # Agentic PM Demo issues (for Master Mind demo)
        {
            "identifier": "AIR-501",
            "title": "[Demo] Build HTML Flappy Bird game",
            "description": """## PRD for Demo

Build a single-file HTML Flappy Bird game for demonstrating the Agentic PM system.

### Requirements
- Single HTML file with embedded CSS and JavaScript
- Classic Flappy Bird mechanics (jump, pipes, collision)
- Score tracking
- Game over / restart functionality
- Clean, polished visuals

### Success Criteria
- Game is playable in browser
- No external dependencies
- Code is well-organized and commented""",
            "priority": "Normal",
            "status": "Todo",
            "project": "Agentic PM Demo",
            "team": "AI Research",
            "assignee": "Worker Bot",
            "labels": ["Feature"]
        },
        {
            "identifier": "AIR-502",
            "title": "[Demo] Build calculator web app",
            "description": """## PRD for Demo

Build a simple calculator web app for demonstrating task decomposition.

### Requirements
- Single HTML file
- Basic operations: +, -, *, /
- Clear button
- Responsive design

### Acceptance Criteria
- All operations work correctly
- Clean UI""",
            "priority": "Normal",
            "status": "Backlog",
            "project": "Agentic PM Demo",
            "team": "AI Research",
            "assignee": None,
            "labels": ["Feature"]
        },
    ]
    
    for issue in issues:
        issue_id = generate_uuid()
        assignee_id = users_by_name[issue["assignee"]]["id"] if issue["assignee"] else None
        
        cursor.execute(
            """INSERT INTO issues 
               (id, identifier, title, description, priority_id, status_id, 
                project_id, team_id, assignee_id, priority_value, 
                git_branch_name, url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                issue_id,
                issue["identifier"],
                issue["title"],
                issue["description"],
                priority_by_name[issue["priority"]],
                status_by_name[issue["status"]],
                projects_by_name[issue["project"]]["id"],
                teams_by_name[issue["team"]]["id"],
                assignee_id,
                {"None": 0, "Urgent": 1, "High": 2, "Normal": 3, "Low": 4}[issue["priority"]],
                f"{issue['assignee'].lower().split()[0] if issue['assignee'] else 'dev'}/{issue['identifier'].lower()}-{issue['title'][:30].lower().replace(' ', '-').replace('[', '').replace(']', '')}",
                f"https://linear.app/acme/issue/{issue['identifier']}"
            )
        )
        
        # Add labels
        for label_name in issue.get("labels", []):
            cursor.execute(
                "INSERT INTO issue_labels (issue_id, label_id) VALUES (?, ?)",
                (issue_id, labels_by_name[label_name]["id"])
            )
    
    # ========================================
    # COMMENTS - Sample comments
    # ========================================
    
    # Get first issue ID
    cursor.execute("SELECT id FROM issues WHERE identifier = 'PLT-101'")
    plt_101_id = cursor.fetchone()[0]
    
    comments = [
        {
            "issue_id": plt_101_id,
            "user": "Bob Johnson",
            "body": "Started working on this. Will use golang.org/x/time/rate for the implementation."
        },
        {
            "issue_id": plt_101_id,
            "user": "Alice Chen",
            "body": "Make sure to add metrics for rate limit hits. We'll need those for tuning."
        },
    ]
    
    for comment in comments:
        cursor.execute(
            "INSERT INTO comments (id, body, issue_id, user_id) VALUES (?, ?, ?, ?)",
            (
                generate_uuid(),
                comment["body"],
                comment["issue_id"],
                users_by_name[comment["user"]]["id"]
            )
        )
    
    conn.commit()
    print(f"✅ Inserted {len(users)} users")
    print(f"✅ Inserted {len(teams)} teams")
    print(f"✅ Inserted {len(labels)} labels")
    print(f"✅ Inserted {len(projects)} projects")
    print(f"✅ Inserted {len(issues)} issues")
    print(f"✅ Inserted {len(comments)} comments")


def main():
    # Determine output path
    if len(sys.argv) > 1:
        db_path = Path(sys.argv[1])
    else:
        db_path = DEFAULT_DB_PATH
    
    # Remove existing database
    if db_path.exists():
        db_path.unlink()
        print(f"🗑️  Removed existing database: {db_path}")
    
    # Create new database
    print(f"📦 Creating demo database: {db_path}")
    conn = sqlite3.connect(db_path)
    
    try:
        create_tables(conn)
        print("✅ Created database schema")
        
        insert_demo_data(conn)
        print(f"\n🎉 Demo database ready: {db_path}")
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()
