import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../../../lib/api'
import { getAdminToken } from '../../../lib/adminAuth'
import { CHAIN_LABELS, CHAIN_OPTIONS } from '../constants'
import { useAdminUi, totemUrl } from '../adminUi'

type Store = {
  id: string; name: string; chain: string; slug: string; active: boolean
  _count: { operators: number; orders: number }
}

export default function StoresPanel({ onNew, onEdit, onOperators }: {
  onNew: () => void
  onEdit: (storeId: string) => void
  onOperators: (ctx: { id: string; name: string; slug: string }) => void
}) {
  const { toast, confirm } = useAdminUi()
  const [stores, setStores]   = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [query, setQuery]       = useState('')
  const [chainFilter, setChainFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const path = chainFilter ? `/admin/stores?chain=${chainFilter}` : '/admin/stores'
      const data = await api.get<Store[]>(path, getAdminToken() ?? '')
      setStores(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar lojas')
    } finally {
      setLoading(false)
    }
  }, [chainFilter])

  async function toggle(store: Store) {
    if (store.active) {
      const ok = await confirm({
        title: 'Desativar loja',
        message: `"${store.name}" deixará de aparecer no totem até ser reativada.`,
        confirmLabel: 'Desativar',
        danger: true,
      })
      if (!ok) return
    }
    try {
      await api.patch(`/admin/stores/${store.id}/toggle`, { active: !store.active }, getAdminToken() ?? '')
      setStores((s) => s.map((x) => (x.id === store.id ? { ...x, active: !store.active } : x)))
      toast(store.active ? 'Loja desativada' : 'Loja ativada')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Erro ao atualizar', 'error')
    }
  }

  async function copyLink(url: string, label: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast(`Link do totem ${label} copiado`)
    } catch {
      toast('Não foi possível copiar — copie manualmente da barra de endereço', 'error')
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stores
    return stores.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      (CHAIN_LABELS[s.chain] ?? s.chain).toLowerCase().includes(q),
    )
  }, [stores, query])

  useEffect(() => { load() }, [load])

  const chainLabel = CHAIN_OPTIONS.find((c) => c.value === chainFilter)?.label

  return (
    <div>
      <div className="admin-toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 className="admin-page-title">Lojas</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            {stores.length} cadastrada{stores.length !== 1 ? 's' : ''}
            {chainFilter ? ` · ${chainLabel}` : ''}
            {query && filtered.length !== stores.length ? ` · ${filtered.length} na busca` : ''}
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={onNew}>
          + Nova loja
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Buscar por nome ou slug..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar lojas"
        />
        <select
          className="admin-filter-select"
          value={chainFilter}
          onChange={(e) => setChainFilter(e.target.value)}
          aria-label="Filtrar por rede"
        >
          {CHAIN_OPTIONS.map((c) => (
            <option key={c.value || 'all'} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={load} disabled={loading}>
          Atualizar
        </button>
      </div>

      {error && (
        <div className="admin-error" role="alert">
          {error}
          <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" style={{ marginTop: 10 }} onClick={load}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-loading-block">
          <span className="admin-spinner" aria-hidden />
          Carregando lojas...
        </div>
      ) : stores.length === 0 && !chainFilter ? (
        <div className="admin-empty">
          <div className="admin-empty__icon">🏪</div>
          <p>Nenhuma loja cadastrada</p>
          <button type="button" className="admin-btn admin-btn--primary" style={{ marginTop: 16 }} onClick={onNew}>
            Cadastrar primeira loja
          </button>
        </div>
      ) : stores.length === 0 ? (
        <div className="admin-empty">
          <p>Nenhuma loja nesta rede</p>
          <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" style={{ marginTop: 12 }} onClick={() => setChainFilter('')}>
            Ver todas as redes
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <p>Nenhuma loja corresponde à busca</p>
        </div>
      ) : (
        <div className="admin-list">
          {filtered.map((store) => (
            <article
              key={store.id}
              className={`admin-card ${store.active ? '' : 'admin-card--inactive'}`}
            >
              <div className="admin-card__row">
                <span
                  className={`admin-status-dot ${store.active ? 'admin-status-dot--on' : 'admin-status-dot--off'}`}
                  title={store.active ? 'Ativa' : 'Inativa'}
                  aria-hidden
                />
                <div className="admin-card__info">
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 15 }}>{store.name}</strong>
                    <span className="admin-tag">{CHAIN_LABELS[store.chain] ?? store.chain}</span>
                    {!store.active && <span className="admin-tag admin-tag--warn">Inativa</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                    <code style={{ fontSize: 12 }}>?store={store.slug}</code>
                    {' · '}
                    {store._count.operators} operador{store._count.operators !== 1 ? 'es' : ''}
                    {' · '}
                    {store._count.orders} pedido{store._count.orders !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="admin-card__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--sm"
                    title="Copiar link do totem cliente"
                    onClick={() => copyLink(totemUrl(store.slug, 'cliente'), 'cliente')}
                  >
                    Link cliente
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--sm"
                    title="Copiar link do totem operador"
                    onClick={() => copyLink(totemUrl(store.slug, 'operador'), 'operador')}
                  >
                    Link operador
                  </button>
                  <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => onOperators({ id: store.id, name: store.name, slug: store.slug })}>
                    Operadores
                  </button>
                  <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => onEdit(store.id)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={`admin-btn admin-btn--secondary admin-btn--sm ${store.active ? 'admin-btn--danger-text' : 'admin-btn--success-text'}`}
                    onClick={() => toggle(store)}
                  >
                    {store.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
