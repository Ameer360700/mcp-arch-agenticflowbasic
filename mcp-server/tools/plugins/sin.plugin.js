export default {
  name: "sin",
  category: "arithmetic",
  description: "Returns the sine of a in degrees. Example: sin(90) = 1",
  params: { a: "number" },
  handler: ({ a }) => Math.sin(a * Math.PI / 180)
};