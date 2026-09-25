import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// maintained fork of vite-plugin-svg-icons (same API); the original pulls a vulnerable svg-baker chain
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import path from 'path'

// Dev proxy for the dexuser admin UI (Security > Users iframe). Its HTML uses absolute
// paths (href="/admin", src="/static/..."), which nginx rewrites with sub_filter in prod;
// this middleware applies the same rewriting here so the dev server behaves identically.
const DEXUSER_TARGET = 'http://127.0.0.1:6064'
const readRequestBody = (req) => new Promise((resolve, reject) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => resolve(Buffer.concat(chunks)))
  req.on('error', reject)
})
function dexuserAdminProxy() {
  return {
    name: 'dexuser-admin-proxy',
    configureServer(server) {
      // connect strips the '/dexuser' mount prefix: req.url is already the upstream path
      server.middlewares.use('/dexuser', async (req, res) => {
        try {
          const headers = {
            accept: req.headers.accept || '*/*',
            'accept-encoding': 'identity' // uncompressed, so HTML/CSS rewriting can see the body
          }
          if (req.headers['content-type']) headers['content-type'] = req.headers['content-type']
          if (req.headers.cookie) headers.cookie = req.headers.cookie
          const upstream = await fetch(DEXUSER_TARGET + req.url, {
            method: req.method,
            headers,
            redirect: 'manual',
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : await readRequestBody(req)
          })
          const resHeaders = {}
          upstream.headers.forEach((v, k) => {
            if (!['content-length', 'content-encoding', 'transfer-encoding'].includes(k)) resHeaders[k] = v
          })
          if (typeof resHeaders.location === 'string' && resHeaders.location.startsWith('/')) {
            resHeaders.location = '/dexuser' + resHeaders.location
          }
          let body = Buffer.from(await upstream.arrayBuffer())
          const type = upstream.headers.get('content-type') || ''
          if (/text\/html|text\/css/.test(type)) {
            body = Buffer.from(body.toString()
              .replace(/(href|src|action)="\/(?!\/)/g, '$1="/dexuser/')
              // the demo home ("Flows") does an OIDC prompt=none roundtrip with an
              // unregistered client — keep nav inside the admin surface instead
              .replace(/href="\/dexuser\/"/g, 'href="/dexuser/admin"')
              .replace(/url\(\//g, 'url(/dexuser/'))
          }
          res.writeHead(upstream.status, resHeaders)
          res.end(body)
        } catch (error) {
          res.writeHead(502, { 'content-type': 'text/plain' })
          res.end(`dexuser admin UI unreachable at ${DEXUSER_TARGET}: ${error.message}`)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
      symbolId: 'icon-[name]'
    }),
    dexuserAdminProxy()
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
      // '/dexuser' is served by the dexuserAdminProxy plugin above (needs HTML rewriting,
      // which the plain proxy cannot do).
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
