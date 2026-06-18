export default {
  name: "round",
  category: "arithmetic",
  description: "Rounds a to b decimal places. Example: round(14.9999, 2) = 15.00",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => parseFloat(Number(a).toFixed(Number(b)))
};