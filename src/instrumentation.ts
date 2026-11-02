// Runs once when the server starts (not during `next build`).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("./env");
    getEnv(); // throws with every bad variable named, before the first request
  }
}
