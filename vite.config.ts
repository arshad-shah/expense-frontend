import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      server: {
        host: 'local.arshadshah.com',
        port: 5173,
        https: {
          key: fs.readFileSync('./certs/localhost+2-key.pem'),
          cert: fs.readFileSync('./certs/localhost+2.pem'),
        },
        proxy: {
          '/api': {
            target: 'https://expense-api.arshadshah.com',
            changeOrigin: true,
            secure: true,
          },
          '/graphql': {
            target: 'https://expense-api.arshadshah.com',
            changeOrigin: true,
            secure: true,
          }
        },
      }
    }
  } else {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      }
    }
  }
})