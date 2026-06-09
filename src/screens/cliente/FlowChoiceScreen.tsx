import { productImagePath } from '../../lib/imagePaths'

export type FlowChoice = 'categories' | 'counter' | 'preferential'

type Props = {
  immediate?: boolean
  onSelect: (choice: FlowChoice) => void
}

type FlowCard = {
  choice: FlowChoice
  title: string
  imageUrl: string
  imagePosition: string
  accent: string
  accentRgb: string
}

const ALL_CARDS: FlowCard[] = [
  {
    choice: 'categories',
    title: 'Categorias',
    imageUrl: productImagePath('bovinos', 'picanha-angus.jpg'),
    imagePosition: 'center center',
    accent: 'var(--gold)',
    accentRgb: '200,151,58',
  },
  {
    choice: 'counter',
    title: 'Ir ao balcão',
    imageUrl: productImagePath('bovinos', 'file-mignon.jpg'),
    imagePosition: 'center center',
    accent: '#E8E2D4',
    accentRgb: '232,226,212',
  },
  {
    choice: 'preferential',
    title: 'Preferencial',
    imageUrl: productImagePath('bovinos', 'wagyu-ribeye.jpg'),
    imagePosition: 'center center',
    accent: '#7EB8F0',
    accentRgb: '74,144,217',
  },
]

function getCards(immediate: boolean): FlowCard[] {
  if (!immediate) return ALL_CARDS
  return ALL_CARDS
    .filter((card) => card.choice !== 'categories')
    .map((card) =>
      card.choice === 'counter'
        ? { ...card, title: 'Escolha seu corte no balcão' }
        : card.choice === 'preferential'
          ? { ...card, title: 'Preferencial' }
          : card,
    )
}

function FlowChoiceCard({
  card,
  index,
  onSelect,
}: {
  card: FlowCard
  index: number
  onSelect: (choice: FlowChoice) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.choice)}
      className={`flow-card flow-card--${card.choice}`}
      style={{
        ['--flow-accent' as string]: card.accent,
        ['--flow-accent-rgb' as string]: card.accentRgb,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <img
        src={card.imageUrl}
        alt=""
        className="flow-card-img"
        style={{ objectPosition: card.imagePosition }}
        loading="eager"
      />
      <div className="flow-card-shade" />
      <h2 className={`flow-card-title${card.title.length > 20 ? ' flow-card-title--long' : ''}`}>
        {card.title}
      </h2>
    </button>
  )
}

export default function FlowChoiceScreen({ immediate = false, onSelect }: Props) {
  const cards = getCards(immediate)

  return (
    <div className="screen flow-choice-screen">
      <header className="flow-choice-header">
        <h1 className="flow-choice-heading">Como deseja continuar?</h1>
        <p className="flow-choice-lead">Toque para continuar</p>
      </header>

      <div className="scroll flow-choice-scroll">
        <div className="flow-choice-list">
          {cards.map((card, i) => (
            <FlowChoiceCard key={card.choice} card={card} index={i} onSelect={onSelect} />
          ))}
        </div>
      </div>

      <style>{`
        .flow-choice-screen {
          padding: 0 0 10px;
        }
        .flow-choice-header {
          flex-shrink: 0;
          padding: 8px 20px 12px;
        }
        .flow-choice-heading {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
        }
        .flow-choice-lead {
          margin: 6px 0 0;
          font-size: 17px;
          font-weight: 600;
          color: rgba(255,255,255,.88);
          line-height: 1.5;
        }
        .flow-choice-scroll {
          flex: 1;
          min-height: 0;
          padding: 0 12px 6px;
        }
        .flow-choice-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 100%;
        }

        .flow-card {
          position: relative;
          flex: 1;
          min-height: 200px;
          display: block;
          padding: 0;
          border: none;
          border-radius: 22px;
          overflow: hidden;
          cursor: pointer;
          background: #121214;
          box-shadow: 0 14px 48px rgba(0,0,0,.55);
          animation: flowCardIn .5s cubic-bezier(.34,1.2,.64,1) both;
          transition: transform .2s ease;
        }
        .flow-card--categories {
          border: 2px solid rgba(var(--flow-accent-rgb), .45);
          box-shadow:
            0 14px 48px rgba(0,0,0,.55),
            0 0 32px rgba(var(--flow-accent-rgb), .12);
        }
        .flow-card--counter {
          border: 2px solid rgba(232,226,212,.28);
        }
        .flow-card--preferential {
          border: 2px solid rgba(74,144,217,.45);
          box-shadow:
            0 14px 48px rgba(0,0,0,.55),
            0 0 32px rgba(74,144,217,.14);
        }

        .flow-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.12) contrast(1.05);
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .flow-card--counter .flow-card-img,
        .flow-card--preferential .flow-card-img {
          filter: saturate(1.18) contrast(1.08) brightness(1.04);
        }

        .flow-card-shade {
          position: absolute;
          inset: 0;
          background: rgba(13,13,14,.38);
          pointer-events: none;
        }
        .flow-card--categories .flow-card-shade {
          background: rgba(13,13,14,.42);
          box-shadow: inset 0 0 80px rgba(200,151,58,.12);
        }
        .flow-card--preferential .flow-card-shade {
          background: rgba(13,13,14,.42);
          box-shadow: inset 0 0 80px rgba(74,144,217,.14);
        }

        .flow-card-title {
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
        .flow-card-title--long {
          font-size: 38px;
          line-height: 1.12;
        }

        .flow-card:active .flow-card-img {
          transform: scale(1.05);
        }
        .flow-card:active {
          transform: scale(.988);
        }

        @keyframes flowCardIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
