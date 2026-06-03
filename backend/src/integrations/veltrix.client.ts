import { AppError } from '../errors/AppError'
import type { VeltrixAuthResponse, VeltrixIntegrationMeta, VeltrixProduct } from './veltrix.types'

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '')
}

function parseMeta(raw: unknown): VeltrixIntegrationMeta {
  if (!raw || typeof raw !== 'object' || !('email' in raw)) {
    throw new AppError('integrationMeta deve conter { "email": "conta@empresa.com" } para Veltrix', 400)
  }
  const email = String((raw as VeltrixIntegrationMeta).email).trim()
  if (!email) throw new AppError('Email Veltrix ausente em integrationMeta', 400)
  return { email }
}

export async function veltrixLogin(
  apiBaseUrl: string,
  email: string,
  password: string,
): Promise<string> {
  const base = normalizeBaseUrl(apiBaseUrl)
  const response = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new AppError(
      `Falha ao autenticar no Veltrix (${response.status}): ${text || response.statusText}`,
      response.status === 401 ? 401 : 502,
    )
  }

  const data = (await response.json()) as VeltrixAuthResponse
  if (!data.token) throw new AppError('Veltrix não retornou token JWT', 502)
  return data.token
}

export async function veltrixFetchProducts(
  apiBaseUrl: string,
  token: string,
): Promise<VeltrixProduct[]> {
  const base = normalizeBaseUrl(apiBaseUrl)
  const response = await fetch(`${base}/products`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new AppError(`Erro ao listar produtos Veltrix: ${response.statusText}`, 502)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new AppError('Resposta inválida do Veltrix /products (esperado array)', 502)
  }
  return data as VeltrixProduct[]
}

export function resolveVeltrixCredentials(
  apiBaseUrl: string,
  apiKey: string,
  integrationMeta: unknown,
): { baseUrl: string; email: string; password: string } {
  const { email } = parseMeta(integrationMeta)
  const password = apiKey.trim()
  if (!password) throw new AppError('apiKey (senha Veltrix) não configurada na integração', 400)
  return { baseUrl: normalizeBaseUrl(apiBaseUrl), email, password }
}

export function absolutizeVeltrixImageUrl(apiBaseUrl: string, imagemUrl: string | null | undefined): string | null {
  if (!imagemUrl?.trim()) return null
  const url = imagemUrl.trim()
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = normalizeBaseUrl(apiBaseUrl)
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`
}
