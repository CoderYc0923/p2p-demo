import { createApp } from 'vue'
import './style.css'
import '@/styles/index.scss'
import App from './App.vue'
import router from './router'
import store from '@/stores'
import VirUi from 'freeze-virtual-ui'
import 'freeze-virtual-ui/VirtualUI/style.css'

const app = createApp(App)

app.use(router).use(store).use(VirUi)

app.mount('#app')
