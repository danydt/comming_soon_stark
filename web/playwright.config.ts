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
    // « / » répond tout de suite (redirection du proxy) ; /fr peut être long au premier rendu.
    url: 'http://localhost:3000/',
    reuseExistingServer: true,
    timeout: 240_000,
  },
})
