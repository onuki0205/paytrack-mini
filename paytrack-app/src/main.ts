import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Vuetify関連のインポート
import './styles.scss'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// アイコンフォントのインポート
import '@mdi/font/css/materialdesignicons.css' 

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Authストアの初期化
const authStore = useAuthStore()
authStore.init()

// Vuetifyインスタンス作成
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
},
})

// VueアプリにVuetifyを適用
app.use(vuetify).mount('#app')