import { defineConfig } from "@playwright/test";

// End-to-end tests drive the real app against a running prokolpo-backend (see e2e/README.md).
// They use the installed Chrome, so no browser download is needed.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  // One dev server compiles each route on its first visit; parallel workers starve it.
  workers: 1,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3200",
    channel: "chrome",
    locale: "bn-BD",
    trace: "retain-on-failure",
  },
});
