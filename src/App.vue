<script setup lang="ts">
const title: string = 'Lottery'
</script>

<template>
  <main class="lottery-app">
    <section class="lottery-panel" aria-labelledby="lottery-title">
      <h1 id="lottery-title" class="lottery-title">
        {{ title }}
      </h1>
    </section>
  </main>
</template>
