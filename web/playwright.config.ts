import { defineConfig, devices } from '@playwright/test'

/** Parcours critiques. Nécessite une base configurée dans .env (pnpm dev est lancé automatiquement). */
export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/fr',
    reuseExistingServer: true,
    timeout: 240_000,
  },
})
