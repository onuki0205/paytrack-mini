import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  base: './paytrack-mini/',
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  build: {
    outDir:'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }, 
  }
})
