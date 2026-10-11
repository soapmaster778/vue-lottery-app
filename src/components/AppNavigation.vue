<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function logout(): Promise<void> {
  auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <nav class="app-navigation" aria-label="Основна навігація">
    <RouterLink
      :to="{ name: 'home' }"
      class="navigation-link"
      exact-active-class="navigation-link-active"
    >
      Home
    </RouterLink>

    <RouterLink
      :to="{ name: 'about' }"
      class="navigation-link"
      active-class="navigation-link-active"
    >
      About author
    </RouterLink>

    <RouterLink
      :to="{ name: 'users' }"
      class="navigation-link"
      active-class="navigation-link-active"
    >
      Users
    </RouterLink>

    <button
      v-if="auth.isAuthenticated"
      type="button"
      class="navigation-link navigation-button"
      @click="logout"
    >
      Logout
    </button>

    <RouterLink
      v-else
      :to="{ name: 'login' }"
      class="navigation-link"
      active-class="navigation-link-active"
    >
      Login
    </RouterLink>
  </nav>
</template>
