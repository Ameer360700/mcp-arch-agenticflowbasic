export default {
  name: "square",
  category: "arithmetic",
  description: "Returns a squared (a * a). Example: square(6) = 36",
  params: { a: "number" },
  handler: ({ a }) => Math.pow(a, 2)
};