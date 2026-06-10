import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**']
  }
})
