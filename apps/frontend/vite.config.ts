import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: '/chat/',
  server: {
    port: 4000,
    host: true,
    allowedHosts: ['alenushka-pediatr.ru']
  },
})
