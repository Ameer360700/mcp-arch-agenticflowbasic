import axios from "axios";

export class AgentClient {
  constructor(modelName = "qwen2.5:7b", url = "http://localhost:11434/api/generate") {
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

  async getPlan(userPrompt, availableTools, maxRetries = 3) {
    const prompt = `You are a planning agent. Analyze the user request and return a JSON array of steps to solve it using the available tools.

Available tools: ${JSON.stringify(availableTools)}

Rules:
- Return ONLY a raw JSON array. No explanation, no markdown, no extra text.
- Each step: {"name": "tool_name", "a": number_or___prev__, "b": number_or___prev__}
- Use "__prev__" when a step needs the result of the previous step.

User request: "${userPrompt}"
Respond with only the JSON array, nothing else:`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await this.ask(prompt);
      console.log(`🧠 AI Plan Response (attempt ${attempt}):`, response);

      try {
        let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        cleaned = cleaned.replace(/:(\s*)__prev__/g, ': "__prev__"');

        const matches = [...cleaned.matchAll(/\[[\s\S]*?\]/g)];
        const match = matches[matches.length - 1];
        if (!match) throw new Error("No JSON array found");

        const plan = JSON.parse(match[0]);

        const valid = Array.isArray(plan) &&
          plan.length > 0 &&
          plan.every(step =>
            typeof step === 'object' &&
            typeof step.name === 'string' &&
            ('a' in step) &&
            ('b' in step)
          );

        if (!valid) throw new Error("Plan failed validation");

        return plan;

      } catch (err) {
        console.log(`⚠️  Attempt ${attempt} failed: ${err.message}`);
        if (attempt === maxRetries) throw new Error(`AI failed to produce a valid plan after ${maxRetries} attempts`);
      }
    }
  }
}