<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AuthLayout from './layouts/AuthLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

const route = useRoute()

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
}

const currentLayout = computed(() => layouts[route.meta.layout ?? 'default'])
</script>

<template>
  <component :is="currentLayout">
    <RouterView />
  </component>
</template>
