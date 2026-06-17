export default {
  name: "verify",
  category: "arithmetic", 
  description: "Verify a result. Pass expected value as 'a' and actual computed value as 'b'",
  params: { a: "number", b: "number" },
  handler: ({ a, b }) =>
    Number(a) === Number(b)
      ? `confirmed: ${b}`
      : `mismatch: expected ${a} but got ${b}`
};