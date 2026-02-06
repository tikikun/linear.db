import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema, isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { Request, Response } from "express";
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

// Function to create a new MCP server instance
function createServer(): Server {
  const server = new Server(
    { name: "linear-sqlite-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // Set up request handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

  return server;
}

// Session management - store transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Create Express app with custom DNS rebinding protection disabled for cloudflare tunnels
import express from "express";
const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", server: "linear-sqlite-mcp" });
});

// MCP endpoint - POST for client-to-server messages
app.post("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  try {
    // Reuse existing transport for established sessions
    if (sessionId && transports[sessionId]) {
      await transports[sessionId].handleRequest(req, res, req.body);
      return;
    }

    // New session initialization
    if (!sessionId && isInitializeRequest(req.body)) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true, // Fast JSON responses instead of SSE
        onsessioninitialized: (sid) => {
          console.log(`Session initialized: ${sid}`);
          transports[sid] = transport;
        },
      });

      // Clean up on close
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Session closed: ${sid}`);
          delete transports[sid];
        }
      };

      // Connect transport to a new server instance and handle request
      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);

      // Clean up on response close
      res.on("close", () => {
        // Keep the transport alive for the session, only clean up the server connection
      });
      return;
    }

    // Invalid request - no session ID for non-initialization request
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
      id: null,
    });
  } catch (error: any) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

// MCP endpoint - GET for SSE streams (optional, return 405 if not supported)
app.get("/mcp", (_req: Request, res: Response) => {
  // Per spec: return 405 if server doesn't offer SSE stream at this endpoint
  res.status(405).set("Allow", "POST, DELETE").send("Method Not Allowed");
});

// MCP endpoint - DELETE for session termination
app.delete("/mcp", (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  
  if (sessionId && transports[sessionId]) {
    console.log(`Session terminated by client: ${sessionId}`);
    transports[sessionId].close();
    delete transports[sessionId];
    res.status(200).end();
  } else {
    // Per spec: server MAY respond with 405 if it doesn't allow clients to terminate sessions
    res.status(404).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Session not found",
      },
      id: null,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Linear SQLite MCP Server running on http://localhost:${PORT}/mcp`);
  console.log(`Using Streamable HTTP transport with JSON response mode`);
});

// Handle server shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  // Close all active sessions
  for (const [sessionId, transport] of Object.entries(transports)) {
    console.log(`Closing session: ${sessionId}`);
    await transport.close();
  }
  process.exit(0);
});
