import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cloud-doc/',  // For GitHub Pages
  plugins: [react()],
  define: {
    'process.env': {}   // Fix for using env vars in browser code
  }
})
