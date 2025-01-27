// vue.config.js
'use strict'
const path = require('path')
const { defineConfig } = require('@vue/cli-service')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'App Mesh'
const port = process.env.port || process.env.npm_config_port || 9528

process.env.VUE_APP_TITLE = name

module.exports = defineConfig({
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,

  devServer: {
    port: port,
    open: true,
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    proxy: {
      '^/': {
        target: 'https://localhost:6060',
        changeOrigin: true,
        secure: false
      }
    }
  },
  configureWebpack: {
    name: name,
    resolve: {
      fallback: {
        path: require.resolve('path-browserify')
      }
    }
  },

  chainWebpack(config) {
    // set svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // vue-loader configuration
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          whitespace: 'preserve'
        }
      }))
    // production optimization
    config.when(process.env.NODE_ENV !== 'development', config => {
      // split chunks optimization
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })

      config.optimization.runtimeChunk('single')
    })
  }
})
