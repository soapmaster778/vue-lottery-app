import { createRouter, createWebHashHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    layout?: 'default' | 'auth'
    requiresAuth?: boolean
  }
}

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'Home',
        layout: 'default',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: {
        title: 'About author',
        layout: 'default',
      },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: {
        title: 'Users',
        layout: 'default',
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: 'Login',
        layout: 'auth',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: '404',
        layout: 'default',
      },
    },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to, _from, failure) => {
  if (!failure) {
    document.title = `${to.meta.title} | Vue Lottery App`
  }
})
