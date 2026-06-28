import { defineConfig, devices } from "@playwright/test";

// E2E runs against a REAL, seeded stack (frontend + backend + postgres). Locally
// bring the stack up first; in CI/Docker the test compose provides it and sets
// PLAYWRIGHT_BASE_URL. No webServer here — the stack is external on purpose.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 10_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
