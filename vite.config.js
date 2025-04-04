import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // includeAssets: ['vite.svg'], // We might need this if icons aren't generated automatically
      manifest: {
        name: 'Simple Groceries PWA',
        short_name: 'SimpleGroceries',
        description: 'A simple app for managing grocery lists and recipes.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        // icons: [...] // Temporarily remove the icons array
      }
    })
  ],
})
