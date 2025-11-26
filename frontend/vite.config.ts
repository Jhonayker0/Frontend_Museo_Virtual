import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// HTTPS habilitado por defecto para VR (Meta Quest 2)
// https://vite.dev/config/
const enableHttps = true

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    host: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      }
    }
  }
})
