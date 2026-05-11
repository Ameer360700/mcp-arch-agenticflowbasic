import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export class CalculatorMCPClient {
  constructor(serverUrl = "http://localhost:3000/sse") {
    this.serverUrl = serverUrl;
    this.client = null;
  }

  async connect() {
    this.client = new Client(
      { name: "mcp-client", version: "1.0.0" },
      { capabilities: {} }
    );

    const transport = new SSEClientTransport(new URL(this.serverUrl));
    
    await this.client.connect(transport, {
      clientInfo: { name: "mcp-client", version: "1.0.0" }
    });
    
    console.log("✅ MCP Client connected");
  }

  async listTools() {
    const result = await this.client.listTools();
    return result.tools;
  }

  async callTool(name, args) {
    const result = await this.client.callTool({
      name: name,
      arguments: args
    });
    return result.content[0].text;
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}