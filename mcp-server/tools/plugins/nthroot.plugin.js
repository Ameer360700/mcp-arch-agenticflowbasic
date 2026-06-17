export default {
  name: "nthroot",
  category: "arithmetic",
  description: "Returns the nth root of a. Example: nthroot(27, 3) = 3 (cube root of 27)",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => Math.pow(a, 1 / b)
};