import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * End-to-end smoke tests against a production build. Chromium runs the full
 * suite (including real PDF output); WebKit and Firefox run the print-layout
 * checks, which use their own layout engines with print CSS applied.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/create`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    // PLAYWRIGHT_CHANNEL=chrome runs Chromium tests on the installed Google Chrome.
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: process.env.PLAYWRIGHT_CHANNEL } },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, grep: /@layout/ },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, grep: /@layout/ },
  ],
});
