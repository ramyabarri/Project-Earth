import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // relative base so the built app works from any subpath or static file host
  base: './',
  plugins: [react(), tailwindcss()],
})
