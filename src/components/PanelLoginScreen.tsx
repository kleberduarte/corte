import { useRef, useState } from 'react'
import './panel-login.css'

type Props = {
  subtitle: string
  onLogin: (email: string, password: string) => Promise<void>
  formatError?: (err: unknown) => string
}

const defaultFormatError = (err: unknown) =>
  err instanceof Error ? err.message : 'Não foi possível conectar ao servidor'

export default function PanelLoginScreen({ subtitle, onLogin, formatError = defaultFormatError }: Props) {
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onLogin(email.trim(), password)
    } catch (err) {
      setError(formatError(err))
      emailRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-login">
      <div className="panel-login__card">
        <div className="panel-login__title">
          <div className="panel-login__brand">CORTE</div>
          <div className="panel-login__sub">{subtitle}</div>
        </div>
        <form className="panel-login__form" onSubmit={handleSubmit}>
          <div className="panel-login__field">
            <label htmlFor="panel-login-email">E-mail</label>
            <input
              ref={emailRef}
              id="panel-login-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="panel-login__field">
            <label htmlFor="panel-login-password">Senha</label>
            <input
              id="panel-login-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="panel-login__toggle-pass"
            onClick={() => setShowPass((v) => !v)}
          >
            {showPass ? 'Ocultar senha' : 'Mostrar senha'}
          </button>
          {error && (
            <div className="panel-login__error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="panel-login__submit" disabled={loading}>
            {loading ? (
              <>
                <span className="panel-login__spinner" aria-hidden />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export function PanelLoginLoading({ message }: { message: string }) {
  return (
    <div className="panel-login">
      <div className="panel-login__loading">
        <span className="panel-login__spinner" aria-hidden />
        {message}
      </div>
    </div>
  )
}
