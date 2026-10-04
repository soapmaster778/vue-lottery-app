<script setup lang="ts">
import BaseTable from './BaseTable.vue'
import type { Participant } from '@/types/participant'
import type { TableColumn } from '@/types/table'

defineProps<{
  participants: readonly Participant[]
}>()

const columns: TableColumn<Participant>[] = [
  { key: 'index', label: '#' },
  { key: 'name', label: 'Name' },
  { key: 'birthDate', label: 'Date of Birth' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone number' },
]

function formatBirthDate(value: string): string {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}
</script>

<template>
  <section class="lottery-panel participants-block" aria-label="Participants">
    <BaseTable :columns="columns" :rows="participants">
      <template #cell-birthDate="{ row }">
        {{ formatBirthDate(row.birthDate) }}
      </template>
    </BaseTable>
  </section>
</template>
