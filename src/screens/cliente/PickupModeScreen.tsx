type PickupMode = 'scheduled' | 'immediate'

type Props = {
  onSelect: (mode: PickupMode) => void
}

const CARDS: {
  mode: PickupMode
  badge: string
  title: string
  imageUrl: string
  imagePosition: string
}[] = [
  {
    mode: 'scheduled',
    badge: 'Agendar',
    title: 'Agendar retirada',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=900&h=700&fit=crop&q=90',
    imagePosition: 'center 55%',
  },
  {
    mode: 'immediate',
    badge: 'Agora',
    title: 'Aguardar no balcão',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&h=700&fit=crop&q=90',
    imagePosition: 'center 40%',
  },
]

export default function PickupModeScreen({ onSelect }: Props) {
  return (
    <div className="screen" style={{ padding: '0 0 12px' }}>
      <div style={{ flexShrink: 0, padding: '8px 20px 16px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.15 }}>
          Como deseja retirar?
        </div>
        <div style={{ fontSize: 17, color: 'var(--t3)', marginTop: 6, lineHeight: 1.5 }}>
          Toque em uma opção para continuar
        </div>
      </div>

      <div
        className="scroll"
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0 12px 8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: '100%',
          }}
        >
          {CARDS.map((card, i) => (
            <button
              key={card.mode}
              type="button"
              onClick={() => onSelect(card.mode)}
              className="pickup-card"
              style={{
                flex: 1,
                minHeight: 240,
                position: 'relative',
                padding: 0,
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 20,
                overflow: 'hidden',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 10px 40px rgba(0,0,0,.5)',
                animation: `pickupCardIn .5s cubic-bezier(.34,1.2,.64,1) ${i * 0.1}s both`,
              }}
            >
              <img
                src={card.imageUrl}
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: card.imagePosition,
                  transition: 'transform .45s cubic-bezier(.25,.46,.45,.94)',
                }}
                className="pickup-card-img"
              />

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: card.mode === 'scheduled'
                    ? 'linear-gradient(165deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.25) 35%, rgba(13,13,14,.92) 72%, rgba(13,13,14,.98) 100%)'
                    : 'linear-gradient(165deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.3) 40%, rgba(13,13,14,.9) 75%, rgba(13,13,14,.98) 100%)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '22px 22px 24px',
                }}
              >
                <div
                  style={{
                    alignSelf: 'flex-start',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: card.mode === 'scheduled' ? '#1a0f00' : 'rgba(255,255,255,.95)',
                    background: card.mode === 'scheduled' ? 'var(--gold)' : 'rgba(52,199,89,.92)',
                    padding: '5px 12px',
                    borderRadius: 20,
                    marginBottom: 12,
                    boxShadow: '0 4px 14px rgba(0,0,0,.35)',
                  }}
                >
                  {card.badge}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 41,
                      fontWeight: 700,
                      color: 'white',
                      lineHeight: 1.05,
                      textShadow: '0 2px 20px rgba(0,0,0,.7)',
                      flex: 1,
                    }}
                  >
                    {card.title}
                  </div>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.12)',
                      border: '1px solid rgba(255,255,255,.2)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      color: 'white',
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pickupCardIn {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: none; }
        }
        .pickup-card:active .pickup-card-img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  )
}

export type { PickupMode }
