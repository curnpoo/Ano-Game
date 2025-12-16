import { defineConfig } from 'vite'
import fs from 'fs'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/storage', 'firebase/analytics', 'firebase/functions'],
          'vendor-ui': ['@use-gesture/react'],
          'vendor-utils': ['react-qr-code'],
        }
      }
    },
  },

  define: {
    '__BUILD_TIME__': JSON.stringify(JSON.parse(fs.readFileSync('public/version.json', 'utf-8')).buildTime)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Use custom source service worker with Firebase messaging
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'classic' // Use classic mode to support importScripts()
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'ANO Draw',
        short_name: 'ANO',
        description: 'The party drawing game!',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

