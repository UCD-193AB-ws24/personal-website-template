import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}']
  },
  esbuild: {
    jsx: 'automatic'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },

  // Uncomment below if needed:
  // tsconfig: './tsconfig.vitest.json'
})
