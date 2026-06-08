import type { ReactNode } from 'react'

type PickupMode = 'scheduled' | 'immediate'

type Props = {
  onSelect: (mode: PickupMode) => void
}

type PickupCard = {
  mode: PickupMode
  badge: string
  title: string
  subtitle: string
  imageUrl: string
  imagePosition: string
  heroDecor: ReactNode
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.2" fill="currentColor" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" />
      <circle cx="16" cy="14" r="1.2" fill="currentColor" />
    </svg>
  )
}

function CounterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10h16v10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 14h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="7" r="3" fill="currentColor" />
    </svg>
  )
}

function CalendarHeroDecor() {
  return (
    <div className="pickup-hero-decor" aria-hidden>
      <div className="pickup-calendar-card">
        <div className="pickup-calendar-top">
          <CalendarIcon />
          <span>Retirada</span>
        </div>
        <div className="pickup-calendar-day">15</div>
        <div className="pickup-calendar-slot">14:30</div>
        <div className="pickup-calendar-notch pickup-calendar-notch--left" />
        <div className="pickup-calendar-notch pickup-calendar-notch--right" />
      </div>
    </div>
  )
}

function CounterHeroDecor() {
  return (
    <div className="pickup-hero-decor" aria-hidden>
      <div className="pickup-counter-card">
        <div className="pickup-counter-pulse" />
        <div className="pickup-counter-icon-wrap">
          <CounterIcon />
        </div>
        <div className="pickup-counter-label">No balcão</div>
        <div className="pickup-counter-sub">Aguarde a senha</div>
      </div>
    </div>
  )
}

const CARDS: PickupCard[] = [
  {
    mode: 'scheduled',
    badge: 'Agendar',
    title: 'Agendar retirada',
    subtitle: 'Escolha dia e horário',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=900&h=700&fit=crop&q=90',
    imagePosition: 'center 55%',
    heroDecor: <CalendarHeroDecor />,
  },
  {
    mode: 'immediate',
    badge: 'Agora',
    title: 'Aguardar no balcão',
    subtitle: 'Retire assim que ficar pronto',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&h=700&fit=crop&q=90',
    imagePosition: 'center 40%',
    heroDecor: <CounterHeroDecor />,
  },
]

export default function PickupModeScreen({ onSelect }: Props) {
  return (
    <div className="screen" style={{ padding: '0 0 12px' }}>
      <div style={{ flexShrink: 0, padding: '8px 20px 16px' }}>
        <div className="pickup-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.15 }}>
          Como deseja retirar?
        </div>
        <div className="pickup-lead" style={{ fontSize: 17, color: 'var(--t3)', marginTop: 6, lineHeight: 1.5 }}>
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
              className={`pickup-card pickup-card--${card.mode}`}
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

              {card.heroDecor}

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
                  className="pickup-card-badge"
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: card.mode === 'scheduled' ? '#1a0f00' : 'rgba(255,255,255,.95)',
                    background: card.mode === 'scheduled' ? 'var(--gold)' : 'rgba(52,199,89,.92)',
                    padding: '5px 12px',
                    borderRadius: 20,
                    marginBottom: 10,
                    boxShadow: '0 4px 14px rgba(0,0,0,.35)',
                  }}
                >
                  {card.mode === 'scheduled' ? <CalendarIcon /> : <CounterIcon />}
                  {card.badge}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 41,
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.05,
                    textShadow: '0 2px 20px rgba(0,0,0,.7)',
                  }}
                >
                  {card.title}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 17,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,.72)',
                    lineHeight: 1.3,
                  }}
                >
                  {card.subtitle}
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

        .pickup-hero-decor {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .pickup-calendar-card {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-54%) rotate(-4deg);
          width: 118px;
          padding: 12px 14px 14px;
          border-radius: 14px;
          background: linear-gradient(180deg, #FDFCF9 0%, #F3F0E8 100%);
          color: #1a0f00;
          text-align: center;
          box-shadow:
            0 18px 44px rgba(0,0,0,.5),
            0 0 0 1px rgba(255,255,255,.55),
            0 0 0 1px rgba(0,0,0,.04) inset;
          animation: pickupDecorIn .55s cubic-bezier(.34,1.2,.64,1) .12s both;
        }
        .pickup-calendar-top {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .8px;
          text-transform: uppercase;
          color: rgba(26,15,0,.65);
        }
        .pickup-calendar-top svg {
          color: var(--gold);
        }
        .pickup-calendar-day {
          margin-top: 6px;
          font-family: var(--font-serif);
          font-size: 42px;
          font-weight: 700;
          line-height: 1;
          color: #1a0f00;
        }
        .pickup-calendar-slot {
          margin-top: 4px;
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          background: var(--gold);
          color: #1a0f00;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: .5px;
        }
        .pickup-calendar-notch {
          position: absolute;
          top: 50%;
          width: 8px;
          height: 8px;
          margin-top: -4px;
          border-radius: 50%;
          background: #121214;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
        }
        .pickup-calendar-notch--left { left: -4px; }
        .pickup-calendar-notch--right { right: -4px; }

        .pickup-counter-card {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-54%) rotate(3deg);
          width: 124px;
          padding: 14px 12px;
          border-radius: 16px;
          background: linear-gradient(180deg, #1e2a1e 0%, #121814 100%);
          color: #fff;
          text-align: center;
          border: 1px solid rgba(52,199,89,.45);
          box-shadow:
            0 18px 44px rgba(0,0,0,.5),
            0 0 28px rgba(52,199,89,.18);
          animation: pickupDecorIn .55s cubic-bezier(.34,1.2,.64,1) .12s both;
        }
        .pickup-counter-pulse {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #34C759;
          box-shadow: 0 0 0 0 rgba(52,199,89,.55);
          animation: pickupPulse 1.8s ease-out infinite;
        }
        .pickup-counter-icon-wrap {
          width: 44px;
          height: 44px;
          margin: 0 auto 8px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(52,199,89,.18);
          color: #6EE7A0;
        }
        .pickup-counter-icon-wrap svg {
          width: 24px;
          height: 24px;
        }
        .pickup-counter-label {
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 700;
          line-height: 1.1;
        }
        .pickup-counter-sub {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .4px;
          color: rgba(255,255,255,.62);
        }

        @keyframes pickupDecorIn {
          from { opacity: 0; transform: translateY(calc(-54% + 16px)) rotate(-4deg); }
          to   { opacity: 1; transform: translateY(-54%) rotate(-4deg); }
        }
        .pickup-card--immediate .pickup-calendar-card,
        .pickup-card--immediate .pickup-counter-card {
          animation-name: pickupDecorInCounter;
        }
        @keyframes pickupDecorInCounter {
          from { opacity: 0; transform: translateY(calc(-54% + 16px)) rotate(3deg); }
          to   { opacity: 1; transform: translateY(-54%) rotate(3deg); }
        }
        @keyframes pickupPulse {
          0%   { box-shadow: 0 0 0 0 rgba(52,199,89,.55); }
          70%  { box-shadow: 0 0 0 10px rgba(52,199,89,0); }
          100% { box-shadow: 0 0 0 0 rgba(52,199,89,0); }
        }
      `}</style>
    </div>
  )
}

export type { PickupMode }
