import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'
import { initAnalytics } from './analytics'

initAnalytics()
createApp(App).mount('#app')
