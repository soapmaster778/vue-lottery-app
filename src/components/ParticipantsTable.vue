<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BaseTable from './BaseTable.vue'
import type { Participant } from '@/types/participant'
import type { TableColumn } from '@/types/table'

defineProps<{
  participants: readonly Participant[]
}>()

defineEmits<{
  edit: [participant: Participant]
  delete: [participant: Participant]
}>()

const columns: TableColumn<Participant>[] = [
  {
    key: 'index',
    label: '#',
    value: (_row, index) => index + 1,
  },
  {
    key: 'name',
    label: 'Name',
    value: (row) => row.name,
  },
  {
    key: 'birthDate',
    label: 'Date of Birth',
    value: (row) => row.birthDate,
  },
  {
    key: 'email',
    label: 'Email',
    value: (row) => row.email,
  },
  {
    key: 'phone',
    label: 'Phone number',
    value: (row) => row.phone,
  },
  {
    key: 'edit',
    label: 'Редагування',
  },
  {
    key: 'delete',
    label: 'Видалення',
  },
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

      <template #cell-edit="{ row }">
        <BaseButton variant="secondary" @click="$emit('edit', row)"> Редагувати дані </BaseButton>
      </template>

      <template #cell-delete="{ row }">
        <BaseButton variant="danger" @click="$emit('delete', row)"> Видалити учасника </BaseButton>
      </template>
    </BaseTable>
  </section>
</template>
