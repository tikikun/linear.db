# Why Linear.DB?

## The Problem

Coding agents like Claude Code and Cursor are powerful, but they struggle to stay aligned on a project. Without a shared source of truth:

- **Context drift** - Each new session forgets previous decisions and direction
- **No persistent memory** - Trade-offs, architectural choices, and task progress are lost
- **Scattered tracking** - Tasks live in chat, not in a structured system the agent can reference
- **Disconnected workflows** - The agent can't see what work is in progress or completed

## The Solution

Linear.DB is a self-hosted, Linear-style project management system designed specifically for AI agents. It provides:

- **Persistent project memory** - Architectural decisions, trade-offs, and direction survive across sessions
- **Structured task tracking** - Issues, cycles, and milestones the agent can query and update
- **MCP-powered integration** - Full CRUD access via the Model Context Protocol
- **Zero infrastructure** - Runs locally with just Node.js and SQLite

## Full Human Observability

When running a swarm of coding agents, transparency is critical. Linear.DB gives you:

- **Complete audit trail** - See every issue created, updated, and completed by your agents
- **Work visible to humans** - All task state lives in a structured database you can query anytime
- **Agent coordination insight** - Track which agent is working on what, cycle progress, and blockers
- **Swarm transparency** - Multiple agents working in parallel leave a clear trail you can follow

## Use Cases

- **Agentic development** - Give your AI a shared source of truth it can query and update
- **Multi-agent orchestration** - Run swarms with full visibility into their coordination
- **Local development** - No API rate limits or external dependencies
- **Offline scenarios** - Everything runs on your machine
- **Learning MCP patterns** - Well-documented Streamable HTTP transport implementation


---------------
┌─────────────────────────────────────────────────────────────────┐
│  THE PROBLEM: Context Drift & Scattered Memory                  │
└─────────────────────────────────────────────────────────────────┘

   Session 1          Session 2          Session 3
   ┌──────┐          ┌──────┐           ┌──────┐
   │ 🤖   │          │ 🤖   │           │ 🤖   │
   │Claude│──❌──────│Claude│────❌─────│Claude│
   └──────┘   Lost   └──────┘    Lost   └──────┘
      │               │                   │
      ▼               ▼                   ▼
   Memory         Memory              Memory
   wiped!         wiped!              wiped!


┌─────────────────────────────────────────────────────────────────┐
│  THE SOLUTION: Linear.DB as Persistent Brain                    │
└─────────────────────────────────────────────────────────────────┘

   Session 1          Session 2          Session 3
   ┌──────┐          ┌──────┐           ┌──────┐
   │ 🤖   │          │ 🤖   │           │ 🤖   │
   │Claude│──────────│Claude│───────────│Claude│
   └──┬───┘          └──┬───┘           └──┬───┘
      │                 │                  │
      └────────┬────────┴─────────┬────────┘
               │   MCP Protocol   │
               ▼                  ▼
        ╔════════════════════════════════╗
        ║     📊 LINEAR.DB BRAIN 🧠     ║
        ╠════════════════════════════════╣
        ║ ┌────────────────────────────┐ ║
        ║ │ Issues & Tasks             │ ║
        ║ │ ├─ ENG-001: API design ✓   │ ║
        ║ │ ├─ ENG-002: Auth flow 🔄   │ ║
        ║ │ └─ ENG-003: Testing ⏸️     │ ║
        ║ ├────────────────────────────┤ ║
        ║ │ Architecture Decisions     │ ║
        ║ │ • REST vs GraphQL → REST   │ ║
        ║ │ • DB choice → SQLite       │ ║
        ║ ├────────────────────────────┤ ║
        ║ │ Active Cycles              │ ║
        ║ │ Sprint 3: [████░░] 80%     │ ║
        ║ └────────────────────────────┘ ║
        ║    Local SQLite • No API 🔓   ║
        ╚════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────┐
│  MULTI-AGENT SWARM: Full Observability                          │
└─────────────────────────────────────────────────────────────────┘

    Agent A         Agent B         Agent C
    ┌──────┐       ┌──────┐        ┌──────┐
    │ 🤖   │       │ 🤖   │        │ 🤖   │
    │Front │       │Back  │        │Tests │
    │end   │       │end   │        │      │
    └──┬───┘       └──┬───┘        └──┬───┘
       │              │               │
       └──────┬───────┴───────┬───────┘
              │               │
              ▼               ▼
       ╔══════════════════════════════╗
       ║   👁️  HUMAN DASHBOARD  👁️   ║
       ╠══════════════════════════════╣
       ║  Real-time Coordination:     ║
       ║  • Agent A: ENG-045 ✍️       ║
       ║  • Agent B: ENG-046 ✍️       ║
       ║  • Agent C: ENG-047 ✅       ║
       ║                              ║
       ║  Audit Trail:                ║
       ║  12:01 - Agent A created 045 ║
       ║  12:05 - Agent B updated 046 ║
       ║  12:10 - Agent C closed 047  ║
       ║                              ║
       ║  [Query] [Export] [Monitor]  ║
       ╚══════════════════════════════╝
              Complete transparency
              No black boxes!


┌─────────────────────────────────────────────────────────────────┐
│  KEY INSIGHT: Shared Memory = Coherent Agents                   │
└─────────────────────────────────────────────────────────────────┘

  WITHOUT Linear.DB          WITH Linear.DB
  ┌──────────────┐          ┌──────────────┐
  │ 💭 "What     │          │ 📋 Queries   │
  │   did we     │          │   issue DB   │
  │   decide?"   │          │   ↓          │
  │              │          │ ✅ Knows the │
  │ ❌ Guesses   │          │   decision   │
  └──────────────┘          └──────────────┘
