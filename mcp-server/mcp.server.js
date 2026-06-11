import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { loadAllPlugins, getAllCategories, getToolsByCategory } from "./tools/index.js";

//establishes foundational framework for webserver
const app = express();
app.use(cors());

// an empty phase book is created, to track active users/clients connected to the stream
const transports = new Map();

async function startServer() {
  console.log("\n🚀 Loading plugins...\n");
  
  // Load all plugins dynamically
  const plugins = await loadAllPlugins();
  console.log(`\n✅ Loaded ${plugins.length} plugins\n`);
  
  // Create MCP Server
  const mcpServer = new McpServer({
    name: "agent-sse-server",
    version: "1.0.0"
  });
  
  // Register all plugins as tools
  for (const plugin of plugins) {
    // Build Zod schema dynamically from params -> structural definitons to prevent AI
    // sending corrupted data, basically a validation  
    const schemaObj = {};
    for (const [paramName, paramType] of Object.entries(plugin.params)) {
      if (paramType === "number") schemaObj[paramName] = z.number();
      else if (paramType === "string") schemaObj[paramName] = z.string();
      else if (paramType === "boolean") schemaObj[paramName] = z.boolean();
    }
    
    mcpServer.registerTool(
      plugin.name,
      {
        title: plugin.name,
        description: plugin.description,
        category: plugin.category,
        inputSchema: schemaObj
      },
      // if any type of error is present, it wont crash the server, instead it gracefully embraces
      // the error and displays the error message
      async (args) => {
        try {
          const result = plugin.handler(args);
          return { content: [{ type: "text", text: String(result) }] };
        } catch (error) {
          return { 
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true
          };
        }
      }
    );
    
    console.log(`  🔧 Registered tool: ${plugin.name}`);
  }
  
  // SSE endpoint
  app.get("/sse", async (req, res) => {
    console.log("📡 New SSE connection");
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);
    transport.onclose = () => transports.delete(transport.sessionId);
    await mcpServer.connect(transport);
  });
  
  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports.get(sessionId);
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(404).send("Session not found");
    }
  });
  
  // API endpoints for plugin discovery
  app.get("/plugins", (req, res) => {
    res.json({ 
      total: plugins.length,
      plugins: plugins.map(p => ({ name: p.name, category: p.category, description: p.description }))
    });
  });
  
  app.get("/plugins/categories", (req, res) => {
    res.json({ categories: getAllCategories(plugins) });
  });
  
  app.get("/plugins/category/:name", (req, res) => {
    const tools = getToolsByCategory(plugins, req.params.name);
    res.json({ category: req.params.name, tools: tools.map(t => t.name) });
  });
  
  // Health check, status of the server 
  app.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      server: "agent-sse-server",
      plugins: plugins.length,
      categories: getAllCategories(plugins)
    });
  });
  //we gave a port number for this server
  const PORT = 4001;
  app.listen(PORT, () => {
    console.log(`\n🤖 Agent Server running on http://localhost:${PORT}`);
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`🔧 Total agent tools: ${plugins.length}`);
    console.log(`📂 Categories: ${getAllCategories(plugins).join(", ")}\n`);
  });
}
startServer().catch(console.error);