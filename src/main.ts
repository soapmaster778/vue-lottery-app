import { createApp } from 'vue'
import App from './App.vue'
import { configureHttpAuth } from './api/http-client'
import { router } from './router'
import { pinia } from './stores'
import { useAuthStore } from './stores/auth'
import './styles/main.scss'

const app = createApp(App)

app.use(pinia)

const auth = useAuthStore(pinia)

configureHttpAuth({
  getAccessToken: () => auth.accessToken,
  getSessionVersion: () => auth.sessionVersion,
  refreshAccessToken: () => auth.refreshAccessToken(),

  onUnauthorized: (version) => {
    if (!auth.invalidateSession(version)) {
      return
    }

    const currentRoute = router.currentRoute.value

    if (currentRoute.matched.some((record) => record.meta.requiresAuth)) {
      void router.replace({
        name: 'login',
        query: {
          redirect: currentRoute.fullPath,
        },
      })
    }
  },
})

app.use(router)
app.mount('#app')
