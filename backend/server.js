import express from "express";
import cors from "cors";
import { AgentClient } from "./ai.client.js";
import { AgentMCPClient } from "./mcp.client.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

const SYSTEM_PROMPT = `You are a calculator assistant. You solve any math problem the user gives you, step by step.

You understand natural language math requests like:
- "what is 15% of 2400"
- "split 1200 among 4 people with 18% tip"
- "what is 2 to the power of 8"
- "find average of 45, 67, 89, 23"
- Raw expressions like "(10 + 5) * 3 - 8 / 2"

BODMAS ORDER: Brackets → Powers → Division → Multiplication → Addition → Subtraction

Rules:
- Break the problem into atomic operations and solve one at a time.
- Always follow BODMAS order.
- After each operation, immediately call verify(a, b) where both a and b are the result you just received.
- Only proceed after verification passes.
- If verify returns a mismatch, redo the previous operation.
- Never call more than one tool per turn.
- Never output a plan or list of steps.
- When fully solved and verified, output ONLY the final numeric answer as plain text. No explanation.`;

const MAX_LOOP_TURNS = 20;
const MAX_RETRIES = 3;

const mcp = new AgentMCPClient();
const ai = new AgentClient();

let mcpReady = false;
let tools = [];

async function initMCP() {
  await mcp.connect();
  tools = await mcp.listTools();
  mcpReady = true;
  console.log("✅ MCP connected. Tools:", tools.map(t => t.name).join(", "));
}

// SSE endpoint — streams each step back to frontend
app.post("/chat", async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt || !mcpReady) {
    return res.status(400).json({ error: "Not ready or missing prompt" });
  }

  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  const toolSpec = ai.buildToolSpec(tools);

  // Build message history from previous context
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(history || []),
    { role: "user", content: prompt }
  ];

  let turnCount = 0;
  let finalAnswer = null;

  while (turnCount < MAX_LOOP_TURNS) {
    turnCount++;

    let aiMessage;
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        aiMessage = await ai.chat(messages, toolSpec);
        break;
      } catch (err) {
        retries++;
        if (retries === MAX_RETRIES) {
          send("error", { message: err.message });
          res.end();
          return;
        }
      }
    }

    // CASE 1: Tool call
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolCall = aiMessage.tool_calls[0];
      const { name, arguments: args } = toolCall.function;
      const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

      const numA = isNaN(Number(parsedArgs.a)) ? parsedArgs.a : Number(parsedArgs.a);
      const numB = Number(parsedArgs.b);

      messages.push({ role: "assistant", content: null, tool_calls: [toolCall] });

      let toolResultContent;
      try {
        toolResultContent = await mcp.callTool(name, { a: numA, b: numB });

        if (name === "verify") {
          send("verify", { text: toolResultContent });
        } else {
          const operator = name === "subtract" ? "-"
            : name === "multiply" ? "×"
            : name === "divide" ? "÷"
            : "+";
          send("step", {
            label: name,
            expr: isNaN(numB)
              ? `${name}(${numA})`
              : `${numA} ${operator} ${numB}`,
            result: String(toolResultContent)
          });
        }
      } catch (err) {
        toolResultContent = `ERROR: ${err.message}`;
        send("error", { message: err.message });
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name,
        content: String(toolResultContent)
      });

      continue;
    }

    // CASE 2: Final answer
    if (aiMessage.content && aiMessage.content.trim()) {
      finalAnswer = aiMessage.content.trim();
      send("answer", { value: finalAnswer });
      break;
    }

    // CASE 3: Empty response
    messages.push({
      role: "user",
      content: "Please continue. Either call the next tool or give the final answer."
    });
  }

  if (!finalAnswer) {
    send("error", { message: "Loop ended without a final answer." });
  }

  res.end();
});

// Health check
app.get("/status", (req, res) => {
  res.json({ ready: mcpReady, tools: tools.map(t => t.name) });
});

const PORT = 3001;
initMCP().then(() => {
  app.listen(PORT, () => {
    console.log(`🌐 CalcAI server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize MCP:", err);
  process.exit(1);
});