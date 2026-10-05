import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // запросы /api/* проксируются на backend, чтобы не настраивать CORS в разработке
    proxy: { '/api': 'http://localhost:8000' },
  },
})
