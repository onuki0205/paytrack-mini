import { createApp } from 'vue'
import App from './App.vue'

// Vuetify関連のインポート
import './styles.scss'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// アイコンフォントのインポート
import '@mdi/font/css/materialdesignicons.css' 

// Vuetifyインスタンス作成
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
},
})

// VueアプリにVuetifyを適用
createApp(App).use(vuetify).mount('#app')