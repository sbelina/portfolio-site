import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ root: 'studio-ui', plugins: [react()], build: { outDir: '../dist-studio', emptyOutDir: true, sourcemap: false } })
