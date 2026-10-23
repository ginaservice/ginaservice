import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// ✅ Lovable-compatible Vite configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@gina/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@gina/types': path.resolve(__dirname, '../../packages/types/src'),
      '@gina/sdk': path.resolve(__dirname, '../../packages/sdk/src'),
    },
  },
  server: {
    port: 3100,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
