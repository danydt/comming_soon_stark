import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs/,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', reducedMotion: 'reduce' },
  webServer: {
    command: 'node coming-soon/serve.mjs',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], locale: 'fr-FR' } }],
});
