// vite.config.js
// --------------------------------------------------------------------
// Vite dev server proxies /api/* to the Express backend on :5000
// so the frontend can call relative URLs like fetch('/api/auth/login')
// without CORS headaches in development.
// --------------------------------------------------------------------

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
