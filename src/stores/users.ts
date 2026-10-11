import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ServiceProvider } from '@/services/service-provider'
import type { CreateUserDto, User } from '@/types/user'
import { getErrorMessage } from '@/utils/errors'

export const useUsersStore = defineStore('users', () => {
  const pageSize = 10

  const users = ref<User[]>([])
  const createdUsers = ref<User[]>([])
  const serverTotal = ref(0)
  const currentQuery = ref('')
  const isLoading = ref(false)
  const isCreating = ref(false)
  const error = ref('')

  let nextLocalId = -1
  let requestVersion = 0
  let controller: AbortController | undefined

  function getMatchingCreated(query: string): User[] {
    const normalized = query.toLowerCase()

    return createdUsers.value.filter((user) => {
      const searchable = [
        user.firstName,
        user.lastName,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.username,
        user.phone,
      ]

      return searchable.some((value) => value.toLowerCase().includes(normalized))
    })
  }

  const total = computed(() => serverTotal.value + getMatchingCreated(currentQuery.value).length)

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

  function cancelLoading(): void {
    requestVersion += 1
    controller?.abort()
    controller = undefined
    isLoading.value = false
  }

  async function loadPage(page: number, query: string): Promise<boolean> {
    const version = ++requestVersion

    controller?.abort()

    const currentController = new AbortController()
    controller = currentController

    currentQuery.value = query
    isLoading.value = true
    error.value = ''

    const offset = (page - 1) * pageSize
    const localMatches = getMatchingCreated(query)
    const localPage = localMatches.slice(offset, offset + pageSize)

    const params = {
      limit: Math.max(1, pageSize - localPage.length),
      skip: Math.max(0, offset - localMatches.length),
      signal: currentController.signal,
    }

    try {
      const response = query
        ? await ServiceProvider.users.search(query, params)
        : await ServiceProvider.users.getAll(params)

      if (version !== requestVersion) {
        return false
      }

      serverTotal.value = response.total

      users.value = [...localPage, ...response.users].slice(0, pageSize)

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

  async function createUser(data: CreateUserDto): Promise<User> {
    if (isCreating.value) {
      throw new Error('Зачекайте завершення створення користувача.')
    }

    isCreating.value = true

    try {
      const response = await ServiceProvider.users.create(data)

      const user: User = {
        ...response,
        ...data,
        id: nextLocalId,
      }

      nextLocalId -= 1

      cancelLoading()
      createdUsers.value.unshift(user)

      return user
    } finally {
      isCreating.value = false
    }
  }

  function getCreatedUser(id: number): User | undefined {
    return createdUsers.value.find((user) => user.id === id)
  }

  return {
    pageSize,
    users,
    total,
    pageCount,
    isLoading,
    isCreating,
    error,
    loadPage,
    cancelLoading,
    createUser,
    getCreatedUser,
  }
})
