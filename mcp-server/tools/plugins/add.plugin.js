export default {
  name: "add",
  category: "arithmetic",
  description: "Add two numbers together",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => a + b
};