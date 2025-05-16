import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      // Configure tailwind options
      config: { path: './tailwind.config.js' },
    }),
    react(),
  ],
  // Enable TypeScript strict mode
  typescript: {
    strict: true,
  },
  // Configure output
  output: 'static',
  // Configure build options
  build: {
    // Enable asset hashing for better caching
    assets: 'assets',
  },
  // Configure server options for development
  server: {
    port: 3000,
    host: true,
  },
  // Ensure scripts are properly loaded
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
