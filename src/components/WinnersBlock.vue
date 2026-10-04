<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import WinnerItem from './WinnerItem.vue'
import type { Participant } from '@/types/participant'

defineProps<{
  winners: readonly Participant[]
  canChooseWinner: boolean
}>()

defineEmits<{
  'new-winner': []
  'remove-winner': [id: string]
}>()
</script>

<template>
  <section class="lottery-panel winners-block" aria-label="Winners">
    <div class="winners-list" aria-live="polite">
      <WinnerItem
        v-for="winner in winners"
        :key="winner.id"
        :participant="winner"
        @remove="$emit('remove-winner', $event)"
      />

      <span class="winners-placeholder">Winners</span>
    </div>

    <BaseButton :disabled="!canChooseWinner" @click="$emit('new-winner')"> New winner </BaseButton>
  </section>
</template>
