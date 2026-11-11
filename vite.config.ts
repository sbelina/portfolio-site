import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pattern Shift is an unpublished prototype: it is only an input of the local fixtures build.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    rolldownOptions: { input: { home: 'index.html', reading: 'reading.html', hiddenWork: 'hidden-work.html', foundation: 'foundation.html', ...(mode === 'fixtures' ? { patternShift: 'pattern-shift.html' } : {}) } },
    sourcemap: false,
  },
}))
