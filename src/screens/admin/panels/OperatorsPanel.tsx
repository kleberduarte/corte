import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { getAdminToken } from '../../../lib/adminAuth'

type Operator = { id: string; name: string; email: string; role: string; active: boolean }

export default function OperatorsPanel({ storeId, onBack }: { storeId: string; onBack: () => void }) {
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [newOp, setNewOp]         = useState({ name: '', email: '', password: '', role: 'OPERATOR' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [resetId, setResetId]     = useState<string | null>(null)
  const [newPass, setNewPass]     = useState('')

  async function load() {
    setLoading(true)
    try { setOperators(await api.get<Operator[]>(`/admin/stores/${storeId}/operators`, getAdminToken() ?? '')) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [storeId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      await api.post('/admin/operators', { ...newOp, storeId }, getAdminToken() ?? '')
      setShowForm(false); setNewOp({ name: '', email: '', password: '', role: 'OPERATOR' }); load()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function toggle(op: Operator) {
    await api.patch(`/admin/operators/${op.id}/toggle`, { active: !op.active }, getAdminToken() ?? '')
    setOperators(s => s.map(x => x.id === op.id ? { ...x, active: !op.active } : x))
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch(`/admin/operators/${resetId}/password`, { password: newPass }, getAdminToken() ?? '')
      setResetId(null); setNewPass('')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 20, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Operadores</div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowForm(v => !v)} style={btnPrimary}>+ Novo operador</button>
      </div>

      {/* Formulário novo operador */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#1a1a1c', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Novo operador</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input style={inputStyle} placeholder="Nome" value={newOp.name} required onChange={e => setNewOp(v => ({ ...v, name: e.target.value }))} />
            <input style={inputStyle} type="email" placeholder="E-mail" value={newOp.email} required onChange={e => setNewOp(v => ({ ...v, email: e.target.value }))} />
            <input style={inputStyle} type="password" placeholder="Senha" value={newOp.password} required minLength={6} onChange={e => setNewOp(v => ({ ...v, password: e.target.value }))} />
            <select style={inputStyle} value={newOp.role} onChange={e => setNewOp(v => ({ ...v, role: e.target.value }))}>
              <option value="OPERATOR">Operador</option>
              <option value="MANAGER">Gerente</option>
            </select>
          </div>
          {error && <div style={{ fontSize: 13, color: '#ff6b6b' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Criando...' : 'Criar operador'}
            </button>
          </div>
        </form>
      )}

      {/* Modal reset senha */}
      {resetId && (
        <form onSubmit={handleReset} style={{ background: '#1a1a1c', border: '1px solid rgba(255,107,107,.3)', borderRadius: 12, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: 1 }}>Redefinir senha</div>
          <input style={inputStyle} type="password" placeholder="Nova senha (mín. 6 caracteres)" value={newPass} required minLength={6} onChange={e => setNewPass(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setResetId(null)} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2, opacity: saving ? 0.6 : 1 }}>Salvar senha</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>Carregando...</div>
      ) : operators.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,.3)' }}>Nenhum operador cadastrado</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {operators.map(op => (
            <div key={op.id} style={{ background: '#1a1a1c', border: `1px solid ${op.active ? 'rgba(255,255,255,.08)' : 'rgba(255,59,48,.2)'}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: op.active ? '#34c759' : '#ff3b30', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{op.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{op.email} · {op.role === 'MANAGER' ? 'Gerente' : 'Operador'}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setResetId(op.id); setNewPass('') }} style={btnSecondary}>Senha</button>
                <button onClick={() => toggle(op)} style={{ ...btnSecondary, color: op.active ? '#ff6b6b' : '#34c759', borderColor: op.active ? 'rgba(255,107,107,.3)' : 'rgba(52,199,89,.3)' }}>
                  {op.active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }
const btnPrimary:   React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', background: '#C0272D', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnSecondary: React.CSSProperties = { padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.12)', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
