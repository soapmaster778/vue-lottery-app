import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores'

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
      component: () => import('@/layouts/UsersLayout.vue'),
      meta: {
        title: 'Users',
        layout: 'default',
        requiresAuth: true,
      },

      children: [
        {
          path: '',
          name: 'users',
          component: () => import('@/views/UsersView.vue'),
          meta: {
            title: 'Users',
          },
        },
        {
          path: ':id',
          name: 'user-details',
          component: () => import('@/views/UserDetailsView.vue'),
          props: true,
          meta: {
            title: 'User details',
          },

          children: [
            {
              path: 'edit',
              name: 'user-edit',
              component: () => import('@/views/UserEditView.vue'),
              props: true,
              meta: {
                title: 'Edit user',
              },
            },
          ],
        },
      ],
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

router.beforeEach(async (to) => {
  const auth = useAuthStore(pinia)

  await auth.initialize()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'users' }
  }
})

router.afterEach((to, _from, failure) => {
  if (!failure) {
    document.title = `${to.meta.title} | Vue Lottery App`
  }
})
