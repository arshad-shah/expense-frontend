import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'local.arshadshah.com',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://expense-api.arshadshah.com',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://expense.arshadshah.com'
        }
      },
      '/graphql': {
        target: 'http://expense-api.arshadshah.com',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://expense.arshadshah.com'
        }
      }
    },
  }
})