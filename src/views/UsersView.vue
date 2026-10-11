<script setup lang="ts">
import { computed, onBeforeUnmount, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import UserPagination from '@/components/UserPagination.vue'
import { useUsersStore } from '@/stores/users'
import type { TableColumn } from '@/types/table'
import type { User } from '@/types/user'
import AppModal from '@/components/AppModal.vue'
import UserForm from '@/components/UserForm.vue'
import type { CreateUserDto } from '@/types/user'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const isCreateOpen = ref(false)

const page = computed<number>(() => {
  const value = route.query.page

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return 1
  }

  const number = Number(value)

  return Number.isSafeInteger(number) ? number : 1
})

const searchQuery = computed<string>(() =>
  typeof route.query.q === 'string' ? route.query.q.trim() : '',
)

const columns: TableColumn<User>[] = [
  {
    key: 'id',
    label: '#',
    value: (user) => user.id,
  },
  {
    key: 'name',
    label: 'Name',
    value: (user) => `${user.firstName} ${user.lastName}`,
  },
  {
    key: 'age',
    label: 'Age',
    value: (user) => user.age,
  },
  {
    key: 'gender',
    label: 'Gender',
    value: (user) => user.gender,
  },
  {
    key: 'email',
    label: 'Email',
    value: (user) => user.email,
  },
  {
    key: 'phone',
    label: 'Phone number',
    value: (user) => user.phone,
  },
]

function getListQuery(nextPage: number, query: string): LocationQueryRaw {
  return {
    ...route.query,
    page: nextPage > 1 ? String(nextPage) : undefined,
    q: query || undefined,
  }
}

function closeCreateModal(): void {
  if (!usersStore.isCreating) {
    isCreateOpen.value = false
  }
}

async function saveNewUser(data: CreateUserDto): Promise<void> {
  await usersStore.createUser(data)

  isCreateOpen.value = false

  if (page.value !== 1 || searchQuery.value !== '') {
    await router.push({
      name: 'users',
      query: getListQuery(1, ''),
    })
  } else {
    await usersStore.loadPage(1, '')
  }
}

async function changePage(nextPage: number): Promise<void> {
  if (
    usersStore.isLoading ||
    nextPage === page.value ||
    nextPage < 1 ||
    nextPage > usersStore.pageCount
  ) {
    return
  }

  await router.push({
    name: 'users',
    query: getListQuery(nextPage, searchQuery.value),
  })
}

async function changeSearch(query: string): Promise<void> {
  const normalized = query.trim()

  if (normalized === searchQuery.value) {
    return
  }

  await router.push({
    name: 'users',
    query: getListQuery(1, normalized),
  })
}

async function retry(): Promise<void> {
  if (!usersStore.isLoading) {
    await usersStore.loadPage(page.value, searchQuery.value)
  }
}

watch(
  [page, searchQuery],
  async ([currentPage, query], _previous, onCleanup) => {
    let active = true

    onCleanup(() => {
      active = false
    })

    const loaded = await usersStore.loadPage(currentPage, query)

    if (active && loaded && currentPage > usersStore.pageCount) {
      await router.replace({
        name: 'users',
        query: getListQuery(usersStore.pageCount, query),
      })
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  usersStore.cancelLoading()
})
</script>

<template>
  <section>
    <div class="users-page-heading">
      <h1 class="page-title">Users</h1>

      <BaseButton :disabled="usersStore.isCreating" @click="isCreateOpen = true">
        Додати користувача
      </BaseButton>
    </div>

    <SearchBar
      :model-value="searchQuery"
      label="Пошук користувачів"
      placeholder="Введіть пошуковий запит"
      @filter-by-name="changeSearch"
    />

    <p v-if="usersStore.isLoading" role="status">Завантаження користувачів…</p>

    <div v-else-if="usersStore.error" class="request-error" role="alert">
      <p>{{ usersStore.error }}</p>

      <BaseButton @click="retry"> Спробувати знову </BaseButton>
    </div>

    <div v-else class="lottery-panel">
      <BaseTable :columns="columns" :rows="usersStore.users" />

      <p v-if="usersStore.users.length === 0" class="table-empty-message" role="status">
        Користувачів не знайдено.
      </p>
    </div>

    <div v-if="!usersStore.error" class="users-list-footer">
      <p class="users-list-summary" aria-live="polite">
        Знайдено: {{ usersStore.total }}. Сторінка {{ page }} з {{ usersStore.pageCount }}.
      </p>

      <UserPagination
        :page="page"
        :page-count="usersStore.pageCount"
        :is-loading="usersStore.isLoading"
        @change="changePage"
      />
    </div>
  </section>
  <AppModal :open="isCreateOpen" @close="closeCreateModal">
    <template #header> Додати користувача </template>

    <UserForm v-if="isCreateOpen" :save="saveNewUser" />
  </AppModal>
</template>
