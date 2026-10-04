<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

const emit = defineEmits<{
  'filter-by-name': [value: string]
}>()

const inputId = useId()
const query = ref('')

watch(query, (value, _previousValue, onCleanup) => {
  const timer = setTimeout(() => {
    emit('filter-by-name', value.trim())
  }, 300)

  onCleanup(() => {
    clearTimeout(timer)
  })
})
</script>

<template>
  <div class="search-bar">
    <label :for="inputId" class="search-label"> Пошук за іменем </label>

    <div class="search-input-wrapper">
      <Search :size="18" class="search-icon" aria-hidden="true" />

      <input
        :id="inputId"
        v-model="query"
        type="search"
        class="form-control search-input"
        placeholder="Введіть ім’я"
        autocomplete="off"
      />

      <button
        v-if="query"
        type="button"
        class="search-clear"
        aria-label="Очистити пошук"
        title="Очистити пошук"
        @click="query = ''"
      >
        <X :size="16" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
