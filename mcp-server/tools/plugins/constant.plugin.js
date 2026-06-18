export default {
  name: "constants",
  category: "arithmetic",
  description: "Returns a mathematical constant by name. Pass the constant name as 'a' (not a number). Supported: 'pi' = 3.14159, 'e' = 2.71828, 'phi' = 1.61803, 'sqrt2' = 1.41421",
  params: { a: "string" },
  handler: ({ a }) => {
    const map = {
      pi: Math.PI,
      e: Math.E,
      phi: (1 + Math.sqrt(5)) / 2,
      sqrt2: Math.SQRT2
    };
    const key = String(a).toLowerCase().trim();
    return map[key] ?? `Error: unknown constant '${a}'`;
  }
};
 