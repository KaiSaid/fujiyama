import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Принудительно используем IP вместо localhost
    port: 5173,
    strictPort: true, // Чтобы порт не "прыгал" на 5174
  }
})