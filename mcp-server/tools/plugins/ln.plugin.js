export default {
  name: "ln",
  category: "arithmetic",
  description: "Returns the natural logarithm (base e) of a. Example: ln(1) = 0",
  params: { a: "number" },
  handler: ({ a }) => Math.log(a)
};