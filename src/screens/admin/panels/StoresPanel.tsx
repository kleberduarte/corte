import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { getAdminToken } from '../../../lib/adminAuth'

type Store = {
  id: string; name: string; chain: string; slug: string; active: boolean
  _count: { operators: number; orders: number }
}

const CHAIN_LABELS: Record<string, string> = {
  PAO_DE_ACUCAR: 'Pão de Açúcar', EXTRA: 'Extra', VIOLETA: 'Violeta',
  CARREFOUR: 'Carrefour', CORTE_SUPERMERCADO: 'Corte', OUTROS: 'Outros',
}

export default function StoresPanel({ onNew, onEdit, onOperators }: {
  onNew: () => void
  onEdit: (storeId: string) => void
  onOperators: (storeId: string) => void
}) {
  const [stores, setStores]   = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const data = await api.get<Store[]>('/admin/stores', getAdminToken() ?? '')
      setStores(data)
    } finally { setLoading(false) }
  }

  async function toggle(store: Store) {
    await api.patch(`/admin/stores/${store.id}/toggle`, { active: !store.active }, getAdminToken() ?? '')
    setStores(s => s.map(x => x.id === store.id ? { ...x, active: !store.active } : x))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Lojas</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{stores.length} cadastrada(s)</div>
        </div>
        <button onClick={onNew} style={btnPrimary}>+ Nova loja</button>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>Carregando...</div>
      ) : stores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,.3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏪</div>
          <div>Nenhuma loja cadastrada</div>
          <button onClick={onNew} style={{ ...btnPrimary, marginTop: 16 }}>Cadastrar primeira loja</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stores.map(store => (
            <div key={store.id} style={{ background: '#1a1a1c', border: `1px solid ${store.active ? 'rgba(255,255,255,.08)' : 'rgba(255,107,107,.2)'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Status dot */}
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: store.active ? '#34c759' : '#ff3b30', flexShrink: 0 }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{store.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', padding: '2px 8px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12 }}>
                    {CHAIN_LABELS[store.chain] ?? store.chain}
                  </div>
                  {!store.active && <div style={{ fontSize: 11, color: '#ff6b6b', padding: '2px 8px', background: 'rgba(255,59,48,.1)', border: '1px solid rgba(255,59,48,.2)', borderRadius: 12 }}>Inativa</div>}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
                  /{store.slug} · {store._count.operators} operador(es) · {store._count.orders} pedido(s)
                </div>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => onOperators(store.id)} style={btnSecondary}>Operadores</button>
                <button onClick={() => onEdit(store.id)} style={btnSecondary}>Editar</button>
                <button
                  onClick={() => toggle(store)}
                  style={{ ...btnSecondary, color: store.active ? '#ff6b6b' : '#34c759', borderColor: store.active ? 'rgba(255,107,107,.3)' : 'rgba(52,199,89,.3)' }}
                >
                  {store.active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 10, border: 'none', background: '#C0272D',
  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}

const btnSecondary: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.12)',
  background: 'transparent', color: 'rgba(255,255,255,.7)', fontSize: 12,
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
