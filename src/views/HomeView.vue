<script setup lang="ts">
import { project } from '@/config/project'

const technologies = [
  'Vue 3',
  'TypeScript',
  'Composition API',
  'Vue Router',
  'Pinia',
  'Bootstrap',
  'SCSS',
  'VeeValidate та Yup',
  'REST API та JWT',
]
</script>

<template>
  <section class="information-page">
    <h1 class="page-title">Vue Lottery App</h1>

    <p>
      Навчальний застосунок лотереї. Проєкт розвивається від компонентної
      форми й таблиці до багатосторінкового застосунку з REST API та авторизацією.
    </p>

    <h2 class="section-title">Технології</h2>

    <ul class="technology-list">
      <li v-for="technology in technologies" :key="technology">
        {{ technology }}
      </li>
    </ul>

    <a
      :href="project.githubRepositoryUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="project-link"
    >
      Репозиторій проєкту на GitHub
    </a>
  </section>
</template>
