<script setup lang="ts">
import { project } from '@/config/project'

const skills = [
  'HTML та CSS',
  'JavaScript та TypeScript',
  'Vue 3 та Composition API',
  'Vue Router',
  'Робота з REST API',
  'Git та GitHub',
]
</script>

<template>
  <section class="information-page">
    <h1 class="page-title">About author</h1>

    <p class="author-name">
      {{ project.authorName }}
    </p>

    <h2 class="section-title">Technical skills</h2>

    <ul class="technology-list">
      <li v-for="skill in skills" :key="skill">
        {{ skill }}
      </li>
    </ul>

    <a
      :href="project.githubProfileUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="project-link"
    >
      GitHub автора
    </a>
  </section>
</template>
