// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to the backend during development
    proxy: {
      '/api': {
        target: 'https://expense-tracker-5i3x.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
