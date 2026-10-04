<script setup lang="ts">
import BaseButton from './BaseButton.vue'
</script>

<template>
  <section class="lottery-panel winners-block" aria-label="Winners">
    <div class="winners-list">
      <span class="winners-placeholder">Winners</span>
    </div>

    <BaseButton disabled> New winner </BaseButton>
  </section>
</template>
