import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export class CalculatorMCPClient {
  //inializing the url for the mcp-server
  constructor(serverUrl = "http://localhost:4000/sse") {
    this.serverUrl = serverUrl;
    this.client = null;
  }
  //naming the server with its version
  async connect() {
    this.client = new Client(
      { name: "mcp-client", version: "1.0.0" },
      { capabilities: {} }
    );
    //establishing the connection of mcp-client
    const transport = new SSEClientTransport(new URL(this.serverUrl));
    
    await this.client.connect(transport, {
      clientInfo: { name: "mcp-client", version: "1.0.0" }
    });
    
    console.log("✅ MCP Client connected");
  }
  //list of available tools
  async listTools() {
    const result = await this.client.listTools();
    return result.tools;
  }
  //getting the tool from the toollists and executing the actual calculation
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