import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children:  ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?:  (error: Error, info: ErrorInfo) => void
}

type State = { error: Error | null }

// ErrorBoundary não pode ser escrito como function component — React ainda exige class component.
// Envolver toda a árvore e partes críticas (KanbanScreen, por exemplo) separadamente.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
    // Em produção, aqui iria para Sentry / Datadog / LogRocket:
    // Sentry.captureException(error, { extra: info })
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset)
    }

    return <DefaultErrorFallback error={error} reset={this.reset} />
  }
}

// Fallback padrão — estilizado para o tema escuro do totem
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: 40, background: 'var(--bg)', textAlign: 'center', gap: 16,
      }}
    >
      <div style={{ fontSize: 48, lineHeight: 1 }}>⚠️</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--t1)', margin: 0 }}>
        Algo deu errado
      </h2>
      <p style={{ fontSize: 16, color: 'var(--t3)', maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
        Um erro inesperado ocorreu. A equipe técnica foi notificada.
      </p>
      {import.meta.env.DEV && (
        <pre style={{
          fontSize: 11, color: 'rgba(255,100,100,.8)', background: 'rgba(255,0,0,.05)',
          border: '1px solid rgba(255,0,0,.15)', borderRadius: 8,
          padding: '10px 14px', maxWidth: 480, overflowX: 'auto', textAlign: 'left',
        }}>
          {error.message}
        </pre>
      )}
      <button
        onClick={reset}
        style={{
          padding: '14px 32px', background: 'var(--primary)', color: 'white',
          border: 'none', borderRadius: 'var(--r-lg)', fontSize: 18, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
