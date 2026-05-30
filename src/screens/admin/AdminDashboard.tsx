import { useState } from 'react'
import { logoutAdmin, getAdminSession } from '../../lib/adminAuth'
import OverviewPanel from './panels/OverviewPanel'
import StoresPanel from './panels/StoresPanel'
import StoreFormPanel from './panels/StoreFormPanel'
import OperatorsPanel from './panels/OperatorsPanel'

type Panel = 'overview' | 'stores' | 'store-form' | 'operators'

type OperatorsContext = { id: string; name: string; slug: string }

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [panel, setPanel] = useState<Panel>('overview')
  const [editingStore, setEditingStore] = useState<string | null>(null)
  const [operatorsCtx, setOperatorsCtx] = useState<OperatorsContext | null>(null)
  const admin = getAdminSession()

  function handleLogout() {
    logoutAdmin()
    onLogout()
  }

  function goOverview() {
    setPanel('overview')
    setEditingStore(null)
    setOperatorsCtx(null)
  }

  function goStores() {
    setPanel('stores')
    setEditingStore(null)
    setOperatorsCtx(null)
  }

  function goStoreForm(storeId?: string) {
    setEditingStore(storeId ?? null)
    setPanel('store-form')
  }

  function goOperators(ctx: OperatorsContext) {
    setOperatorsCtx(ctx)
    setPanel('operators')
  }

  const breadcrumb: { label: string; action?: () => void }[] = []
  if (panel === 'overview') {
    breadcrumb.push({ label: 'Visão geral' })
  } else {
    breadcrumb.push({ label: 'Lojas', action: panel !== 'stores' ? goStores : undefined })
    if (panel === 'store-form') {
      breadcrumb.push({ label: editingStore ? 'Editar loja' : 'Nova loja' })
    }
    if (panel === 'operators' && operatorsCtx) {
      breadcrumb.push({ label: operatorsCtx.name, action: goStores })
      breadcrumb.push({ label: 'Operadores' })
    }
  }

  const showBreadcrumb = panel !== 'overview' && panel !== 'stores'

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__brand">CORTE</div>
        <div className="admin-header__badge">Admin</div>
        <div style={{ flex: 1 }} />
        <div className="admin-header__user">{admin?.name ?? admin?.email}</div>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <nav className="admin-nav" aria-label="Seções">
        <button
          type="button"
          className={`admin-nav__btn ${panel === 'overview' ? 'admin-nav__btn--active' : ''}`}
          onClick={goOverview}
        >
          Visão geral
        </button>
        <button
          type="button"
          className={`admin-nav__btn ${panel !== 'overview' ? 'admin-nav__btn--active' : ''}`}
          onClick={goStores}
        >
          Lojas
        </button>
      </nav>

      <main className="admin-main">
        <div className="admin-main__inner">
          {showBreadcrumb && (
            <nav className="admin-breadcrumb" aria-label="Navegação">
              {breadcrumb.map((item, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  {i > 0 && <span className="admin-breadcrumb__sep">/</span>}
                  {item.action ? (
                    <button type="button" onClick={item.action}>{item.label}</button>
                  ) : (
                    <span className="admin-breadcrumb__current">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {panel === 'overview' && <OverviewPanel onManageStores={goStores} />}
          {panel === 'stores' && (
            <StoresPanel onNew={() => goStoreForm()} onEdit={goStoreForm} onOperators={goOperators} />
          )}
          {panel === 'store-form' && (
            <StoreFormPanel storeId={editingStore} onBack={goStores} onSaved={goStores} />
          )}
          {panel === 'operators' && operatorsCtx && (
            <OperatorsPanel
              storeId={operatorsCtx.id}
              storeName={operatorsCtx.name}
              storeSlug={operatorsCtx.slug}
              onBack={goStores}
            />
          )}
        </div>
      </main>
    </div>
  )
}
