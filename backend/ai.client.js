import axios from "axios";

export class AgentClient {
  constructor(modelName = "qwen2.5:7b", url = "http://localhost:11434/api/chat") {
    this.modelName = modelName;
    this.url = url;
  }

  // builds the tools array in Ollama's native function calling format
  buildToolSpec(availableTools) {
    return availableTools.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" }
          },
          required: ["a", "b"]
        }
      }
    }));
  }

  // single turn: sends full message history + tools, returns raw Ollama message
  async chat(messages, toolSpec) {
    const response = await axios.post(this.url, {
      model: this.modelName,
      messages,
      tools: toolSpec,
      stream: false
    });
    return response.data.message;
  }
}