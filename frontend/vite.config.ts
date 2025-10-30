import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // --- ADD THIS 'server' SECTION ---
  server: {
    proxy: {
      // This tells Vite:
      // any request that starts with "/api"
      // should be forwarded to your backend server.
      '/api': {
        target: 'http://localhost:5000', // Your backend's address
        changeOrigin: true, // Recommended for this to work
        secure: false,      // (if your backend isn't https)
      }
    }
  }
})