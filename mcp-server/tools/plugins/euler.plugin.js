export default {
  name: "euler",
  category: "arithmetic",
  description: "Returns e raised to the power of a (e^a). Example: euler(1) = 2.718",
  params: { a: "number" },
  handler: ({ a }) => Math.exp(a)
};