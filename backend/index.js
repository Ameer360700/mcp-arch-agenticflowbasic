import readline from 'readline';
import { CalculatorMCPClient } from './mcp.client.js';
import { OllamaClient } from './ai.client.js';

async function main() {
  console.log("=== MCP Calculator with Clean Architecture ===\n");

  // 1. Initialize clients
  const mcp = new CalculatorMCPClient();
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

  let running = true;
  while (running) {
    const userPrompt = await askUser("\n🧮 Math question: ");
    if (!userPrompt.trim()) continue;

    // mcp client to AI Call
    const decision = await ai.getToolDecision(userPrompt, tools);
    console.log(`🤖 AI decides: ${decision.name}(${decision.a}, ${decision.b})`);

    // mcp client to MCP server call
    const result = await mcp.callTool(decision.name, { a: decision.a, b: decision.b });
   

    // mcp client to AI Call
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