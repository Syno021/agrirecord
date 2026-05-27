import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@web': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname),
    },
  },
  root: '.',
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
});
