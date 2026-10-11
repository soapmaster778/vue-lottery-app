export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
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

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')

  if (!baseUrl) {
    throw new ApiError(0, 'Не задано VITE_API_URL. Перевірте файл .env.')
  }

  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(0, 'Не вдалося з’єднатися із сервером. Перевірте підключення.')
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
