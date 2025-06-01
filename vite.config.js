import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/guild-task-assignment/", // Added trailing slash to ensure assets are loaded correctly on GitHub Pages
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // This ensures all assets are emitted as separate files
    rollupOptions: {
      output: {
        manualChunks: undefined // Avoids potential chunk loading issues on GitHub Pages
      }
    }
  }
})