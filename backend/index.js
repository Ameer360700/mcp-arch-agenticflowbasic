import readline from 'readline';
import { AgentMCPClient } from './mcp.client.js';
import { OllamaClient } from './ai.client.js';

async function main() {
  console.log("=== MCP Agentic Flow ===\n");
  
  // 1. Initialize clients
  const mcp = new AgentMCPClient();
  const ai = new OllamaClient();

  // 2. Connect to MCP server
  await mcp.connect();

  // 3. Get available tools
  const tools = await mcp.listTools();
  console.log("Available tools:", tools.map(t => t.name).join(", "));

  // 4. Setup user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askUser = (q) => new Promise(resolve => rl.question(q, resolve));
  //any number of questions can be asked, it asks y/n if you want to go further or not
  let running = true;
  while (running) {
    const userPrompt = await askUser("\n🤖 Enter Prompt: ");
    if (!userPrompt.trim()) continue;

    // mcp client to AI Call making the decision
    const decision = await ai.getToolDecision(userPrompt, tools);
    console.log(`🤖 AI decides: ${decision.name}(${decision.a}, ${decision.b})`);

    // mcp client to MCP server call, here the tool needed for this decision is fetched
    const result = await mcp.callTool(decision.name, { a: decision.a, b: decision.b });
   

    // mcp client to AI Call , giving the summarized result after getting answer from the mcp-server
    const revisedResult = await ai.getSummarizeResult(userPrompt, result);
    console.log(`✅ Result: ${revisedResult}`);
    
    const again = await askUser("\nContinue? (yes/no): ");
    if (again.toLowerCase() !== 'yes') running = false;
  }

  rl.close();
  await mcp.close();
  console.log("👋 Goodbye!");
}

main().catch(console.error);