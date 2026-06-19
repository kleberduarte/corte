// Gerenciamento de sessão do operador.
// O token JWT fica em cookie httpOnly — invisível ao JS.
// localStorage guarda apenas os metadados da sessão (sem token).

import { api } from './api'

const OPERATOR_KEY = 'corte:operator'

export type OperatorSession = {
  id: string
  name: string
  role: 'OPERATOR' | 'MANAGER'
  storeId: string
  storeName: string
}

export async function loginOperator(
  storeSlug: string,
  email: string,
  password: string,
): Promise<{ operator: OperatorSession }> {
  const result = await api.post<{ operator: OperatorSession }>(
    '/auth/login',
    { storeSlug, email, password },
  )
  localStorage.setItem(OPERATOR_KEY, JSON.stringify(result.operator))
  return result
}

export async function logoutOperator() {
  localStorage.removeItem(OPERATOR_KEY)
  try { await api.post('/auth/logout', {}) } catch { /* best-effort */ }
}

export function getOperatorSession(): OperatorSession | null {
  const raw = localStorage.getItem(OPERATOR_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OperatorSession
  } catch {
    return null
  }
}

export function isOperatorLoggedIn(): boolean {
  return !!getOperatorSession()
}
