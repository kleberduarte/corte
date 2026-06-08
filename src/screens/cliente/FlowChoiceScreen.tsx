import type { ReactNode } from 'react'
import { CATEGORY_CARDS } from '../../data/products'

export type FlowChoice = 'categories' | 'counter' | 'preferential'

type Props = {
  onSelect: (choice: FlowChoice) => void
}

type FlowCard = {
  choice: FlowChoice
  badge: string
  title: string
  subtitle: string
  imageUrl: string
  imagePosition: string
  accent: string
  accentRgb: string
  badgeText: string
  heroDecor?: ReactNode
}

const FEATURED_MEAT = CATEGORY_CARDS.find((c) => c.featured)!

function TicketHeroDecor({ code, priority }: { code: string; priority?: boolean }) {
  return (
    <div className={`flow-hero-decor${priority ? ' flow-hero-decor--preferential' : ''}`} aria-hidden>
      <div className="flow-ticket-wrap">
        <div className={`flow-ticket${priority ? ' flow-ticket--priority' : ''}`}>
          {priority && <div className="flow-ticket-priority-tag">P</div>}
          <div className="flow-ticket-body">
            <div className="flow-ticket-code">{code}</div>
          </div>
          <div className="flow-ticket-notch flow-ticket-notch--left" />
          <div className="flow-ticket-notch flow-ticket-notch--right" />
        </div>
      </div>
    </div>
  )
}

const CARDS: FlowCard[] = [
  {
    choice: 'categories',
    badge: 'Cardápio',
    title: 'Categorias',
    subtitle: 'Escolha corte e peso',
    imageUrl: FEATURED_MEAT.imageUrl,
    imagePosition: 'center 38%',
    accent: 'var(--gold)',
    accentRgb: '200,151,58',
    badgeText: '#1a0f00',
  },
  {
    choice: 'counter',
    badge: 'Balcão',
    title: 'Ir ao balcão',
    subtitle: 'Senha na impressora',
    imageUrl: FEATURED_MEAT.imageUrl.replace('w=900&h=500', 'w=1200&h=700'),
    imagePosition: '42% center',
    accent: '#E8E2D4',
    accentRgb: '232,226,212',
    badgeText: '#0d0d0e',
    heroDecor: <TicketHeroDecor code="A-4821" />,
  },
  {
    choice: 'preferential',
    badge: 'Prioridade',
    title: 'Preferencial',
    subtitle: 'Lei 10.048',
    imageUrl: FEATURED_MEAT.imageUrl.replace('w=900&h=500', 'w=1200&h=700'),
    imagePosition: 'center 42%',
    accent: '#7EB8F0',
    accentRgb: '74,144,217',
    badgeText: '#0a1628',
    heroDecor: <TicketHeroDecor code="P-2847" priority />,
  },
]

const COUNTER_IMG_FALLBACK =
  'https://images.unsplash.com/photo-1590507385303-b25eca128cc6?w=1200&h=700&fit=crop&q=90'

function FlowChoiceCard({
  card,
  index,
  onSelect,
}: {
  card: FlowCard
  index: number
  onSelect: (choice: FlowChoice) => void
}) {
  const isCategories = card.choice === 'categories'
  const isCounter = card.choice === 'counter'
  const isPreferential = card.choice === 'preferential'

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
      <div className="flow-card-hero">
        <img
          src={card.imageUrl}
          alt=""
          className="flow-card-hero-img"
          style={{ objectPosition: card.imagePosition }}
          loading="eager"
          onError={(e) => {
            if (isCounter || isPreferential) (e.currentTarget as HTMLImageElement).src = COUNTER_IMG_FALLBACK
          }}
        />
        <div className="flow-card-hero-shade" />
        <div className="flow-card-hero-vignette" />

        <span
          className="flow-card-badge"
          style={{ color: card.badgeText, background: card.accent }}
        >
          {card.badge}
        </span>

        {card.heroDecor}
      </div>

      <div className="flow-card-body">
        <h2 className="flow-card-title">{card.title}</h2>
        <p className="flow-card-subtitle">{card.subtitle}</p>
      </div>
    </button>
  )
}

export default function FlowChoiceScreen({ onSelect }: Props) {
  return (
    <div className="screen flow-choice-screen">
      <header className="flow-choice-header">
        <h1 className="flow-choice-heading">Como deseja continuar?</h1>
        <p className="flow-choice-lead">Toque para continuar</p>
      </header>

      <div className="scroll flow-choice-scroll">
        <div className="flow-choice-list">
          {CARDS.map((card, i) => (
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
          color: var(--accent);
          line-height: 1.15;
        }
        .flow-choice-lead {
          margin: 6px 0 0;
          font-size: 17px;
          color: var(--t3);
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
          flex: 1;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          padding: 0;
          border: none;
          border-radius: 22px;
          overflow: hidden;
          cursor: pointer;
          background: var(--s2);
          box-shadow:
            0 14px 48px rgba(0,0,0,.55),
            inset 0 1px 0 rgba(255,255,255,.06);
          animation: flowCardIn .5s cubic-bezier(.34,1.2,.64,1) both;
        }
        .flow-card--categories {
          border: 1px solid rgba(var(--flow-accent-rgb), .35);
        }
        .flow-card--counter {
          border: 1px solid rgba(232,226,212,.22);
          box-shadow:
            0 14px 48px rgba(0,0,0,.55),
            0 0 40px rgba(232,226,212,.06),
            inset 0 1px 0 rgba(255,255,255,.08);
        }
        .flow-card--preferential {
          border: 1px solid rgba(74,144,217,.4);
          box-shadow:
            0 14px 48px rgba(0,0,0,.55),
            0 0 36px rgba(74,144,217,.12),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .flow-card-hero {
          position: relative;
          flex: 0 0 46%;
          min-height: 128px;
          overflow: hidden;
        }
        .flow-card--counter .flow-card-hero,
        .flow-card--preferential .flow-card-hero {
          flex: 0 0 50%;
          min-height: 140px;
          background: linear-gradient(145deg, #2a3548 0%, #1a1c22 55%, #121214 100%);
        }
        .flow-card--counter .flow-card-hero {
          background: linear-gradient(145deg, #3d3530 0%, #1e1c1a 55%, #121214 100%);
        }
        .flow-card-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.12) contrast(1.05);
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .flow-card-hero-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,.08) 0%,
            rgba(0,0,0,.02) 40%,
            rgba(13,13,14,.55) 100%
          );
          pointer-events: none;
        }
        .flow-card--categories .flow-card-hero-shade {
          background: linear-gradient(
            180deg,
            rgba(200,151,58,.08) 0%,
            transparent 35%,
            rgba(13,13,14,.5) 100%
          );
        }
        .flow-card--counter .flow-card-hero-shade {
          background: linear-gradient(
            112deg,
            rgba(0,0,0,.62) 0%,
            rgba(0,0,0,.28) 32%,
            rgba(0,0,0,.08) 52%,
            rgba(13,13,14,.42) 100%
          );
        }
        .flow-card--counter .flow-card-hero-img {
          filter: saturate(1.22) contrast(1.1) brightness(1.06);
        }
        .flow-card-hero-vignette {
          position: absolute;
          inset: 0;
          box-shadow: inset 0 -40px 50px rgba(13,13,14,.75);
          pointer-events: none;
        }
        .flow-card--counter .flow-card-hero-vignette {
          box-shadow:
            inset 0 -48px 56px rgba(13,13,14,.72),
            inset 0 0 80px rgba(0,0,0,.18);
        }

        .flow-card-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 3;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,.4);
        }
        .flow-card--counter .flow-card-badge {
          top: 12px;
          left: 12px;
          font-size: 13px;
          letter-spacing: 1.4px;
          padding: 6px 13px;
          background: linear-gradient(135deg, #F8F4EA, #E8E2D4);
          color: #1a0f00;
          border: 1px solid rgba(255,255,255,.55);
          box-shadow:
            0 6px 20px rgba(0,0,0,.35),
            inset 0 1px 0 rgba(255,255,255,.65);
        }

        .flow-hero-decor {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .flow-ticket-wrap {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 4;
          animation: flowTicketIn .55s cubic-bezier(.34,1.2,.64,1) .12s both;
        }
        .flow-ticket {
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: visible;
          background: linear-gradient(180deg, #FDFCF9 0%, #F3F0E8 100%);
          color: #1a1a1a;
          box-shadow:
            0 18px 44px rgba(0,0,0,.5),
            0 0 0 1px rgba(255,255,255,.55),
            0 0 0 1px rgba(0,0,0,.04) inset;
          transform: rotate(-3deg);
          max-width: 132px;
        }
        .flow-ticket-body {
          padding: 14px 16px;
          text-align: center;
        }
        .flow-ticket-notch {
          position: absolute;
          top: 50%;
          width: 8px;
          height: 8px;
          margin-top: -4px;
          border-radius: 50%;
          background: #121214;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
        }
        .flow-ticket-notch--left {
          left: -4px;
        }
        .flow-ticket-notch--right {
          right: -4px;
        }
        .flow-ticket-code {
          font-family: var(--font-serif);
          font-size: 36px;
          font-weight: 700;
          color: #1a0f00;
          letter-spacing: 1.5px;
          line-height: 1;
        }

        .flow-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 16px 20px 18px;
          gap: 4px;
          background: linear-gradient(180deg, #161618 0%, #0f0f10 100%);
        }
        .flow-card--categories .flow-card-body {
          border-top: 1px solid rgba(var(--flow-accent-rgb), .2);
        }
        .flow-card--counter .flow-card-body,
        .flow-card--preferential .flow-card-body {
          border-top: 1px solid rgba(232,226,212,.15);
          background: linear-gradient(180deg, #18181a 0%, #0c0c0d 100%);
        }
        .flow-card--preferential .flow-card-body {
          border-top-color: rgba(74,144,217,.22);
        }
        .flow-card--counter .flow-card-title,
        .flow-card--preferential .flow-card-title {
          color: var(--accent);
        }
        .flow-card--preferential .flow-card-title {
          color: #7EB8F0;
        }
        .flow-card-title {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 40px;
          font-weight: 700;
          color: #fff;
          line-height: 1.05;
        }
        .flow-card-subtitle {
          margin: 0;
          font-size: 18px;
          color: rgba(255,255,255,.65);
          line-height: 1.3;
          font-weight: 500;
        }

        .flow-ticket--priority {
          border: 2px solid #4A90D9;
          box-shadow:
            0 18px 44px rgba(0,0,0,.5),
            0 0 24px rgba(74,144,217,.35);
        }
        .flow-ticket-priority-tag {
          position: absolute;
          top: -8px;
          right: 10px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(145deg, #A8D4FF, #4A90D9);
          color: #0a1628;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FDFCF9;
          box-shadow: 0 4px 12px rgba(74,144,217,.5);
        }
        .flow-card--preferential .flow-card-badge {
          background: linear-gradient(135deg, #A8D4FF, #4A90D9);
          color: #0a1628;
          border: 1px solid rgba(255,255,255,.45);
        }
        .flow-card--preferential .flow-card-hero-shade {
          background: linear-gradient(
            112deg,
            rgba(10,22,40,.65) 0%,
            rgba(74,144,217,.12) 40%,
            rgba(13,13,14,.35) 100%
          );
        }

        .flow-card:active .flow-card-hero-img {
          transform: scale(1.06);
        }
        .flow-card:active {
          transform: scale(.988);
        }

        @keyframes flowCardIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes flowTicketIn {
          from { opacity: 0; transform: translateY(calc(-50% + 14px)); }
          to   { opacity: 1; transform: translateY(-50%); }
        }
      `}</style>
    </div>
  )
}
