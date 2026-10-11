<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import { ServiceProvider } from '@/services/service-provider'
import type { TableColumn } from '@/types/table'
import type { User } from '@/types/user'
import { getErrorMessage } from '@/utils/errors'

const users = ref<User[]>([])
const isLoading = ref(false)
const error = ref('')

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

async function loadUsers(): Promise<void> {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await ServiceProvider.users.getAll({
      limit: 10,
      skip: 0,
    })

    users.value = response.users
  } catch (cause: unknown) {
    error.value = getErrorMessage(cause)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <section>
    <h1 class="page-title">Users</h1>

    <p v-if="isLoading" role="status">Завантаження користувачів…</p>

    <div v-else-if="error" class="request-error" role="alert">
      <p>{{ error }}</p>

      <BaseButton @click="loadUsers"> Спробувати знову </BaseButton>
    </div>

    <div v-else class="lottery-panel">
      <BaseTable :columns="columns" :rows="users" />

      <p v-if="users.length === 0" class="table-empty-message">Користувачів немає.</p>
    </div>
  </section>
</template>
