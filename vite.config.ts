import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    rolldownOptions: { input: { home: 'index.html', reading: 'reading.html', hiddenWork: 'hidden-work.html', foundation: 'foundation.html', edgeCase: 'edge-case.html' } },
    sourcemap: false,
  },
}))
