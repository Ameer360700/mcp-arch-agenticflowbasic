export default {
  name: "sqrt",
  category: "arithmetic",
  description: "Returns the square root of a. Example: sqrt(25) = 5",
  params: { a: "number" },
  handler: ({ a }) => Math.sqrt(a)
};