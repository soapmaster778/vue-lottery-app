<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  page: number
  pageCount: number
  isLoading: boolean
}>()

defineEmits<{
  change: [page: number]
}>()

const visiblePages = computed<number[]>(() => {
  const count = Math.min(5, props.pageCount)

  const start = Math.max(1, Math.min(props.page - 2, props.pageCount - count + 1))

  return Array.from({ length: count }, (_value, index) => start + index)
})
</script>

<template>
  <nav class="user-pagination" aria-label="Сторінки користувачів">
    <BaseButton
      variant="secondary"
      class="pagination-button"
      :disabled="isLoading || page <= 1"
      aria-label="Попередня сторінка"
      title="Попередня сторінка"
      @click="$emit('change', page - 1)"
    >
      <ChevronLeft :size="18" aria-hidden="true" />
    </BaseButton>

    <BaseButton
      v-for="number in visiblePages"
      :key="number"
      :variant="number === page ? 'primary' : 'secondary'"
      class="pagination-button"
      :disabled="isLoading"
      :aria-current="number === page ? 'page' : undefined"
      :aria-label="`Сторінка ${number}`"
      @click="$emit('change', number)"
    >
      {{ number }}
    </BaseButton>

    <BaseButton
      variant="secondary"
      class="pagination-button"
      :disabled="isLoading || page >= pageCount"
      aria-label="Наступна сторінка"
      title="Наступна сторінка"
      @click="$emit('change', page + 1)"
    >
      <ChevronRight :size="18" aria-hidden="true" />
    </BaseButton>
  </nav>
</template>
