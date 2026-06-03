import { useEffect, useRef, useState } from 'react'
import { HERO_SLIDES } from '../../data/products'

type Props = { onStart: () => void }

export default function HomeScreen({ onStart }: Props) {
  const [slide, setSlide]   = useState(0)
  const [clock, setClock]   = useState(new Date())
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const dragStart = useRef<number | null>(null)

  useEffect(() => {
    autoTimer.current = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000)
    const clockTimer  = setInterval(() => setClock(new Date()), 1000)
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current)
      clearInterval(clockTimer)
    }
  }, [])

  function jumpTo(i: number) {
    if (autoTimer.current) clearInterval(autoTimer.current)
    setSlide(i)
    autoTimer.current = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000)
  }

  function onDragStart(x: number) { dragStart.current = x }
  function onDragEnd(x: number) {
    if (dragStart.current === null) return
    const diff = dragStart.current - x
    if (Math.abs(diff) > 40) jumpTo((slide + (diff > 0 ? 1 : HERO_SLIDES.length - 1)) % HERO_SLIDES.length)
    dragStart.current = null
  }

  const s = HERO_SLIDES[slide]
  const timeStr = clock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = clock.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div
      className="screen"
      style={{ position: 'relative' }}
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseUp={(e) => onDragEnd(e.clientX)}
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
    >
      {/* Hero */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Preload todas as imagens e faz crossfade */}
        {HERO_SLIDES.map((sl, i) => (
          <img
            key={i}
            src={sl.imageUrl}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: i === slide ? 1 : 0,
              transition: 'opacity .7s ease',
              zIndex: i === slide ? 1 : 0,
            }}
          />
        ))}

        {/* Overlay escuro */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(13,13,14,.6) 0%, transparent 35%, rgba(13,13,14,.96) 100%)' }} />

        {/* Relógio no topo direito */}
        <div style={{ position: 'absolute', top: 24, right: 24, textAlign: 'right', zIndex: 3 }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: 'white', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{timeStr}</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', marginTop: 3, textTransform: 'capitalize' }}>{dateStr}</div>
        </div>

        {/* Conteúdo hero */}
        <div key={slide} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 28px 64px', zIndex: 3, animation: 'slideUp .4s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 14, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
            background: 'var(--gold)', color: '#1a0f00', marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '.5px',
          }}>{s.badge}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 41, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 8, whiteSpace: 'pre-line' }}>
            {s.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: 'rgba(255,255,255,.7)' }}>
            <span>{s.tag}</span>
            <span style={{ color: 'rgba(255,255,255,.3)' }}>·</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{s.price}</span>
          </div>
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 28, left: 28, display: 'flex', gap: 6, zIndex: 3 }}>
          {HERO_SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); jumpTo(i) }}
              style={{
                width: i === slide ? 22 : 7, height: 7, borderRadius: 4,
                background: i === slide ? 'white' : 'rgba(255,255,255,.35)',
                transition: 'width .3s, background .3s', cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        flexShrink: 0, padding: '24px 32px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        background: 'var(--bg)',
      }}>
        <button
          onClick={onStart}
          style={{
            width: '100%', minHeight: 108, padding: '40px 44px',
            background: 'var(--primary)', color: 'white', border: 'none',
            borderRadius: 'var(--r-xl)', fontFamily: 'var(--font-sans)',
            fontSize: 44, fontWeight: 700, lineHeight: 1.15,
            letterSpacing: '.2px', cursor: 'pointer',
            boxShadow: '0 12px 40px var(--primary-glow)',
            animation: 'totemPulse 2.4s ease-in-out infinite',
          }}
        >
          Toque aqui para iniciar
        </button>
        <p style={{
          fontSize: 19, color: 'var(--t3)', textAlign: 'center',
          lineHeight: 1.5, maxWidth: 320, letterSpacing: '.1px',
        }}>
          Escolha seu corte · personalize · retire sem fila
        </p>
      </div>

      <style>{`
@keyframes slideUp   { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes totemPulse {
          0%,100% { box-shadow: 0 12px 40px var(--primary-glow); }
          50%      { box-shadow: 0 16px 52px rgba(192,39,45,.55), 0 0 0 8px rgba(192,39,45,.12); }
        }
      `}</style>
    </div>
  )
}
