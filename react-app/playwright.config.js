import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js',
    port: 5173,
    reuseExistingServer: true,
    timeout: 15000,
  },
});
