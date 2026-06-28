import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost:3000" } },
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      // Focus the report on testable logic; presentational components are
      // exercised by the Playwright E2E suite instead.
      include: ["src/lib/**"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/lib/motion.ts"],
      reporter: ["text", "html"],
      thresholds: { statements: 70, branches: 65, functions: 65, lines: 70 },
    },
  },
});
