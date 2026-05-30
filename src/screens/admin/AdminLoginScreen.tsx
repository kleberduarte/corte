import { useRef, useState } from 'react'
import { loginAdmin } from '../../lib/adminAuth'
import { ApiError } from '../../lib/api'

export default function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
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
      await loginAdmin(email.trim(), password)
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('E-mail ou senha incorretos')
      } else {
        setError(err instanceof ApiError ? err.message : 'Não foi possível conectar ao servidor')
      }
      emailRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__title">
          <div className="admin-login__brand">CORTE</div>
          <div className="admin-login__sub">Painel administrativo</div>
        </div>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label htmlFor="admin-email">E-mail</label>
            <input
              ref={emailRef}
              id="admin-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="admin-password">Senha</label>
            <input
              id="admin-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="admin-login__toggle-pass"
            onClick={() => setShowPass((v) => !v)}
          >
            {showPass ? 'Ocultar senha' : 'Mostrar senha'}
          </button>
          {error && <div className="admin-error" role="alert">{error}</div>}
          <button type="submit" className="admin-btn admin-btn--primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? (
              <>
                <span className="admin-spinner" aria-hidden />
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
