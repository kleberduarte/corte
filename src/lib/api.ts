// Cliente HTTP centralizado.
// Toda comunicação com o backend passa por aqui — nunca use fetch() diretamente nas telas.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

type RequestOptions = RequestInit & { token?: string }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.message ?? 'Erro inesperado', body.error)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), token }),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),

  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), token }),
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
