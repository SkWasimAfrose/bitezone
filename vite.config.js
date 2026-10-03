import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/__/]
      },
      manifest: {
        name: 'Bitezone',
        short_name: 'Bitezone',
        description: 'Order from your favorite local restaurants faster.',
        theme_color: '#e7532d',
        background_color: '#FBF5EC',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
