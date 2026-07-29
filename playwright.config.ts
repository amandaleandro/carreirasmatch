import { defineConfig, devices } from "@playwright/test";

/**
 * Reaproveita o dev server já rodando em :3005 (start.sh/npm run dev do
 * projeto usa portas variáveis quando 3000 está ocupada); sobe um novo se
 * nenhum estiver de pé. Ver AGENTS.md: este Next.js customizado tem docs
 * próprias em node_modules/next/dist/docs antes de mudar convenções.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3005",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 3005",
        url: "http://localhost:3005",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
