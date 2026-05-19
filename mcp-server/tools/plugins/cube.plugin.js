export default {
  name: "cube",
  category: "arithmetic",
  description: "cube of a number",
  params: { a: "number" },
  handler: ({ a }) => a * a * a
};