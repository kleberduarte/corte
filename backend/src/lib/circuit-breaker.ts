// Circuit breaker para proteger chamadas a APIs externas (Veltrix, GENERIC_REST).
//
// Estados:
//   CLOSED    → operação normal, falhas são contadas
//   OPEN      → circuito aberto, rejeita chamadas imediatamente (fail-fast)
//   HALF_OPEN → após resetTimeout, tenta UMA chamada de prova
//
// Se a chamada de prova falha → volta para OPEN
// Se a chamada de prova passa → volta para CLOSED e zera o contador

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

type CircuitBreakerOptions = {
  failureThreshold?: number   // falhas consecutivas para abrir (padrão: 5)
  resetTimeoutMs?:  number    // ms antes de tentar HALF_OPEN (padrão: 30s)
  name?:            string    // para logging
}

export class CircuitBreaker {
  private state: State = 'CLOSED'
  private failures = 0
  private lastFailureAt: number | null = null
  private readonly failureThreshold: number
  private readonly resetTimeoutMs: number
  private readonly name: string

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5
    this.resetTimeoutMs   = options.resetTimeoutMs   ?? 30_000
    this.name             = options.name              ?? 'circuit-breaker'
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error(`[${this.name}] Circuito aberto — serviço externo indisponível`)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  get currentState(): State { return this.state }

  private shouldAttemptReset(): boolean {
    return this.lastFailureAt !== null &&
      Date.now() - this.lastFailureAt >= this.resetTimeoutMs
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures += 1
    this.lastFailureAt = Date.now()
    if (this.failures >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN'
    }
  }
}

// Instâncias singleton por integração externa
export const veltrixCircuitBreaker = new CircuitBreaker({
  name: 'veltrix',
  failureThreshold: 3,
  resetTimeoutMs: 60_000,
})

export const genericRestCircuitBreaker = new CircuitBreaker({
  name: 'generic-rest',
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
})
