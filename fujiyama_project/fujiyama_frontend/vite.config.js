import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // В продакшене сборку раздаёт Django: ассеты лежат под /static/
  // (collectstatic + whitenoise). В dev-режиме — обычный корень.
  base: mode === 'production' ? '/static/' : '/',
  server: {
    host: '127.0.0.1', // Принудительно используем IP вместо localhost
    port: 5173,
    strictPort: true, // Чтобы порт не "прыгал" на 5174
  }
}))
