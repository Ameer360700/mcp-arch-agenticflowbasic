export default {
  name: "divide",
  category: "arithmetic",
  description: "Divide two numbers together",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => a / b
};