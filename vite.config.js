import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Wallet APIs on port 8000 (use 127.0.0.1 to avoid IPv6 resolution issues)
      '/api/wallets': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/transactions': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/users': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/stats': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/logs': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Asset/Mutual Fund APIs on port 8001
      '/api/v1': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },
      '/api/assets': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },
      // Catch-all for other API calls (default to 8000)
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  test: {
    environment: 'happy-dom',
    setupFiles: './src/setupTests.js',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: false,
      include: [
        'src/pages/FinanceManager/utils/**/*.js',
        'src/pages/FinanceManager/components/**/?(*.)+(js|jsx)',
        'src/components/**/?(*.)+(js|jsx)'
      ],
      exclude: [
        '**/*.module.css',
        'src/main.jsx',
        'src/App.jsx',
        'src/services/**',
        'src/contexts/**',
        'src/pages/**/sampleData/**',
        'src/pages/**/constants/**',
        'src/pages/**/README.md'
      ]
    }
  }
})
