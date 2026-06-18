export default {
  name: "verify",
  category: "arithmetic",
  description: "Verify a result. Pass expected value as 'a' and actual computed value as 'b'",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) => {
    const diff = Math.abs(Number(a) - Number(b));
    return diff < 1e-9
      ? `confirmed: ${b}`
      : `mismatch: expected ${a} but got ${b}`;
  }
};