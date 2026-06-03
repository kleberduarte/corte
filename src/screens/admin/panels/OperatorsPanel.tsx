import { useEffect, useState } from 'react'
import { api, ApiError } from '../../../lib/api'
import { getAdminToken } from '../../../lib/adminAuth'
import { useAdminUi, totemUrl } from '../adminUi'

type Operator = { id: string; name: string; email: string; role: string; active: boolean }

export default function OperatorsPanel({
  storeId,
  storeName,
  storeSlug,
  onBack,
}: {
  storeId: string
  storeName: string
  storeSlug: string
  onBack: () => void
}) {
  const { toast, confirm } = useAdminUi()
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showForm, setShowForm]   = useState(false)
  const [newOp, setNewOp]         = useState({ name: '', email: '', password: '', role: 'OPERATOR' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [resetId, setResetId]     = useState<string | null>(null)
  const [newPass, setNewPass]     = useState('')

  async function load() {
    setLoading(true)
    setLoadError(null)
    try {
      setOperators(await api.get<Operator[]>(`/admin/stores/${storeId}/operators`, getAdminToken() ?? ''))
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Erro ao carregar operadores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [storeId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.post('/admin/operators', { ...newOp, storeId }, getAdminToken() ?? '')
      setShowForm(false)
      setNewOp({ name: '', email: '', password: '', role: 'OPERATOR' })
      toast('Operador criado')
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar')
    } finally {
      setSaving(false)
    }
  }

  async function toggle(op: Operator) {
    if (op.active) {
      const ok = await confirm({
        title: 'Desativar operador',
        message: `${op.name} não poderá mais acessar o totem operador.`,
        confirmLabel: 'Desativar',
        danger: true,
      })
      if (!ok) return
    }
    try {
      await api.patch(`/admin/operators/${op.id}/toggle`, { active: !op.active }, getAdminToken() ?? '')
      setOperators((s) => s.map((x) => (x.id === op.id ? { ...x, active: !op.active } : x)))
      toast(op.active ? 'Operador desativado' : 'Operador ativado')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Erro ao atualizar', 'error')
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/admin/operators/${resetId}/password`, { password: newPass }, getAdminToken() ?? '')
      setResetId(null)
      setNewPass('')
      toast('Senha redefinida')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Erro ao salvar senha', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function copyOperadorLink() {
    try {
      await navigator.clipboard.writeText(totemUrl(storeSlug, 'operador'))
      toast('Link do totem operador copiado')
    } catch {
      toast('Não foi possível copiar o link', 'error')
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="admin-toolbar" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="admin-page-title">Operadores</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>{storeName}</p>
        </div>
        <div className="admin-card__actions">
          <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={copyOperadorLink}>
            Link operador
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Fechar' : '+ Novo operador'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-form-section" style={{ marginBottom: 20 }}>
          <h2 className="admin-form-section__title">Novo operador</h2>
          <div className="admin-grid">
            <div className="admin-field">
              <label htmlFor="op-name">Nome</label>
              <input id="op-name" required value={newOp.name} onChange={(e) => setNewOp((v) => ({ ...v, name: e.target.value }))} />
            </div>
            <div className="admin-field">
              <label htmlFor="op-email">E-mail</label>
              <input id="op-email" type="email" required value={newOp.email} onChange={(e) => setNewOp((v) => ({ ...v, email: e.target.value }))} />
            </div>
            <div className="admin-field">
              <label htmlFor="op-pass">Senha</label>
              <input id="op-pass" type="password" required minLength={6} value={newOp.password} onChange={(e) => setNewOp((v) => ({ ...v, password: e.target.value }))} />
            </div>
            <div className="admin-field">
              <label htmlFor="op-role">Função</label>
              <select id="op-role" value={newOp.role} onChange={(e) => setNewOp((v) => ({ ...v, role: e.target.value }))}>
                <option value="OPERATOR">Operador</option>
                <option value="MANAGER">Gerente</option>
              </select>
            </div>
          </div>
          {error && <div className="admin-error" style={{ marginTop: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" className="admin-btn admin-btn--ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="admin-btn admin-btn--primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? 'Criando...' : 'Criar operador'}
            </button>
          </div>
        </form>
      )}

      {resetId && (
        <form onSubmit={handleReset} className="admin-form-section" style={{ marginBottom: 20, borderColor: 'rgba(255,107,107,.35)' }}>
          <h2 className="admin-form-section__title" style={{ color: '#ff8a8f' }}>Redefinir senha</h2>
          <div className="admin-field">
            <label htmlFor="new-pass">Nova senha</label>
            <input id="new-pass" type="password" required minLength={6} value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            <p className="admin-field__hint">Mínimo de 6 caracteres</p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="admin-btn admin-btn--ghost" style={{ flex: 1 }} onClick={() => setResetId(null)}>
              Cancelar
            </button>
            <button type="submit" className="admin-btn admin-btn--primary" style={{ flex: 2 }} disabled={saving}>
              Salvar senha
            </button>
          </div>
        </form>
      )}

      {loadError && (
        <div className="admin-error" role="alert">
          {loadError}
          <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" style={{ marginTop: 10 }} onClick={load}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-loading-block">
          <span className="admin-spinner" aria-hidden />
          Carregando operadores...
        </div>
      ) : operators.length === 0 ? (
        <div className="admin-empty">
          <p>Nenhum operador cadastrado nesta loja</p>
          <button type="button" className="admin-btn admin-btn--primary" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>
            Cadastrar operador
          </button>
        </div>
      ) : (
        <div className="admin-list">
          {operators.map((op) => (
            <article key={op.id} className={`admin-card ${op.active ? '' : 'admin-card--inactive'}`}>
              <div className="admin-card__row">
                <span className={`admin-status-dot ${op.active ? 'admin-status-dot--on' : 'admin-status-dot--off'}`} aria-hidden />
                <div className="admin-card__info">
                  <strong style={{ fontSize: 'calc(14px * var(--font-scale))' }}>{op.name}</strong>
                  <div style={{ fontSize: 'calc(12px * var(--font-scale))', color: 'var(--t3)', marginTop: 2 }}>
                    {op.email} · {op.role === 'MANAGER' ? 'Gerente' : 'Operador'}
                  </div>
                </div>
                <div className="admin-card__actions">
                  <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => { setResetId(op.id); setNewPass('') }}>
                    Redefinir senha
                  </button>
                  <button
                    type="button"
                    className={`admin-btn admin-btn--secondary admin-btn--sm ${op.active ? 'admin-btn--danger-text' : 'admin-btn--success-text'}`}
                    onClick={() => toggle(op)}
                  >
                    {op.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ marginTop: 24 }} onClick={onBack}>
        ← Voltar às lojas
      </button>
    </div>
  )
}
