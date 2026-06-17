export default {
  name: "tan",
  category: "arithmetic",
  description: "Returns the tangent of a in degrees. Example: tan(45) = 1",
  params: { a: "number" },
  handler: ({ a }) => Math.tan(a * Math.PI / 180)
};