export default {
  name: "square",
  category: "arithmetic",
  description: "square input number",
  params: { a: "number"},
  handler: ({ a }) => a * a
};