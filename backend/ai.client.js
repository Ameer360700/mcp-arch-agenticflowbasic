import axios from "axios";

//Here we decide the model and the url of Ollama
export class OllamaClient {
  constructor(modelName = "llama3.2:3b", url = "http://localhost:11434/api/generate") {
    this.modelName = modelName;
    this.url = url;
  }
  //this section, given the prompt the axios tool shoot a POST request to the local AI engine,
  // waits for the answer and returns the text response
  async ask(prompt) {
    const response = await axios.post(this.url, {
      model: this.modelName,
      prompt: prompt,
      stream: false
    });
    return response.data.response;
  }
  //this function forces the model to behave like an intelligent agent, rather than a simple chatbot,
  // we can provide rules on how to behave accoriding to the prompt etc, using the given prompt,
  // based on the available tools, response is also given
  async getToolDecision(userPrompt, availableTools) {
  const prompt = `Available tools: ${JSON.stringify(availableTools)}.

  CRITICAL RULE FOR SUBTRACTION: 
  When a user asks to "subtract X from Y", the mathematical operation is Y - X. 
  Because our tools compute (a - b), you must assign a = Y and b = X.

  Return ONLY JSON matching this format: {"name": "tool_name", "a": number, "b": number}

  EXAMPLES:
  - User: "What is 5 plus 3?" -> {"name": "add", "a": 5, "b": 3}
  - User: "What is the value when we subtract 30 from 80?" -> {"name": "subtract", "a": 80, "b": 30}
  - User: "Take away 10 from 100" -> {"name": "subtract", "a": 100, "b": 10}

  User Question: "${userPrompt}"
  Only JSON. No extra conversational text or markdown code blocks.
  `;

  const response = await this.ask(prompt);
  console.log('AI Response', response)

  // Clean and parse JSON
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
  //instead of providing a direct answer, a summarized meainingful text along with the answer
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