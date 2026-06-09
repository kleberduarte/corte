import { productImagePath } from '../../lib/imagePaths'

type PickupMode = 'scheduled' | 'immediate'

type Props = {
  onSelect: (mode: PickupMode) => void
}

type PickupCard = {
  mode: PickupMode
  title: string
  imageUrl: string
  imagePosition: string
  accentRgb: string
}

const CARDS: PickupCard[] = [
  {
    mode: 'scheduled',
    title: 'Agendar retirada',
    imageUrl: productImagePath('bovinos', 'costela-bovina.jpg'),
    imagePosition: 'center center',
    accentRgb: '200,151,58',
  },
  {
    mode: 'immediate',
    title: 'Aguardar no balcão',
    imageUrl: productImagePath('bovinos', 'contrafile.jpg'),
    imagePosition: 'center center',
    accentRgb: '52,199,89',
  },
]

function PickupCardButton({
  card,
  index,
  onSelect,
}: {
  card: PickupCard
  index: number
  onSelect: (mode: PickupMode) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.mode)}
      className={`pickup-card pickup-card--${card.mode}`}
      style={{
        ['--pickup-accent-rgb' as string]: card.accentRgb,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <img
        src={card.imageUrl}
        alt=""
        className="pickup-card-img"
        style={{ objectPosition: card.imagePosition }}
        loading="eager"
      />
      <div className="pickup-card-shade" />
      <h2 className="pickup-card-title">{card.title}</h2>
    </button>
  )
}

export default function PickupModeScreen({ onSelect }: Props) {
  return (
    <div className="screen pickup-mode-screen">
      <header className="pickup-mode-header">
        <h1 className="pickup-heading">Como deseja retirar?</h1>
        <p className="pickup-lead">Toque em uma opção para continuar</p>
      </header>

      <div className="scroll pickup-mode-scroll">
        <div className="pickup-mode-list">
          {CARDS.map((card, i) => (
            <PickupCardButton key={card.mode} card={card} index={i} onSelect={onSelect} />
          ))}
        </div>
      </div>

      <style>{`
        .pickup-mode-screen {
          padding: 0 0 12px;
        }
        .pickup-mode-header {
          flex-shrink: 0;
          padding: 8px 20px 16px;
        }
        .pickup-heading {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
        }
        .pickup-lead {
          margin: 6px 0 0;
          font-size: 17px;
          font-weight: 600;
          color: rgba(255,255,255,.88);
          line-height: 1.5;
        }
        .pickup-mode-scroll {
          flex: 1;
          min-height: 0;
          padding: 0 12px 8px;
        }
        .pickup-mode-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 100%;
        }

        .pickup-card {
          position: relative;
          flex: 1;
          min-height: 240px;
          display: block;
          padding: 0;
          border: 2px solid rgba(255,255,255,.18);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          background: #121214;
          box-shadow: 0 14px 48px rgba(0,0,0,.55);
          animation: pickupCardIn .5s cubic-bezier(.34,1.2,.64,1) both;
          transition: transform .2s ease;
        }
        .pickup-card--scheduled {
          border-color: rgba(var(--pickup-accent-rgb), .4);
          box-shadow:
            0 14px 48px rgba(0,0,0,.55),
            0 0 32px rgba(var(--pickup-accent-rgb), .1);
        }
        .pickup-card--immediate {
          border-color: rgba(var(--pickup-accent-rgb), .35);
          box-shadow:
            0 14px 48px rgba(0,0,0,.55),
            0 0 32px rgba(var(--pickup-accent-rgb), .1);
        }

        .pickup-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.12) contrast(1.05);
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }

        .pickup-card-shade {
          position: absolute;
          inset: 0;
          background: rgba(13,13,14,.42);
          pointer-events: none;
        }
        .pickup-card--scheduled .pickup-card-shade {
          box-shadow: inset 0 0 80px rgba(var(--pickup-accent-rgb), .1);
        }
        .pickup-card--immediate .pickup-card-shade {
          box-shadow: inset 0 0 80px rgba(var(--pickup-accent-rgb), .1);
        }

        .pickup-card-title {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 24px;
          font-family: var(--font-serif);
          font-size: 48px;
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          text-align: center;
          letter-spacing: .3px;
          text-shadow:
            0 0 24px rgba(255,255,255,.35),
            0 2px 20px rgba(0,0,0,.85),
            0 4px 40px rgba(0,0,0,.65);
        }

        .pickup-card:active .pickup-card-img {
          transform: scale(1.05);
        }
        .pickup-card:active {
          transform: scale(.988);
        }

        @keyframes pickupCardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}

export type { PickupMode }
