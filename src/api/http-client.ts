export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface HttpOptions extends RequestInit {
  auth?: boolean
  skipAuthRefresh?: boolean
}

interface AuthCallbacks {
  getAccessToken(): string
  getSessionVersion(): number
  refreshAccessToken(): Promise<void>
  onUnauthorized(sessionVersion: number): void
}

interface RefreshFlight {
  version: number
  promise: Promise<void>
}

let authCallbacks: AuthCallbacks | undefined
let refreshFlight: RefreshFlight | undefined

export function configureHttpAuth(callbacks: AuthCallbacks): void {
  authCallbacks = callbacks
}

function getResponseMessage(data: unknown, fallback: string): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message
  }

  return fallback
}

async function refreshOnce(callbacks: AuthCallbacks, version: number): Promise<void> {
  if (!refreshFlight || refreshFlight.version !== version) {
    refreshFlight = {
      version,
      promise: callbacks.refreshAccessToken(),
    }
  }

  const flight = refreshFlight

  try {
    await flight.promise
  } finally {
    if (refreshFlight === flight) {
      refreshFlight = undefined
    }
  }
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')

  if (!baseUrl) {
    throw new ApiError(0, 'Не задано VITE_API_URL у файлі .env.')
  }

  const { auth = false, skipAuthRefresh = false, ...requestOptions } = options

  const callbacks = authCallbacks
  const sessionVersion = callbacks?.getSessionVersion()

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const headers = new Headers(requestOptions.headers)
    headers.set('Accept', 'application/json')

    if (typeof requestOptions.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    if (auth) {
      if (!callbacks || sessionVersion !== callbacks.getSessionVersion()) {
        throw new ApiError(401, 'Сесія змінилася. Повторіть дію.')
      }

      const token = callbacks.getAccessToken()

      if (!token) {
        throw new ApiError(401, 'Для цієї дії потрібно увійти.')
      }

      headers.set('Authorization', `Bearer ${token}`)
    }

    let response: Response

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...requestOptions,
        headers,
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }

      throw new ApiError(0, 'Не вдалося з’єднатися із сервером. Перевірте підключення.')
    }

    if (response.status === 401 && auth && callbacks && sessionVersion !== undefined) {
      if (sessionVersion !== callbacks.getSessionVersion()) {
        throw new ApiError(401, 'Сесія змінилася. Повторіть дію.')
      }

      if (attempt === 0 && !skipAuthRefresh) {
        try {
          await refreshOnce(callbacks, sessionVersion)
        } catch (error: unknown) {
          if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
            callbacks.onUnauthorized(sessionVersion)
          }

          throw error
        }

        continue
      }

      callbacks.onUnauthorized(sessionVersion)
      throw new ApiError(401, 'Сесія завершилась. Увійдіть знову.')
    }

    const text = await response.text()
    let data: unknown

    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        throw new ApiError(response.status, 'Сервер повернув відповідь у неправильному форматі.')
      }
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        getResponseMessage(data, `Помилка запиту: HTTP ${response.status}.`),
      )
    }

    return data as T
  }

  throw new ApiError(401, 'Не вдалося відновити сесію.')
}
