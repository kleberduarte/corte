import { useEffect, useState } from 'react'
import { api, ApiError } from '../../../lib/api'
import { getAdminToken } from '../../../lib/adminAuth'
import { CHAIN_LABELS, ORDER_STATUS_LABELS, formatBRL, formatDateTime } from '../constants'

type AdminStats = {
  stores: { total: number; active: number; inactive: number }
  operators: { total: number; active: number; inactive: number }
  orders: { total: number; today: number; last7Days: number }
  ordersByStatus: { status: string; count: number }[]
  storesByChain: { chain: string; count: number }[]
  recentOrders: {
    id: string
    orderNumber: number
    pickupCode: string
    status: string
    totalAmount: number
    createdAt: string
    storeName: string
    storeSlug: string
  }[]
}

export default function OverviewPanel({ onManageStores }: { onManageStores: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setStats(await api.get<AdminStats>('/admin/stats', getAdminToken() ?? ''))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar métricas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="admin-loading-block">
        <span className="admin-spinner" aria-hidden />
        Carregando visão geral...
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="admin-error" role="alert">
        {error ?? 'Dados indisponíveis'}
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" style={{ marginTop: 10 }} onClick={load}>
          Tentar novamente
        </button>
      </div>
    )
  }

  const statusTotal = stats.ordersByStatus.reduce((n, s) => n + s.count, 0)

  return (
    <div>
      <div className="admin-toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 className="admin-page-title">Visão geral</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Resumo da plataforma em todas as lojas
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={load}>
          Atualizar
        </button>
      </div>

      <div className="admin-stats-grid">
        <StatCard label="Lojas ativas" value={stats.stores.active} hint={`${stats.stores.total} no total · ${stats.stores.inactive} inativa(s)`} accent="green" />
        <StatCard label="Operadores ativos" value={stats.operators.active} hint={`${stats.operators.total} cadastrado(s)`} accent="blue" />
        <StatCard label="Pedidos hoje" value={stats.orders.today} hint={`${stats.orders.last7Days} nos últimos 7 dias`} accent="primary" />
        <StatCard label="Pedidos (total)" value={stats.orders.total} hint="Desde o início" />
      </div>

      <div className="admin-two-col">
        <section className="admin-form-section">
          <h2 className="admin-form-section__title">Pedidos por status</h2>
          {statusTotal === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--t3)' }}>Nenhum pedido registrado ainda.</p>
          ) : (
            <ul className="admin-bar-list">
              {stats.ordersByStatus
                .sort((a, b) => b.count - a.count)
                .map((row) => (
                  <li key={row.status} className="admin-bar-list__item">
                    <div className="admin-bar-list__label">
                      <span>{ORDER_STATUS_LABELS[row.status] ?? row.status}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="admin-bar-list__track">
                      <div
                        className={`admin-bar-list__fill admin-bar-list__fill--${row.status.toLowerCase()}`}
                        style={{ width: `${Math.max(4, (row.count / statusTotal) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="admin-form-section">
          <h2 className="admin-form-section__title">Lojas ativas por rede</h2>
          {stats.storesByChain.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--t3)' }}>Nenhuma loja ativa.</p>
          ) : (
            <ul className="admin-chain-list">
              {stats.storesByChain
                .sort((a, b) => b.count - a.count)
                .map((row) => (
                  <li key={row.chain} className="admin-chain-list__item">
                    <span>{CHAIN_LABELS[row.chain] ?? row.chain}</span>
                    <span className="admin-tag">{row.count}</span>
                  </li>
                ))}
            </ul>
          )}
          <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" style={{ marginTop: 16 }} onClick={onManageStores}>
            Gerenciar lojas
          </button>
        </section>
      </div>

      <section className="admin-form-section" style={{ marginTop: 16 }}>
        <h2 className="admin-form-section__title">Pedidos recentes</h2>
        {stats.recentOrders.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--t3)' }}>Nenhum pedido recente.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Pedido</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Quando</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.storeName}</td>
                    <td>
                      <span className="admin-table__mono">#{String(o.orderNumber).padStart(3, '0')}</span>
                      {' '}
                      <span className="admin-tag">{o.pickupCode}</span>
                    </td>
                    <td>
                      <span className={`admin-status-pill admin-status-pill--${o.status.toLowerCase()}`}>
                        {ORDER_STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td>{formatBRL(o.totalAmount)}</td>
                    <td className="admin-table__muted">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: number
  hint: string
  accent?: 'green' | 'blue' | 'primary'
}) {
  return (
    <article className={`admin-stat-card ${accent ? `admin-stat-card--${accent}` : ''}`}>
      <div className="admin-stat-card__value">{value.toLocaleString('pt-BR')}</div>
      <div className="admin-stat-card__label">{label}</div>
      <div className="admin-stat-card__hint">{hint}</div>
    </article>
  )
}
