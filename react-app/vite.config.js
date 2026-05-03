import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('powerbi-client')) return 'vendor-pbi';
          if (id.includes('@azure/msal')) return 'vendor-msal';
        },
      },
    },
  },
})
