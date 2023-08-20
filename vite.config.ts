import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
