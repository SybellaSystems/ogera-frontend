import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    hmr: {
      host: 'app.ogera.sybellasystems.co.rw',
      protocol: 'ws'
    },

    allowedHosts: [
      'app.ogera.sybellasystems.co.rw'
    ]
  }
})

