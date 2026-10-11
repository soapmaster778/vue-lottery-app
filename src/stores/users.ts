import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError } from '@/api/http-client'
import { ServiceProvider } from '@/services/service-provider'
import type { CreateUserDto, UpdateUserDto, User } from '@/types/user'
import { getErrorMessage } from '@/utils/errors'

export const useUsersStore = defineStore('users', () => {
  const pageSize = 10

  const remotePage = ref<User[]>([])
  const createdUsers = ref<User[]>([])
  const serverSnapshot = ref<User[] | null>(null)
  const serverTotal = ref(0)
  const currentPage = ref(1)
  const currentQuery = ref('')
  const isLoading = ref(false)
  const isCreating = ref(false)
  const isSaving = ref(false)
  const error = ref('')

  let nextLocalId = -1
  let requestVersion = 0
  let controller: AbortController | undefined
  let snapshotRequest: Promise<void> | undefined

  function matchesQuery(user: User, query: string): boolean {
    const normalized = query.toLowerCase()

    return [
      user.firstName,
      user.lastName,
      `${user.firstName} ${user.lastName}`,
      user.maidenName ?? '',
      user.email,
      user.username,
      user.phone,
    ].some((value) => value.toLowerCase().includes(normalized))
  }

  function getMatchingCreated(query: string): User[] {
    return createdUsers.value.filter((user) => matchesQuery(user, query))
  }

  const filteredSnapshot = computed<User[]>(() =>
    [...createdUsers.value, ...(serverSnapshot.value ?? [])].filter((user) =>
      matchesQuery(user, currentQuery.value),
    ),
  )

  const total = computed(() =>
    serverSnapshot.value !== null
      ? filteredSnapshot.value.length
      : serverTotal.value + getMatchingCreated(currentQuery.value).length,
  )

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

  const users = computed<User[]>(() => {
    const offset = (currentPage.value - 1) * pageSize

    if (serverSnapshot.value !== null) {
      return filteredSnapshot.value.slice(offset, offset + pageSize)
    }

    const localPage = getMatchingCreated(currentQuery.value).slice(offset, offset + pageSize)

    return [...localPage, ...remotePage.value].slice(0, pageSize)
  })

  function cancelLoading(): void {
    requestVersion += 1
    controller?.abort()
    controller = undefined
    isLoading.value = false
  }

  async function loadPage(page: number, query: string): Promise<boolean> {
    const version = ++requestVersion

    controller?.abort()
    controller = undefined

    currentPage.value = page
    currentQuery.value = query
    error.value = ''

    if (serverSnapshot.value !== null) {
      isLoading.value = false
      return true
    }

    const currentController = new AbortController()
    controller = currentController
    isLoading.value = true

    const offset = (page - 1) * pageSize
    const localMatches = getMatchingCreated(query)
    const localCount = localMatches.slice(offset, offset + pageSize).length

    const params = {
      limit: Math.max(1, pageSize - localCount),
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
      remotePage.value = response.users

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

  async function fetchSnapshot(): Promise<void> {
    const collected: User[] = []
    let skip = 0
    let expectedTotal = 1

    while (skip < expectedTotal) {
      const response = await ServiceProvider.users.getAll({
        limit: 100,
        skip,
      })

      expectedTotal = response.total

      if (response.users.length === 0) {
        if (skip < expectedTotal) {
          throw new Error('Не вдалося завантажити повний список.')
        }

        break
      }

      collected.push(...response.users)
      skip += response.users.length
    }

    cancelLoading()
    serverSnapshot.value = collected
  }

  async function ensureSnapshot(): Promise<void> {
    if (serverSnapshot.value !== null) {
      return
    }

    if (snapshotRequest) {
      return snapshotRequest
    }

    const request = fetchSnapshot()
    snapshotRequest = request

    try {
      await request
    } finally {
      if (snapshotRequest === request) {
        snapshotRequest = undefined
      }
    }
  }

  function getCreatedUser(id: number): User | undefined {
    return createdUsers.value.find((user) => user.id === id)
  }

  async function getUser(id: number): Promise<User> {
    if (id < 0) {
      const user = getCreatedUser(id)

      if (!user) {
        throw new ApiError(404, 'Користувача не знайдено.')
      }

      return user
    }

    if (serverSnapshot.value !== null) {
      const user = serverSnapshot.value.find((user) => user.id === id)

      if (!user) {
        throw new ApiError(404, 'Користувача не знайдено.')
      }

      return user
    }

    return ServiceProvider.users.getById(id)
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

  async function updateUser(id: number, data: UpdateUserDto): Promise<User> {
    if (isSaving.value) {
      throw new Error('Зачекайте завершення попередньої дії.')
    }

    isSaving.value = true

    try {
      if (id < 0) {
        const original = await getUser(id)
        const updated: User = { ...original, ...data, id }

        createdUsers.value = createdUsers.value.map((user) => (user.id === id ? updated : user))

        return updated
      }

      await ensureSnapshot()

      const original = await getUser(id)
      const response = await ServiceProvider.users.update(id, data)

      const updated: User = {
        ...original,
        ...response,
        ...data,
        id,
      }

      serverSnapshot.value = (serverSnapshot.value ?? []).map((user) =>
        user.id === id ? updated : user,
      )

      return updated
    } finally {
      isSaving.value = false
    }
  }

  async function deleteUser(id: number): Promise<void> {
    if (isSaving.value) {
      throw new Error('Зачекайте завершення попередньої дії.')
    }

    isSaving.value = true

    try {
      if (id < 0) {
        await getUser(id)

        createdUsers.value = createdUsers.value.filter((user) => user.id !== id)

        return
      }

      await ensureSnapshot()
      await getUser(id)
      await ServiceProvider.users.delete(id)

      serverSnapshot.value = (serverSnapshot.value ?? []).filter((user) => user.id !== id)
    } finally {
      isSaving.value = false
    }
  }

  return {
    pageSize,
    users,
    total,
    pageCount,
    isLoading,
    isCreating,
    isSaving,
    error,
    loadPage,
    cancelLoading,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getCreatedUser,
  }
})
