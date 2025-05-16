/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // If you're testing React components/hooks

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Add react plugin if testing React components
  test: {
    globals: true,
    environment: 'jsdom', // For testing browser-specific features like localStorage and React components
    setupFiles: './vitest.setup.ts', // Optional: for global test setup
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
    },
    // To allow __tests__ directories or *.test.ts files anywhere
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    alias: {
      // Match your tsconfig.json paths alias
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
