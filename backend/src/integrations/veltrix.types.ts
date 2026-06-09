/** Resposta de POST /auth/login */
export type VeltrixAuthResponse = {
  token: string
  email?: string
  name?: string
  role?: string
}

/** Item de GET /products (ProductResponse do Spring) */
export type VeltrixProduct = {
  id: number
  name: string
  codigoProduto?: string | null
  gtinEan?: string | null
  descricao?: string | null
  categoria?: string | null
  imagemUrl?: string | null
  price: number | string
  precoEfetivo?: number | string | null
  precoPromocional?: number | string | null
  emPromocao?: boolean
  stock?: number
  active?: boolean
  tipo?: string
}

export type VeltrixIntegrationMeta = {
  email: string
}
