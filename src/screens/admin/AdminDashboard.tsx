import { useState } from 'react'
import { logoutAdmin, getAdminSession } from '../../lib/adminAuth'
import StoresPanel from './panels/StoresPanel'
import StoreFormPanel from './panels/StoreFormPanel'
import OperatorsPanel from './panels/OperatorsPanel'

type Panel = 'stores' | 'store-form' | 'operators'

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [panel, setPanel]         = useState<Panel>('stores')
  const [editingStore, setEditingStore] = useState<string | null>(null)
  const [operatorsStore, setOperatorsStore] = useState<string | null>(null)
  const admin = getAdminSession()

  function handleLogout() { logoutAdmin(); onLogout() }

  function goStoreForm(storeId?: string) {
    setEditingStore(storeId ?? null)
    setPanel('store-form')
  }

  function goOperators(storeId: string) {
    setOperatorsStore(storeId)
    setPanel('operators')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0e', color: '#fff' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: '#1a1a1c', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>CORTE</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', padding: '3px 10px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20 }}>Admin</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>{admin?.name}</div>
        <button onClick={handleLogout} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
          Sair
        </button>
      </header>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 4, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <NavBtn active={panel === 'stores' || panel === 'store-form'} onClick={() => setPanel('stores')}>Lojas</NavBtn>
      </nav>

      {/* Content */}
      <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {panel === 'stores' && (
          <StoresPanel onNew={() => goStoreForm()} onEdit={goStoreForm} onOperators={goOperators} />
        )}
        {panel === 'store-form' && (
          <StoreFormPanel storeId={editingStore} onBack={() => setPanel('stores')} onSaved={() => setPanel('stores')} />
        )}
        {panel === 'operators' && operatorsStore && (
          <OperatorsPanel storeId={operatorsStore} onBack={() => setPanel('stores')} />
        )}
      </main>
    </div>
  )
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: 'none',
      background: active ? 'rgba(192,39,45,.2)' : 'transparent',
      color: active ? '#ff6b6b' : 'rgba(255,255,255,.5)',
      fontFamily: 'inherit',
    }}>
      {children}
    </button>
  )
}
