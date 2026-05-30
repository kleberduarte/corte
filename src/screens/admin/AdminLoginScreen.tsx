import { useState } from 'react'
import { loginAdmin } from '../../lib/adminAuth'
import { ApiError } from '../../lib/api'

export default function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await loginAdmin(email, password)
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0e', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#1a1a1c', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 3, marginBottom: 6 }}>CORTE</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Painel Administrativo</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email" placeholder="E-mail" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={inputStyle}
          />
          <input
            type="password" placeholder="Senha" value={password}
            onChange={e => setPassword(e.target.value)} required
            style={inputStyle}
          />
          {error && <div style={{ fontSize: 13, color: '#ff6b6b', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 8, padding: '10px 12px' }}>{error}</div>}
          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 14, outline: 'none',
  fontFamily: 'inherit',
}

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '13px', borderRadius: 10, border: 'none', background: '#C0272D',
  color: '#fff', fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1, marginTop: 4, fontFamily: 'inherit',
})
