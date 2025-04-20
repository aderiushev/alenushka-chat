import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 4000,
    host: true,
    allowedHosts: ['alenushka-pediatr.ru', '192.168.0.19'],
  },
})
