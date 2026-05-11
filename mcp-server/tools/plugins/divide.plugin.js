export default {
  name: "divide",
  category: "arithmetic",
  description: "divide a with b",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => a / b
};