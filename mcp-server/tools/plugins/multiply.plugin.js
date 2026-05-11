export default {
  name: "multiply",
  category: "arithmetic",
  description: "multiply two numbers together",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => a * b
};