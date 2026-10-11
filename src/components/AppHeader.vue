<script setup lang="ts">
import AppLogo from './AppLogo.vue'
import AppNavigation from './AppNavigation.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <header class="app-header">
    <div class="app-header-inner">
      <AppLogo />
      <AppNavigation />
    </div>

    <p v-if="auth.notice && auth.isAuthenticated" class="header-notice" role="status">
      {{ auth.notice }}
    </p>
  </header>
</template>
