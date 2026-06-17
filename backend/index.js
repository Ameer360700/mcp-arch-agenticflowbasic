import readline from 'readline';
import { AgentMCPClient } from './mcp.client.js';
import { AgentClient } from './ai.client.js';

const SYSTEM_PROMPT = `You are a math execution agent. You solve multi-step math problems one step at a time.
Rules:
- Identify the FIRST unsolved operation and call the appropriate tool (ACT).
- Immediately after receiving a result, call verify(expected, actual) to confirm it (VERIFY).
- Only proceed to the next operation after verification passes.
- If verify returns a mismatch, redo the previous operation.
- For multiplication, use repeated addition by adding the SAME number repeatedly.
  Example: 6x8 means start with 0, then add 6 exactly 8 times: 
  add(0,6)=6, add(6,6)=12, add(12,6)=18 ... until you have added 6 eight times.
- After each add, call verify where a = the result you just received, and b = the result you just received. Both must be the same number to confirm.
  Example: add(6,6) returns 12, so call verify(a=12, b=12).
- Never call more than one tool per turn.
- Never output a plan or list of steps.
- You are an AI agent. NEVER output text like "Veronica" or any names. NEVER embed tool calls in text content. ALWAYS use the tool_calls format exclusively.
- When all operations are done and verified, output ONLY the final numeric answer as plain text.`;


const MAX_LOOP_TURNS = 20;
const MAX_RETRIES = 3;

async function main() {
  console.log("=== MCP Agentic Flow ===\n");

  const mcp = new AgentMCPClient();
  const ai = new AgentClient();

  // Connect to your MCP Server infrastructure
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

    // Initialize full message history array for tracking the context window state
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: userPrompt }
    ];

    let turnCount = 0;
    let finalAnswer = null;
    
    // 🌟 Live visual accumulation accumulator string
    let visualChain = ""; 

    // Dynamic ReAct loop execution
    while (turnCount < MAX_LOOP_TURNS) {
      turnCount++;
      console.log(`\n🔄 Turn ${turnCount}`);

      // Dispatch chat state to the local AI model with built-in network retry logic
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

      // CASE 1: AI decides to invoke an atomic tool call
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        const toolCall = aiMessage.tool_calls[0]; // Enforce single tool evaluation constraint
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

        const numA = Number(parsedArgs.a);
        const numB = Number(parsedArgs.b);

        console.log(`⚙️  Tool call: ${name}(${numA}, ${numB})`);

        // Record the assistant's action intent to history
        messages.push({ role: "assistant", content: null, tool_calls: [toolCall] });

        let toolResultContent;
        try {
          // Fire request via the MCP transport client
          toolResultContent = await mcp.callTool(name, { a: numA, b: numB });
          const numericResult = Number(toolResultContent);
          
          if (name === 'verify') {
             console.log(`✅ Verify: ${toolResultContent}`);
          } 
          else {
                if (visualChain === "") {
                    visualChain = `(${numA} + ${numB})`;
                    } 
                else {
                    visualChain += ` ➔ (${numA} + ${numB})`;
                  }
                console.log(`📊 Current Accumulation: ${visualChain} = ${numericResult}`);
          }

        } catch (err) {
          // 🌟 SELF-HEALING BLOCK: Rewrite exception safely for the LLM to process next turn
          toolResultContent = `ERROR: Tool execution failed with message: "${err.message}". The previous state remains valid. Please retry this calculation step or recompute from the last successful result.`;
          console.log(`   → ⚠️  Execution captured: ${err.message}`);
        }

       messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
       name: name,
       content: String(toolResultContent)
       });

        continue; // Cycle back immediately for the next turning state
      }

      // CASE 2: AI provides raw textual terminal output (The Calculation Is Fully Resolved)
      if (aiMessage.content && aiMessage.content.trim()) {
        finalAnswer = aiMessage.content.trim();
        
        // 🌟 Close out accumulation chain metrics visually
        if (visualChain !== "") {
          visualChain += ` ➔ (${finalAnswer}) 🎉`;
          console.log(`\n📈 Complete Execution Path:\n✨ ${visualChain}`);
        }
        
        break;
      }

      // CASE 3: Empty response edge-case guardrail
      console.log("⚠️  AI returned empty response, retrying turn...");
      messages.push({
        role: "user",
        content: "Please continue. Either call the next tool or give the final answer."
      });
    }

    // Display loop termination conclusion
    if (finalAnswer) {
      console.log(`\n✅ Answer: ${finalAnswer}`);
    } else {
      console.log(`\n⚠️  Loop ended without a final answer after ${MAX_LOOP_TURNS} turns.`);
    }

    const again = await askUser("\nContinue? (yes/no): ");
    if (again.toLowerCase() !== 'yes') running = false;
  }

  // Graceful application cleanup
  rl.close();
  await mcp.close();
  console.log("👋 Goodbye!");
}

main().catch(console.error);