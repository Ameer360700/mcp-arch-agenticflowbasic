export default {
  name: "modulo",
  category: "arithmetic",
  description:"Returns the remainder when a is divided by b. Example: modulo(10, 3) = 1",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => a % b
};