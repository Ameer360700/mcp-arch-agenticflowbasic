export default {
  name: "squareroot",
  category: "arithmetic",
  description: "square root of a number",
  params: { a: "number"},
  handler: ({ a }) => { Math.sqrt(a)}
};

