<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink :to="{ name: 'home' }" class="app-logo" aria-label="Vue Lottery App — головна">
    Vue Lottery App
  </RouterLink>
</template>
