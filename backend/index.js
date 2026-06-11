import readline from 'readline';
import { AgentMCPClient } from './mcp.client.js';
import { AgentClient } from './ai.client.js';

async function main() {
  console.log("=== MCP Agentic Flow ===\n");

  const mcp = new AgentMCPClient();
  const ai = new AgentClient();

  await mcp.connect();

  const tools = await mcp.listTools();
  console.log("Available tools:", tools.map(t => t.name).join(", "));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askUser = (q) => new Promise(resolve => rl.question(q, resolve));

  let running = true;
  while (running) {
    const userPrompt = await askUser("\nEnter prompt: ");
    if (!userPrompt.trim()) continue;

    // Step 1: get full plan from AI
    const plan = await ai.getPlan(userPrompt, tools);
    console.log("📋 Plan:", JSON.stringify(plan, null, 2));

    // Step 2: execute each step, chaining results via __prev__
    let prevResult = null;
    for (let i = 0; i < plan.length; i++) {
      const step = plan[i];

      const a = step.a === "__prev__" ? prevResult : step.a;
      const b = step.b === "__prev__" ? prevResult : step.b;

      console.log(`⚙️  Step ${i + 1}: ${step.name}(${a}, ${b})`);
      prevResult = Number(await mcp.callTool(step.name, { a: Number(a), b: Number(b) }));
      console.log(`   → ${prevResult}`);
    }

    console.log(`\n✅ Answer: ${prevResult}`);

    const again = await askUser("\nContinue? (yes/no): ");
    if (again.toLowerCase() !== 'yes') running = false;
  }

  rl.close();
  await mcp.close();
  console.log("👋 Goodbye!");
}

main().catch(console.error);