import axios from "axios";

export class OllamaClient {
  constructor(modelName = "llama3.2:3b", url = "http://localhost:11434/api/generate") {
    this.modelName = modelName;
    this.url = url;
  }

  async ask(prompt) {
    const response = await axios.post(this.url, {
      model: this.modelName,
      prompt: prompt,
      stream: false
    });
    return response.data.response;
  }

  async getToolDecision(userPrompt, availableTools) {
    const prompt = `Available tools: ${JSON.stringify(availableTools)}.
User: "${userPrompt}"
Return ONLY JSON: {"name": "tool_name", "a": number, "b": number}
Example: {"name": "add", "a": 5, "b": 3}
Only JSON. No extra text.
`;

    const response = await this.ask(prompt);
    console.log('AI Response',response)
    
    // Clean and parse JSON
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }


  async getSummarizeResult(userPrompt,answer) {
    const prompt = `You are summariser, based on the question ${userPrompt}. 
    you should summarise the answer '${answer}'in plain text.
`;

    const response = await this.ask(prompt);
    console.log('AI Response',response)
    
    // Clean and parse JSON
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return cleaned;
  }
}