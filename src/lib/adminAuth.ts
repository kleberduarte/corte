import { api } from './api'

const TOKEN_KEY    = 'corte:admin_token'
const ADMIN_KEY    = 'corte:admin'

export type AdminSession = { id: string; name: string; email: string }

export async function loginAdmin(email: string, password: string) {
  const result = await api.post<{ token: string; admin: AdminSession }>('/admin/login', { email, password })
  localStorage.setItem(TOKEN_KEY, result.token)
  localStorage.setItem(ADMIN_KEY, JSON.stringify(result.admin))
  return result
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAdminSession(): AdminSession | null {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY) ?? '') } catch { return null }
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken()
}

/** Valida token com a API e atualiza sessão local; limpa storage se inválido. */
export async function validateAdminSession(): Promise<boolean> {
  const token = getAdminToken()
  if (!token) return false
  try {
    const admin = await api.get<AdminSession>('/admin/me', token)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
    return true
  } catch {
    logoutAdmin()
    return false
  }
}
