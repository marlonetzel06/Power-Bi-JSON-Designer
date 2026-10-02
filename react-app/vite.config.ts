import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// BASE_PATH is set by the GitHub Pages deploy workflow (e.g. "/Power-Bi-JSON-Designer/").
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('powerbi-client')) return 'vendor-pbi';
          if (id.includes('@azure/msal')) return 'vendor-msal';
          if (id.includes('reportThemeSchema')) return 'pbi-schema';
          return undefined;
        },
      },
    },
  },
});
