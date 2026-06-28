const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface FetchOptions {
  method?: HttpMethod
  body?: unknown
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const fetchClient = async <T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { method = 'GET', body } = options

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // send HttpOnly cookie on every request
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, message)
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T

  return res.json()
}