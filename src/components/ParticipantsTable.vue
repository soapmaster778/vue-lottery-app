<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowDownAZ, ArrowUp, ArrowUpAZ } from 'lucide-vue-next'
import BaseButton from './BaseButton.vue'
import BaseTable from './BaseTable.vue'
import SearchBar from './SearchBar.vue'
import type { Participant } from '@/types/participant'
import type { TableColumn } from '@/types/table'

const props = defineProps<{
  participants: readonly Participant[]
}>()

defineEmits<{
  edit: [participant: Participant]
  delete: [participant: Participant]
}>()

type SortField = 'name' | 'birthDate'
type SortDirection = 'asc' | 'desc'

const searchQuery = ref('')
const sortField = ref<SortField | null>(null)
const sortDirection = ref<SortDirection>('asc')

function filterByName(value: string): void {
  searchQuery.value = value
}

function toggleSort(field: SortField): void {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function getAriaSort(field: SortField): 'none' | 'ascending' | 'descending' {
  if (sortField.value !== field) {
    return 'none'
  }

  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

function getSortLabel(field: SortField): string {
  const name = field === 'name' ? 'іменем' : 'датою народження'

  const nextDirection =
    sortField.value === field && sortDirection.value === 'asc' ? 'за спаданням' : 'за зростанням'

  return `Сортувати за ${name}: ${nextDirection}`
}

const visibleParticipants = computed<Participant[]>(() => {
  const query = searchQuery.value.toLocaleLowerCase('uk')

  const filtered = props.participants.filter((participant) =>
    participant.name.toLocaleLowerCase('uk').includes(query),
  )

  const field = sortField.value

  if (!field) {
    return filtered
  }

  const direction = sortDirection.value === 'asc' ? 1 : -1

  return [...filtered].sort((first, second) => {
    const comparison =
      field === 'name'
        ? first.name.localeCompare(second.name, 'uk', {
            sensitivity: 'base',
          })
        : first.birthDate.localeCompare(second.birthDate)

    return comparison * direction
  })
})

const columns = computed<TableColumn<Participant>[]>(() => [
  {
    key: 'index',
    label: '#',
    value: (_row, index) => index + 1,
  },
  {
    key: 'name',
    label: 'Name',
    value: (row) => row.name,
    ariaSort: getAriaSort('name'),
  },
  {
    key: 'birthDate',
    label: 'Date of Birth',
    value: (row) => row.birthDate,
    ariaSort: getAriaSort('birthDate'),
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
])

function formatBirthDate(value: string): string {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}
</script>

<template>
  <section class="lottery-panel participants-block" aria-label="Participants">
    <SearchBar @filter-by-name="filterByName" />

    <BaseTable :columns="columns" :rows="visibleParticipants">
      <template #header-name>
        <button
          type="button"
          class="sort-heading"
          :class="{ 'sort-heading-active': sortField === 'name' }"
          :aria-label="getSortLabel('name')"
          :title="getSortLabel('name')"
          @click="toggleSort('name')"
        >
          <span>Name</span>

          <component
            :is="sortField === 'name' && sortDirection === 'desc' ? ArrowUpAZ : ArrowDownAZ"
            :size="18"
            aria-hidden="true"
          />
        </button>
      </template>

      <template #header-birthDate>
        <button
          type="button"
          class="sort-heading"
          :class="{ 'sort-heading-active': sortField === 'birthDate' }"
          :aria-label="getSortLabel('birthDate')"
          :title="getSortLabel('birthDate')"
          @click="toggleSort('birthDate')"
        >
          <span>Date of Birth</span>

          <component
            :is="sortField === 'birthDate' && sortDirection === 'desc' ? ArrowUp : ArrowDown"
            :size="18"
            aria-hidden="true"
          />
        </button>
      </template>

      <template #cell-birthDate="{ row }">
        {{ formatBirthDate(row.birthDate) }}
      </template>

      <template #cell-edit="{ row }">
        <BaseButton variant="secondary" class="table-action-button" @click="$emit('edit', row)">
          Редагувати дані
        </BaseButton>
      </template>

      <template #cell-delete="{ row }">
        <BaseButton variant="danger" class="table-action-button"  @click="$emit('delete', row)">
          Видалити учасника
        </BaseButton>
      </template>
    </BaseTable>

    <p
      v-if="participants.length > 0 && visibleParticipants.length === 0"
      class="table-empty-message"
      role="status"
    >
      Учасників не знайдено.
    </p>
  </section>
</template>
