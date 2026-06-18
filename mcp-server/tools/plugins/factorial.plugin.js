export default {
  name: "factorial",
  category: "arithmetic",
  description: "Returns the factorial of a. Example: factorial(5) = 120. Only works for non-negative integers.",
  params: { a: "number" },
  handler: ({ a }) => {
    const n = Math.round(Number(a));
    if (n < 0) return "Error: factorial of negative number is undefined";
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }
};