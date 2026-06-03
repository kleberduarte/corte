import type { ReactNode } from 'react'
import { CATEGORY_CARDS } from '../../data/products'

export type FlowChoice = 'categories' | 'counter'

type Props = {
  onSelect: (choice: FlowChoice) => void
}

type FlowCard = {
  choice: FlowChoice
  badge: string
  title: string
  subtitle: string
  hint: string
  features: { icon: string; label: string }[]
  imageUrl: string
  imagePosition: string
  accent: string
  accentRgb: string
  badgeText: string
  heroDecor: ReactNode
}

const CATEGORY_PREVIEW = CATEGORY_CARDS.filter((c) => !c.wide).slice(0, 4)
const FEATURED_MEAT = CATEGORY_CARDS.find((c) => c.featured)!

function CategoryHeroDecor() {
  return (
    <div className="flow-hero-decor flow-hero-decor--categories">
      <div className="flow-thumb-strip">
        {CATEGORY_PREVIEW.map((cat, i) => (
          <div
            key={cat.id}
            className="flow-thumb"
            style={{ animationDelay: `${0.12 + i * 0.06}s` }}
            title={cat.name}
          >
            <img src={cat.imageUrl} alt="" />
            <span className="flow-thumb-label">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CounterHeroDecor() {
  return (
    <div className="flow-hero-decor flow-hero-decor--counter">
      <div className="flow-counter-scene" aria-hidden>
        <span className="flow-counter-scene-glow" />
        <span className="flow-counter-scene-fade" />
      </div>
      <ol className="flow-counter-steps" aria-hidden>
        <li><span>1</span> Imprimir</li>
        <li className="flow-counter-steps-arrow" aria-hidden>→</li>
        <li><span>2</span> Balcão</li>
      </ol>
      <div className="flow-ticket-wrap">
        <div className="flow-ticket">
          <div className="flow-ticket-body">
            <div className="flow-ticket-brand">CORTE</div>
            <div className="flow-ticket-label">Sua senha</div>
            <div className="flow-ticket-code">A-4821</div>
            <div className="flow-ticket-hint">Apresente no balcão</div>
          </div>
          <div className="flow-ticket-barcode" aria-hidden>
            {Array.from({ length: 22 }).map((_, i) => (
              <span key={i} style={{ height: 10 + (i % 4) * 3, opacity: 0.4 + (i % 3) * 0.18 }} />
            ))}
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
    badge: 'Experiência completa',
    title: 'Seguir Categorias',
    subtitle: 'Navegue pelo cardápio, escolha corte e peso, e finalize no totem',
    hint: 'Corte · peso · retirada',
    features: [
      { icon: '◫', label: '8 categorias' },
      { icon: '✦', label: 'Cortes sob medida' },
      { icon: '◷', label: 'Agende ou retire já' },
    ],
    imageUrl: FEATURED_MEAT.imageUrl,
    imagePosition: 'center 38%',
    accent: 'var(--gold)',
    accentRgb: '200,151,58',
    badgeText: '#1a0f00',
    heroDecor: <CategoryHeroDecor />,
  },
  {
    choice: 'counter',
    badge: 'Atendimento de balcão',
    title: 'Dirigir-se ao balcão',
    subtitle: 'Imprima sua senha e seja atendido pelo açougueiro na hora',
    hint: 'Comprovante na impressora',
    features: [
      { icon: 'ticket', label: 'Senha na hora' },
      { icon: 'fast', label: 'Sem fila no totem' },
      { icon: 'chef', label: 'Especialista no balcão' },
    ],
    imageUrl: FEATURED_MEAT.imageUrl.replace('w=900&h=500', 'w=1200&h=700'),
    imagePosition: '42% center',
    accent: '#E8E2D4',
    accentRgb: '232,226,212',
    badgeText: '#0d0d0e',
    heroDecor: <CounterHeroDecor />,
  },
]

const COUNTER_IMG_FALLBACK =
  'https://images.unsplash.com/photo-1590507385303-b25eca128cc6?w=1200&h=700&fit=crop&q=90'

function FeatureIcon({ type }: { type: string }) {
  if (type === 'ticket') {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M9 6v12M15 6v12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    )
  }
  if (type === 'fast') {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M13 3L5 14h6l-1 7 9-13h-6l1-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'chef') {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3c-2 0-3.5 1.5-3.5 3.5S10 10 12 10s3.5-1.5 3.5-3.5S14 3 12 3z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 10h12v2c0 3-2.5 5-6 5s-6-2-6-5v-2z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }
  return <span>{type}</span>
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
  const isCategories = card.choice === 'categories'
  const isCounter = card.choice === 'counter'

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
            if (isCounter) (e.currentTarget as HTMLImageElement).src = COUNTER_IMG_FALLBACK
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

        <ul className="flow-card-features">
          {card.features.map((f) => (
            <li key={f.label}>
              <span className="flow-feature-icon" aria-hidden>
                {isCounter ? <FeatureIcon type={f.icon} /> : f.icon}
              </span>
              {f.label}
            </li>
          ))}
        </ul>

        <div className="flow-card-footer">
          <span className="flow-card-hint">{card.hint}</span>
          <span
            className={`flow-card-cta ${isCategories ? 'flow-card-cta--gold' : ''} ${isCounter ? 'flow-card-cta--counter' : ''}`}
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </button>
  )
}

export default function FlowChoiceScreen({ onSelect }: Props) {
  return (
    <div className="screen flow-choice-screen">
      <header className="flow-choice-header">
        <h1 className="flow-choice-heading">Como deseja continuar?</h1>
        <p className="flow-choice-lead">Toque na experiência que combina com você</p>
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
          font-size: calc(28px * var(--font-scale));
          font-weight: 700;
          color: var(--accent);
          line-height: 1.15;
        }
        .flow-choice-lead {
          margin: 6px 0 0;
          font-size: calc(13px * var(--font-scale));
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
          min-height: 268px;
          display: flex;
          flex-direction: column;
          padding: 0;
          border: none;
          border-radius: 22px;
          overflow: hidden;
          cursor: pointer;
          text-align: left;
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

        .flow-card-hero {
          position: relative;
          flex: 0 0 46%;
          min-height: 128px;
          overflow: hidden;
        }
        .flow-card--counter .flow-card-hero {
          flex: 0 0 54%;
          min-height: 158px;
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
          font-size: calc(9.5px * var(--font-scale));
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
          font-size: calc(8.5px * var(--font-scale));
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

        .flow-thumb-strip {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          justify-content: flex-start;
        }
        .flow-thumb {
          flex: 1;
          max-width: 72px;
          min-width: 0;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,.28);
          box-shadow: 0 8px 22px rgba(0,0,0,.55);
          background: #0d0d0e;
          animation: flowThumbIn .5s ease both;
        }
        .flow-thumb img {
          display: block;
          width: 100%;
          height: 52px;
          object-fit: cover;
        }
        .flow-thumb-label {
          display: block;
          font-size: calc(8px * var(--font-scale));
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .4px;
          color: rgba(255,255,255,.85);
          padding: 4px 5px 5px;
          text-align: center;
          background: linear-gradient(180deg, rgba(13,13,14,.2), rgba(13,13,14,.92));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .flow-hero-decor--counter {
          display: block;
          padding: 0;
        }
        .flow-counter-scene {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .flow-counter-scene-glow {
          position: absolute;
          bottom: 12%;
          right: 10%;
          width: 48%;
          height: 65%;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(245,240,230,.16) 0%, transparent 70%);
        }
        .flow-counter-scene-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 42%,
            rgba(13,13,14,.12) 68%,
            rgba(13,13,14,.28) 100%
          );
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
        .flow-ticket-barcode {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 2px;
          padding: 8px 12px 10px;
          border-top: 1px dashed rgba(0,0,0,.1);
          background: rgba(240,236,228,.65);
        }
        .flow-ticket-barcode span {
          display: block;
          width: 2px;
          min-height: 8px;
          background: #1a1a1a;
          border-radius: 1px;
        }
        .flow-ticket-body {
          padding: 12px 14px 10px;
          text-align: center;
        }
        .flow-ticket-brand {
          font-size: calc(7px * var(--font-scale));
          font-weight: 800;
          letter-spacing: 2.2px;
          color: #a08040;
          margin-bottom: 4px;
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
        .flow-ticket-label {
          font-size: calc(7px * var(--font-scale));
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 2px;
        }
        .flow-ticket-code {
          font-family: var(--font-serif);
          font-size: calc(26px * var(--font-scale));
          font-weight: 700;
          color: #1a0f00;
          letter-spacing: 1.5px;
          line-height: 1;
        }
        .flow-ticket-hint {
          font-size: calc(8.5px * var(--font-scale));
          font-weight: 600;
          color: #666;
          margin-top: 5px;
        }
        .flow-counter-steps {
          position: absolute;
          left: 12px;
          bottom: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 3;
        }
        .flow-counter-steps li {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: calc(10px * var(--font-scale));
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #1a0f00;
          padding: 7px 12px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(248,244,234,.96), rgba(232,226,212,.94));
          border: 1px solid rgba(255,255,255,.55);
          box-shadow:
            0 8px 24px rgba(0,0,0,.35),
            inset 0 1px 0 rgba(255,255,255,.6);
          backdrop-filter: blur(10px);
        }
        .flow-counter-steps li span {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: calc(10px * var(--font-scale));
          font-weight: 800;
          background: #1a0f00;
          color: #F5F0E6;
          flex-shrink: 0;
        }
        .flow-counter-steps-arrow {
          padding: 0 !important;
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          font-size: calc(13px * var(--font-scale)) !important;
          color: rgba(245,240,230,.85) !important;
          font-weight: 400 !important;
          letter-spacing: 0 !important;
        }

        .flow-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px 18px 18px;
          background: linear-gradient(180deg, #161618 0%, #0f0f10 100%);
        }
        .flow-card--categories .flow-card-body {
          border-top: 1px solid rgba(var(--flow-accent-rgb), .2);
        }
        .flow-card--counter .flow-card-body {
          border-top: 1px solid rgba(232,226,212,.15);
          background: linear-gradient(180deg, #18181a 0%, #0c0c0d 100%);
        }
        .flow-card--counter .flow-card-title {
          color: var(--accent);
        }
        .flow-card--counter .flow-card-features li {
          color: rgba(245,237,219,.82);
        }
        .flow-card--counter .flow-feature-icon {
          width: 22px;
          height: 22px;
          background: rgba(232,226,212,.1);
          border-color: rgba(232,226,212,.28);
          color: var(--accent);
        }
        .flow-card-title {
          margin: 0 0 6px;
          font-family: var(--font-serif);
          font-size: calc(26px * var(--font-scale));
          font-weight: 700;
          color: #fff;
          line-height: 1.08;
        }
        .flow-card-subtitle {
          margin: 0 0 12px;
          font-size: calc(13px * var(--font-scale));
          color: rgba(255,255,255,.72);
          line-height: 1.45;
          font-weight: 500;
        }
        .flow-card-features {
          list-style: none;
          margin: 0 0 14px;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
        }
        .flow-card-features li {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: calc(11px * var(--font-scale));
          font-weight: 600;
          color: rgba(255,255,255,.65);
        }
        .flow-card--categories .flow-card-features li {
          color: rgba(245,237,219,.8);
        }
        .flow-feature-icon {
          font-size: calc(10px * var(--font-scale));
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          flex-shrink: 0;
        }
        .flow-card--categories .flow-feature-icon {
          background: rgba(var(--flow-accent-rgb), .15);
          border-color: rgba(var(--flow-accent-rgb), .35);
          color: var(--flow-accent);
        }

        .flow-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,.08);
        }
        .flow-card--categories .flow-card-footer {
          border-top-color: rgba(var(--flow-accent-rgb), .18);
        }
        .flow-card-hint {
          font-size: calc(12px * var(--font-scale));
          font-weight: 600;
          color: rgba(255,255,255,.45);
        }
        .flow-card-cta {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: calc(18px * var(--font-scale));
          color: #fff;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(8px);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .flow-card-cta--gold {
          color: #1a0f00;
          background: linear-gradient(145deg, var(--gold), #e8b85a);
          border: none;
          box-shadow: 0 4px 22px rgba(200,151,58,.45);
        }
        .flow-card-cta--counter {
          color: #1a0f00;
          background: linear-gradient(145deg, #F5F0E6, #D4C9B0);
          border: 1px solid rgba(255,255,255,.35);
          box-shadow: 0 4px 24px rgba(232,226,212,.25);
        }
        .flow-card--counter .flow-card-footer {
          border-top-color: rgba(232,226,212,.12);
        }

        .flow-card:active .flow-card-hero-img {
          transform: scale(1.06);
        }
        .flow-card:active {
          transform: scale(.988);
        }
        .flow-card:active .flow-card-cta {
          transform: scale(1.1);
        }

        @keyframes flowCardIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes flowThumbIn {
          from { opacity: 0; transform: translateY(10px); }
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
