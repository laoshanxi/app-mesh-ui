import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
      symbolId: 'icon-[name]'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'path': 'path-browserify',
      // Local JS SDK source until it is published to npm (the published package
      // still predates the Dex/OIDC API). Browser-safe: Node fs/https are lazy.
      // Staged by `make sdk` from ../app-mesh so the Docker context is complete.
      'appmesh': path.resolve(__dirname, 'third_party/appmesh-sdk/src/appmesh.js')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  server: {
    port: 9528,
    open: true,
    proxy: {
      // No changeOrigin: the browser's Host header must reach the Go agent
      // unchanged. The agent derives X-Forwarded-Host from it, and the daemon's
      // CSRF check compares that against Origin — with a rewritten Host every
      // browser POST is rejected with "CSRF validation failed: origin not allowed".
      '/appmesh': {
        target: 'https://localhost:6060',
        secure: false
      },
      // Dex issuer path — same-origin doorway to the authentication service
      // itself (Dex sends no CORS headers, so the browser cannot call it directly).
      '/auth': {
        target: 'http://127.0.0.1:6062',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vendor': ['vue', 'vue-router', 'vuex']
        }
      }
    }
  }
})
