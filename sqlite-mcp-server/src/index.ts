import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import { initializeDatabase } from "./schema.js";

// Import tool handlers - each module exports its tools and a registration function
import { registerIssueTools, getIssueTools } from "./tools/issues.js";
import { registerProjectTools, getProjectTools } from "./tools/projects.js";
import { registerTeamTools, getTeamTools } from "./tools/teams.js";
import { registerLabelTools, getLabelTools } from "./tools/labels.js";
import { registerCycleTools, getCycleTools } from "./tools/cycles.js";
import { registerCommentTools, getCommentTools } from "./tools/comments.js";
import { registerUserTools, getUserTools } from "./tools/users.js";

// Initialize database schema
initializeDatabase();

// Create MCP server
const server = new Server(
  { name: "linear-sqlite-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// All registered tool handlers
const toolHandlers: Record<string, (args: any) => Promise<any>> = {};

function registerToolHandler(name: string, handler: (args: any) => Promise<any>) {
  toolHandlers[name] = handler;
}

// Register all tools
registerIssueTools(registerToolHandler);
registerProjectTools(registerToolHandler);
registerTeamTools(registerToolHandler);
registerLabelTools(registerToolHandler);
registerCycleTools(registerToolHandler);
registerCommentTools(registerToolHandler);
registerUserTools(registerToolHandler);

// List all tools
const allTools = [
  ...getIssueTools(),
  ...getProjectTools(),
  ...getTeamTools(),
  ...getLabelTools(),
  ...getCycleTools(),
  ...getCommentTools(),
  ...getUserTools(),
];

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;
  const handler = toolHandlers[name];

  if (!handler) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2) }],
      isError: true,
    };
  }

  try {
    const result = await handler(args || {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: error.message }, null, 2) }],
      isError: true,
    };
  }
});

// Session management for Streamable HTTP
interface Session {
  transport: StreamableHTTPServerTransport;
  lastActivity: number;
}

const sessions = new Map<string, Session>();
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Create Express app
const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", server: "linear-sqlite-mcp" });
});

// MCP endpoint - handle both GET (for SSE-like streaming) and POST
app.all("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  // Handle initialization
  if (req.body?.method === "initialize") {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    const newSessionId = transport.sessionId ?? randomUUID();
    sessions.set(newSessionId, {
      transport,
      lastActivity: Date.now(),
    });

    // Handle session cleanup on close
    transport.onclose = () => {
      sessions.delete(newSessionId);
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // Handle subsequent requests with session ID
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    session.lastActivity = Date.now();
    await session.transport.handleRequest(req, res, req.body);
    return;
  }

  // Stateless mode: process request directly without MCP transport
  if (!sessionId && req.body?.method && req.body.method !== "initialize") {
    const method = req.body.method;
    const requestId = req.body.id;

    try {
      let result: any;

      if (method === "tools/list") {
        result = { tools: allTools };
      } else if (method === "tools/call") {
        const { name, arguments: args } = req.body.params || {};
        const handler = toolHandlers[name];
        if (!handler) {
          result = {
            content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2) }],
            isError: true,
          };
        } else {
          try {
            const data = await handler(args || {});
            result = { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
          } catch (error: any) {
            result = {
              content: [{ type: "text", text: JSON.stringify({ error: error.message }, null, 2) }],
              isError: true,
            };
          }
        }
      } else {
        result = { error: `Unknown method: ${method}` };
      }

      res.json({ jsonrpc: "2.0", id: requestId, ...result });
    } catch (error: any) {
      res.status(500).json({ jsonrpc: "2.0", id: req.body.id, error: { message: error.message } });
    }
    return;
  }

  res.status(400).json({ error: "Invalid request" });
});

// Session cleanup interval
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      session.transport.close();
      sessions.delete(sessionId);
    }
  }
}, 60000);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Linear SQLite MCP Server running on http://localhost:${PORT}/mcp`);
});

export { server };