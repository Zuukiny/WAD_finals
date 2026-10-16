import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '^/login$': {
        target: 'http://localhost:3000',
        bypass: (req) => {
          if (req.method === 'GET') {
            // Returning the (unchanged) url tells Vite to skip the proxy
            // and continue its own middleware chain (SPA fallback) instead.
            return req.url
          }
          // returning undefined here means: proxy it (POST /login call)
        },
      },
      '^/loc($|/)': 'http://localhost:3000',
      '^/uploads/': 'http://localhost:3000',
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
