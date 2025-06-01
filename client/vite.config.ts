import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path' // ✅ Import path to resolve file paths

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/Site-for-Kevin/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ Alias @ -> /src
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
