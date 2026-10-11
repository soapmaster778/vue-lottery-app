<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import { useUsersStore } from '@/stores/users'
import type { User } from '@/types/user'
import { getErrorMessage } from '@/utils/errors'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const usersStore = useUsersStore()

const user = ref<User | null>(null)
const isLoading = ref(false)
const error = ref('')
const retryVersion = ref(0)

interface DetailRow {
  label: string
  value: string
}

function flattenDetails(value: unknown, path = ''): DetailRow[] {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => {
      const nextPath = path ? `${path}.${key}` : key

      if (key === 'password') {
        return [{ label: nextPath, value: 'Приховано' }]
      }

      return flattenDetails(item, nextPath)
    })
  }

  return [
    {
      label: path,
      value: value === null || value === undefined ? 'Не вказано' : String(value),
    },
  ]
}

const details = computed<DetailRow[]>(() => (user.value ? flattenDetails(user.value) : []))

watch(
  [() => props.id, retryVersion],
  async ([id], _previous, onCleanup) => {
    let active = true

    onCleanup(() => {
      active = false
    })

    user.value = null
    error.value = ''
    isLoading.value = true

    try {
      const numericId = Number(id)

      if (!/^-?[1-9]\d*$/.test(id) || !Number.isSafeInteger(numericId)) {
        throw new Error('Некоректний ID користувача.')
      }

      const result = await usersStore.getUser(numericId)

      if (active) {
        user.value = result
      }
    } catch (cause: unknown) {
      if (active) {
        error.value = getErrorMessage(cause)
      }
    } finally {
      if (active) {
        isLoading.value = false
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <section>
    <RouterLink :to="{ name: 'users', query: route.query }" class="project-link">
      До списку користувачів
    </RouterLink>

    <p v-if="isLoading" class="user-detail-status" role="status">Завантаження користувача…</p>

    <div v-else-if="error" class="request-error user-detail-status" role="alert">
      <p>{{ error }}</p>

      <BaseButton @click="retryVersion += 1"> Спробувати знову </BaseButton>
    </div>

    <template v-else-if="user">
      <div class="users-page-heading user-detail-heading">
        <h1 class="page-title">{{ user.firstName }} {{ user.lastName }}</h1>

        <RouterLink
          v-if="route.name !== 'user-edit'"
          :to="{
            name: 'user-edit',
            params: { id: String(user.id) },
            query: route.query,
          }"
          class="btn btn-primary lottery-button"
        >
          Редагувати дані
        </RouterLink>
      </div>

      <template v-if="route.name !== 'user-edit'">
        <img
          v-if="user.image"
          :src="user.image"
          :alt="`${user.firstName} ${user.lastName}`"
          class="user-avatar"
          width="96"
          height="96"
        />

        <dl class="user-details-list">
          <div v-for="detail in details" :key="detail.label" class="user-detail-row">
            <dt>{{ detail.label }}</dt>
            <dd>{{ detail.value }}</dd>
          </div>
        </dl>
      </template>

      <RouterView v-slot="{ Component }">
        <component :is="Component" v-if="Component" :key="user.id" :user="user" />
      </RouterView>
    </template>
  </section>
</template>
