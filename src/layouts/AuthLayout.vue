<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <AppHeader />

  <main class="page-container auth-container">
    <slot />
  </main>
</template>
