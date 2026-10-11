<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="information-page">
    <h1 class="page-title">404</h1>

    <p>Сторінку не знайдено.</p>

    <RouterLink :to="{ name: 'home' }" class="project-link"> На головну </RouterLink>
  </section>
</template>
