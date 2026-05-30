import { useState } from 'react'
import { loginOperator } from '../../lib/auth'
import { ApiError } from '../../lib/api'
import { useStore } from '../../data/config'

type Props = {
  onSuccess: () => void
}

export default function LoginScreen({ onSuccess }: Props) {
  const store = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await loginOperator(store.id, email, password)
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Não foi possível conectar ao servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2, marginBottom: 4 }}>CORTE</div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Painel do operador · {store.name}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--s2)', color: 'var(--t1)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--s2)', color: 'var(--t1)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--primary)', background: 'rgba(107,33,168,.1)', border: '1px solid rgba(107,33,168,.2)', borderRadius: 8, padding: '10px 12px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 4, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
