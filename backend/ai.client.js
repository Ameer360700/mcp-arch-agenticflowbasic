import OpenAI from "openai";
import dotenv from "dotenv";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-0a90024144b1452a80b284011f84caa3", // your actual key
});
export class AgentClient {
  constructor(modelName = "deepseek-v4-pro") {
    this.modelName = modelName;
  }

  buildToolSpec(availableTools) {
  return availableTools.map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: {
          a: { type: "string", description: "First input (number or constant name)" },
          b: { type: "number", description: "Second number (if required)" }
        },
        required: ["a"]
      }
    }
  }));
}

  async chat(messages, toolSpec) {
    const response = await openai.chat.completions.create({
      model: this.modelName,
      messages,
      tools: toolSpec,
      stream: false
    });
    return response.choices[0].message;
  }
}