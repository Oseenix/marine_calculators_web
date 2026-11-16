import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/calculator/',
  plugins: [vue()],
  test: {
    environment: 'jsdom',
  },
})
