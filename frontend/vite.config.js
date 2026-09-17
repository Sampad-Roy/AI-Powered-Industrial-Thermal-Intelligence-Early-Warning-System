import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    historyApiFallback: true,
    proxy: {
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/predict': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
