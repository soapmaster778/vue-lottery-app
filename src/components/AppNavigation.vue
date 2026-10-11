<script setup lang="ts">
import { RouterLink } from 'vue-router'
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

    <RouterLink
      :to="{ name: 'login' }"
      class="navigation-link"
      active-class="navigation-link-active"
    >
      Login
    </RouterLink>
  </nav>
</template>
