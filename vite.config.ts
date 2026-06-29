import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

const isCapacitor = process.env.BUILD_TARGET === 'capacitor'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('.cert/localhost-key.pem'),
      cert: fs.readFileSync('.cert/localhost.pem'),
    },
    port: 5173,
  },
  plugins: [
    react(),
    // When building for Capacitor, stub out the PWA virtual modules
    isCapacitor && {
      name: 'pwa-stub',
      resolveId(id: string) {
        if (id.startsWith('virtual:pwa-register')) return id
      },
      load(id: string) {
        if (id.startsWith('virtual:pwa-register')) {
          return `
            export const useRegisterSW = () => ({
              needRefresh: [false, () => {}],
              offlineReady: [false, () => {}],
              updateServiceWorker: async () => {},
            })
            export const registerSW = () => () => {}
          `
        }
      },
    },
    !isCapacitor && VitePWA({
      registerType: 'prompt',
      devOptions: { enabled: true },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'RunScope',
        short_name: 'RunScope',
        description: 'Share your race progress with friends and family',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/runscope\.stablesea\.net\/api\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ].filter(Boolean),
})