import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Redirige les appels /api vers le backend Express en développement
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
})
