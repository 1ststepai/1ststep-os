import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/os/',
  plugins: [react()],
  server: { proxy: { '/os/api': 'http://localhost:3000' } },
});
