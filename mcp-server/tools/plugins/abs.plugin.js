export default {
  name: "abs",
  category: "arithmetic",
  description: "Returns the absolute value of a. Example: abs(-5) = 5",
  params: { a: "number" },
  handler: ({ a }) => Math.abs(a)
};