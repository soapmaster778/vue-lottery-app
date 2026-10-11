import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError } from '@/api/http-client'
import { ServiceProvider } from '@/services/service-provider'
import type { AuthUser, LoginDto } from '@/types/auth'
import type { User } from '@/types/user'
import { getErrorMessage } from '@/utils/errors'

const STORAGE_KEY = 'vue-lottery-app:auth'

interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const user = value as Record<string, unknown>

  const stringFields = ['username', 'email', 'firstName', 'lastName', 'image']

  return (
    typeof user.id === 'number' &&
    Number.isSafeInteger(user.id) &&
    user.id > 0 &&
    stringFields.every((field) => typeof user[field] === 'string') &&
    (user.gender === 'male' || user.gender === 'female' || user.gender === 'other')
  )
}

function restoreSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return null
    }

    const parsed: unknown = JSON.parse(stored)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('accessToken' in parsed) ||
      typeof parsed.accessToken !== 'string' ||
      !parsed.accessToken ||
      !('refreshToken' in parsed) ||
      typeof parsed.refreshToken !== 'string' ||
      !parsed.refreshToken ||
      !('user' in parsed) ||
      !isAuthUser(parsed.user)
    ) {
      return null
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      user: parsed.user,
    }
  } catch {
    return null
  }
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    image: user.image ?? '',
  }
}

export const useAuthStore = defineStore('auth', () => {
  const restored = restoreSession()

  const accessToken = ref(restored?.accessToken ?? '')
  const refreshToken = ref(restored?.refreshToken ?? '')
  const user = ref<AuthUser | null>(restored?.user ?? null)
  const notice = ref('')
  const sessionVersion = ref(0)

  let initialization: Promise<void> | undefined

  const isAuthenticated = computed(() =>
    Boolean(accessToken.value && refreshToken.value && user.value),
  )

  function persistSession(): void {
    try {
      if (!isAuthenticated.value) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            accessToken: accessToken.value,
            refreshToken: refreshToken.value,
            user: user.value,
          }),
        )
      }

      notice.value = ''
    } catch {
      notice.value = 'Не вдалося оновити сесію у сховищі браузера.'
    }
  }

  function logout(): void {
    sessionVersion.value += 1
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    persistSession()
  }

  function invalidateSession(version: number): boolean {
    if (version !== sessionVersion.value) {
      return false
    }

    logout()
    notice.value = 'Сесія завершилась. Увійдіть знову.'
    return true
  }

  async function login(data: LoginDto): Promise<void> {
    const version = sessionVersion.value
    const response = await ServiceProvider.auth.login(data)

    if (version !== sessionVersion.value) {
      throw new ApiError(401, 'Сесія змінилася. Повторіть вхід.')
    }

    sessionVersion.value += 1
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken

    user.value = {
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      gender: response.gender,
      image: response.image,
    }

    persistSession()
  }

  async function refreshAccessToken(): Promise<void> {
    const version = sessionVersion.value
    const token = refreshToken.value

    if (!token) {
      throw new ApiError(401, 'Відсутній refreshToken.')
    }

    const response = await ServiceProvider.auth.refresh(token)

    if (version !== sessionVersion.value) {
      throw new ApiError(401, 'Сесія змінилася.')
    }

    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken
    persistSession()
  }

  async function initializeSession(): Promise<void> {
    if (!isAuthenticated.value) {
      return
    }

    const version = sessionVersion.value

    try {
      const currentUser = await ServiceProvider.auth.getCurrentUser()

      if (version === sessionVersion.value) {
        user.value = toAuthUser(currentUser)
        persistSession()
      }
    } catch (error: unknown) {
      if (version !== sessionVersion.value) {
        return
      }

      if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
        invalidateSession(version)
      } else {
        notice.value = getErrorMessage(error)
      }
    }
  }

  function initialize(): Promise<void> {
    initialization ??= initializeSession()
    return initialization
  }

  return {
    accessToken,
    refreshToken,
    user,
    notice,
    sessionVersion,
    isAuthenticated,
    initialize,
    login,
    logout,
    refreshAccessToken,
    invalidateSession,
  }
})
