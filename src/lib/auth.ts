// Gerenciamento de sessão do operador.
// O token JWT fica no localStorage — ao recarregar a página o operador continua logado.

import { api } from './api'

const TOKEN_KEY = 'corte:operator_token'
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
): Promise<{ token: string; operator: OperatorSession }> {
  const result = await api.post<{ token: string; operator: OperatorSession }>(
    '/auth/login',
    { storeSlug, email, password },
  )
  localStorage.setItem(TOKEN_KEY, result.token)
  localStorage.setItem(OPERATOR_KEY, JSON.stringify(result.operator))
  return result
}

export function logoutOperator() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(OPERATOR_KEY)
}

export function getOperatorToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
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
  return !!getOperatorToken()
}
