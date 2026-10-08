import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// "npm run build:pages" compila en modo "pages" con la base del repo de GitHub Pages
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/Portafolio2026/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
}));
