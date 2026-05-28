// no hooks needed — pure display component

type Props = {
  secondsLeft: number
  onContinue: () => void
  onReset: () => void
}

export default function InactivityOverlay({ secondsLeft, onContinue, onReset }: Props) {
  const pct = (secondsLeft / 15) * 100

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn .3s ease',
        padding: 32,
      }}
      onClick={onContinue}
    >
      {/* Anel de progresso SVG */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 28 }}>
        <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="var(--primary)" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 700,
          color: 'white',
        }}>
          {secondsLeft}
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 10 }}>
        Ainda está aí?
      </div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', textAlign: 'center', marginBottom: 36, lineHeight: 1.5 }}>
        A sessão será reiniciada em <strong style={{ color: 'white' }}>{secondsLeft} segundo{secondsLeft !== 1 ? 's' : ''}</strong>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onContinue() }}
        style={{
          padding: '18px 48px',
          background: 'var(--primary)', color: 'white',
          border: 'none', borderRadius: 'var(--r-lg)',
          fontSize: 17, fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          boxShadow: '0 8px 28px var(--primary-glow)',
          marginBottom: 16,
        }}
      >
        Continuar navegando
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onReset() }}
        style={{
          padding: '12px 32px',
          background: 'transparent', color: 'rgba(255,255,255,.5)',
          border: '1px solid rgba(255,255,255,.2)',
          borderRadius: 'var(--r)',
          fontSize: 14, fontWeight: 500,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
        }}
      >
        Reiniciar sessão
      </button>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  )
}
