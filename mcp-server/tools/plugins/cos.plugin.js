export default {
  name: "cos",
  category: "arithmetic",
  description: "Returns the cosine of a in degrees. Example: cos(0) = 1",
  params: { a: "number" },
  handler: ({ a }) => Math.cos(a * Math.PI / 180)
};