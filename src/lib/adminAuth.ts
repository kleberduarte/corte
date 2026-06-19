// Sessão do admin — token em cookie httpOnly, metadados em localStorage.

import { api } from './api'

const ADMIN_KEY = 'corte:admin'

export type AdminSession = { id: string; name: string; email: string }

export async function loginAdmin(email: string, password: string) {
  const result = await api.post<{ admin: AdminSession }>('/admin/login', { email, password })
  localStorage.setItem(ADMIN_KEY, JSON.stringify(result.admin))
  return result
}

export async function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY)
  try { await api.post('/admin/logout', {}) } catch { /* best-effort */ }
}

export function getAdminSession(): AdminSession | null {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY) ?? '') } catch { return null }
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminSession()
}

export async function validateAdminSession(): Promise<boolean> {
  if (!getAdminSession()) return false
  try {
    const admin = await api.get<AdminSession>('/admin/me')
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
    return true
  } catch {
    await logoutAdmin()
    return false
  }
}
