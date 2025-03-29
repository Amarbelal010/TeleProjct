import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    strictPort: false,
    cors: true,
    allowedHosts: ['.ngrok-free.app', '.trycloudflare.com']
  }
});
