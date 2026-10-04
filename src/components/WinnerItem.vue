<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Participant } from '@/types/participant'

defineProps<{
  participant: Participant
}>()

defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <span class="winner-item">
    <span class="winner-name">
      {{ participant.name }}
    </span>

    <button
      type="button"
      class="winner-remove"
      :aria-label="`Видалити переможця ${participant.name}`"
      :title="`Видалити переможця ${participant.name}`"
      @click="$emit('remove', participant.id)"
    >
      <X :size="14" aria-hidden="true" />
    </button>
  </span>
</template>
