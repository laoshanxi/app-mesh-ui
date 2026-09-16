import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// maintained fork of vite-plugin-svg-icons (same API); the original pulls a vulnerable svg-baker chain
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
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
      'path': 'path-browserify'
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
    strictPort: true, // fail loudly if taken — never silently drift to another port
    open: true,
    proxy: {
      // No changeOrigin: the agent derives X-Forwarded-Host from the browser Host; a rewritten Host fails the daemon's CSRF origin check on every POST.
      '/appmesh': {
        target: 'https://localhost:6060',
        secure: false
      },
      // Dex issuer path: same-origin proxy (Dex sends no CORS headers).
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
