import readline from 'readline';
import { AgentMCPClient } from './mcp.client.js';
import { AgentClient } from './ai.client.js';

const SYSTEM_PROMPT = `You are a math execution agent. You solve multi-step math problems one step at a time.

Rules:
- Evaluate the user's request and identify the FIRST unsolved math operation.
- Call the appropriate tool for that single operation ONLY. Do not plan ahead.
- After receiving a tool result, re-read the full history and identify the next unsolved operation.
- Repeat until all operations are complete.
- When all math is done, output ONLY the final numeric answer as plain text. No explanation.
- Never call more than one tool per turn.
- Never output a plan or list of steps.`;

const MAX_LOOP_TURNS = 10;
const MAX_RETRIES = 3;

async function main() {
  console.log("=== MCP Agentic Flow ===\n");

  const mcp = new AgentMCPClient();
  const ai = new AgentClient();

  await mcp.connect();

  const tools = await mcp.listTools();
  console.log("Available tools:", tools.map(t => t.name).join(", "));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const askUser = (q) => new Promise(resolve => rl.question(q, resolve));

  let running = true;
  while (running) {
    const userPrompt = await askUser("\nEnter prompt: ");
    if (!userPrompt.trim()) continue;

    const toolSpec = ai.buildToolSpec(tools);

    // message history — this is the full context window passed to the AI each turn
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: userPrompt }
    ];

    let turnCount = 0;
    let finalAnswer = null;

    // ReAct loop
    while (turnCount < MAX_LOOP_TURNS) {
      turnCount++;
      console.log(`\n🔄 Turn ${turnCount}`);

      // call AI with full history
      let aiMessage;
      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          aiMessage = await ai.chat(messages, toolSpec);
          break;
        } catch (err) {
          retries++;
          console.log(`⚠️  AI call failed (attempt ${retries}): ${err.message}`);
          if (retries === MAX_RETRIES) throw err;
        }
      }

      console.log("🧠 AI message:", JSON.stringify(aiMessage, null, 2));

      // case 1: AI wants to call a tool
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        const toolCall = aiMessage.tool_calls[0]; // enforce one tool at a time
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

        console.log(`⚙️  Tool call: ${name}(${parsedArgs.a}, ${parsedArgs.b})`);

        // append AI's tool call turn to history
        messages.push({ role: "assistant", content: null, tool_calls: [toolCall] });

        // execute tool, catch errors and feed back into history
        let toolResultContent;
        try {
          toolResultContent = await mcp.callTool(name, { a: Number(parsedArgs.a), b: Number(parsedArgs.b) });
          console.log(`   → ${toolResultContent}`);
        } catch (err) {
          toolResultContent = `ERROR: Tool execution failed with message: "${err.message}". The previous state remains valid. Please retry this calculation step or recompute from the last successful result.`;
          console.log(`   → ⚠️  Execution captured: ${err.message}`);
        }

        // append tool result to history — AI reads this next turn
        messages.push({
          role: "tool",
          name: name,
          content: String(toolResultContent)
        });

        continue; // next turn
      }

      // case 2: AI outputs final text answer
      if (aiMessage.content && aiMessage.content.trim()) {
        finalAnswer = aiMessage.content.trim();
        break;
      }

      // case 3: neither tool call nor text — shouldn't happen, but guard it
      console.log("⚠️  AI returned empty response, retrying turn...");
      messages.push({
        role: "user",
        content: "Please continue. Either call the next tool or give the final answer."
      });
    }

    if (finalAnswer) {
      console.log(`\n✅ Answer: ${finalAnswer}`);
    } else {
      console.log(`\n⚠️  Loop ended without a final answer after ${MAX_LOOP_TURNS} turns.`);
    }

    const again = await askUser("\nContinue? (yes/no): ");
    if (again.toLowerCase() !== 'yes') running = false;
  }

  rl.close();
  await mcp.close();
  console.log("👋 Goodbye!");
}

main().catch(console.error);