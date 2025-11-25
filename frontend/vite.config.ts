import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Desactivar HTTPS por defecto en dev para evitar advertencias de certificado.
// Para activar HTTPS en desarrollo (por ejemplo al usar Quest 2) exporta la
// variable de entorno DEV_HTTPS=true antes de ejecutar el servidor.
// https://vite.dev/config/
const enableHttps = process.env.DEV_HTTPS === 'true' || process.env.HTTPS === 'true'

export default defineConfig({
  plugins: [react(), enableHttps ? basicSsl() : null].filter(Boolean),
  server: {
    https: enableHttps,
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
