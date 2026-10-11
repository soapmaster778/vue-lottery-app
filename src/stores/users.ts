import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ServiceProvider } from '@/services/service-provider'
import type { User } from '@/types/user'
import { getErrorMessage } from '@/utils/errors'

export const useUsersStore = defineStore('users', () => {
  const pageSize = 10

  const users = ref<User[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  let requestVersion = 0
  let controller: AbortController | undefined

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

  async function loadPage(page: number, query: string): Promise<boolean> {
    const version = ++requestVersion

    controller?.abort()

    const currentController = new AbortController()
    controller = currentController

    isLoading.value = true
    error.value = ''

    const params = {
      limit: pageSize,
      skip: (page - 1) * pageSize,
      signal: currentController.signal,
    }

    try {
      const response = query
        ? await ServiceProvider.users.search(query, params)
        : await ServiceProvider.users.getAll(params)

      if (version !== requestVersion) {
        return false
      }

      users.value = response.users
      total.value = response.total

      return true
    } catch (cause: unknown) {
      if (version !== requestVersion) {
        return false
      }

      if (cause instanceof Error && cause.name === 'AbortError') {
        return false
      }

      error.value = getErrorMessage(cause)
      return false
    } finally {
      if (version === requestVersion) {
        isLoading.value = false
        controller = undefined
      }
    }
  }

  function cancelLoading(): void {
    requestVersion += 1
    controller?.abort()
    controller = undefined
    isLoading.value = false
  }

  return {
    pageSize,
    users,
    total,
    pageCount,
    isLoading,
    error,
    loadPage,
    cancelLoading,
  }
})
