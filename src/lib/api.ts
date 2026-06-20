// Cliente HTTP centralizado.
// Toda comunicação com o backend passa por aqui — nunca use fetch() diretamente nas telas.
// Cookies httpOnly são enviados automaticamente via credentials: 'include'.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // Cookie expirado mas localStorage ainda tem metadados → limpa sessão fantasma
    if (res.status === 401) {
      localStorage.removeItem('corte:operator')
    }
    throw new ApiError(res.status, body.message ?? 'Erro inesperado', body.error)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}
