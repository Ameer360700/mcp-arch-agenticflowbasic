export default {
  name: "multiply",
  category: "arithmetic",
  description: "Multiply two numbers together",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => a * b
};