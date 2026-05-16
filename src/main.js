import { createApp } from 'vue'

import 'normalize.css/normalize.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import '@/iconfont/iconfont.css'
import '@/iconfont/iconfont.js'
import '@/styles/index.scss'
import App from './App.vue'
import store from './store'
import router from './router'

import '@/permission'

import JsonViewer from 'vue-json-viewer'

import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'


const app = createApp(App)

app.use(ElementPlus)
app.use(JsonViewer)
app.use(store)
app.use(router)

app.component('SvgIcon', SvgIcon)

app.mount('#app')
