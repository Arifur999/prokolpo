import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pure logic only (schemas, formatters, query strings, route tables). No DOM, no network.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Dates format in the runner's zone; pin it so a laptop in Dhaka and CI in UTC agree.
    env: { TZ: "UTC" },
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
