import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa' // Removed

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    // vite-plugin-pwa completely removed
  ],
})
