import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BACKEND = 'https://marketplace-autos-backend.onrender.com'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mi Vehículo',
        short_name: 'Mi Vehículo',
        description: 'Comprá y vendé vehículos, repuestos y accesorios en El Salvador.',
        theme_color: '#0b1b4d',
        background_color: '#0b1b4d',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/pwa-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        runtimeCaching: [
          {
            // Solo catálogo público (GET). Nunca cachear perfil, favoritos, consultas,
            // pagos ni admin: el caché no distingue usuarios y queda tras el logout.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              !request.headers.has('Authorization') &&
              // Literal: esta función se copia al service worker y no ve variables de este archivo
              url.origin === 'https://marketplace-autos-backend.onrender.com' &&
              /^\/api\/v1\/(vehicles|products|catalog|location|locations)(\/|\?|$)/.test(url.pathname) &&
              !/^\/api\/v1\/vehicles\/me\b/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    // Exponer en la red local solo cuando se prueba en el celular: VITE_HOST=1 npm run dev
    host: !!globalThis.process?.env.VITE_HOST,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
