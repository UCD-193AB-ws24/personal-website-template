import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '__tests__/playwright',
    globalSetup: './playwright.setup.ts',
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
        stderr: 'pipe',
        timeout: 120 * 1000,
      },
    use: {
        baseURL: 'http://localhost:3000',
    },
});
