export default {
  name: "power",
  category: "arithmetic",
  description: "Raise a to the power of b. Example: power(2, 8) = 256",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => Math.pow(a,b)
};