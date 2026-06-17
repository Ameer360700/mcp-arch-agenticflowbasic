export default {
  name: "log",
  category: "arithmetic",
  description: "Returns the logarithm of a with base b. Example: log(100, 10) = 2",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => Math.log(a) / Math.log(b)
};