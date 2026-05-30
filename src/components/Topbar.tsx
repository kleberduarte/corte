import { useStore } from '../data/config'

type Props = {
  storeName?: string
  showBack?: boolean
  onBack?: () => void
  hideStatus?: boolean
}

function useTenantLogo() {
  return document.documentElement.dataset.logoUrl ?? ''
}

export default function Topbar({ storeName, showBack, onBack, hideStatus }: Props) {
  const store = useStore()
  const displayName = storeName ?? store.name
  const logoUrl = useTenantLogo()

  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 12px', position: 'relative', zIndex: 20 }}>
      {showBack
        ? <button className="back-btn" onClick={onBack}>← Voltar</button>
        : <div style={{ width: 80 }} />
      }

      <div className="brand" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={displayName}
            style={{ height: 40, maxWidth: 140, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <>
            <div className="brand-icon">🔪</div>
            <div>
              <div className="brand-name">CORTE</div>
              <div className="brand-sub">{displayName}</div>
            </div>
          </>
        )}
      </div>

      {!hideStatus && (
        <div className="status-pill">
          <div className="status-dot" />
          <span className="status-txt">Aberto</span>
        </div>
      )}
    </div>
  )
}
