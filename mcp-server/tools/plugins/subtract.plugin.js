export default {
  name: "subtract",
  category: "arithmetic",
  description: "subtract two numbers together",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => a - b
};