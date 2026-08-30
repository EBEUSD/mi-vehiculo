import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'https://marketplace-autos-backend.onrender.com'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

