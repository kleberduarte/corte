import { useEffect, useRef, useState } from 'react'
import { useKanbanStore } from '../../store/kanbanStore'
import type { Order } from '../../store/cartStore'
import { useStore } from '../../data/config'
import { isOperatorLoggedIn, logoutOperator } from '../../lib/auth'
import LoginScreen from './LoginScreen'

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(); osc.stop(ctx.currentTime + 0.35)
  } catch { /* silently ignore if AudioContext not available */ }
}

export default function KanbanScreen() {
  const { orders, moveOrder, resetOrders, startPolling } = useKanbanStore()
  const store = useStore()
  const [clock, setClock] = useState(new Date())
  const [loggedIn, setLoggedIn] = useState(isOperatorLoggedIn)
  const prevCount = useRef(0)

  useEffect(() => {
    if (orders.length > prevCount.current) beep()
    prevCount.current = orders.length
  }, [orders.length])

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Inicia polling quando logado — atualiza pedidos a cada 10 segundos
  useEffect(() => {
    if (!loggedIn) return
    return startPolling(10_000)
  }, [loggedIn, startPolling])

  if (!loggedIn) {
    return <LoginScreen onSuccess={() => setLoggedIn(true)} />
  }

  const sortQueue = (list: Order[]) =>
    [...list].sort((a, b) => {
      if (a.priority && !b.priority) return -1
      if (!a.priority && b.priority) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

  const waiting = sortQueue(orders.filter((o) => o.status === 'aguardando'))
  const inProg = sortQueue(orders.filter((o) => o.status === 'em_preparo'))
  const done = orders.filter((o) => o.status === 'pronto')
  const urgent = orders.filter((o) => {
    if (o.priority && o.status !== 'pronto' && o.status !== 'retirado') return true
    const diff = (new Date(`1970-01-01T${o.slotTime}:00`).getTime() - clock.getTime() + 8.64e7) % 8.64e7
    return diff < 10 * 60 * 1000 && o.status !== 'pronto'
  })

  const timeStr = clock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = clock.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })

  return (
    <div className="kanban-screen">
      {/* Top bar */}
      <div style={{ flexShrink: 0, height: 'auto', minHeight: 52, display: 'flex', alignItems: 'center', padding: '10px 16px', gap: 12, background: 'var(--s1)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(145deg, var(--primary-dark), var(--primary))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🔪</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2 }}>CORTE</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', padding: '4px 10px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 20 }}>
          {store.name}
        </div>
        <div style={{ flex: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)' }}>{timeStr}</div>
          <div style={{ fontSize: 10, color: 'var(--t3)' }}>{dateStr}</div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--s2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, position: 'relative', cursor: 'pointer' }}>
          🔔
          {orders.length > 0 && (
            <div style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--primary)', fontSize: 8, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {orders.length}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>👤</div>
          <button
            onClick={() => { logoutOperator(); setLoggedIn(false) }}
            style={{ fontSize: 11, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}
            title="Sair"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, padding: '8px 12px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <MetricCard color="var(--t4)" value={waiting.length} label="Aguardando" />
        <MetricCard color="var(--orange)" value={inProg.length} label="Em preparo" />
        <MetricCard color="var(--green)" value={done.length} label="Prontos" />
        <MetricCard color="var(--blue)" value={orders.length} label="Total hoje" />
        <MetricCard color="var(--primary)" value={urgent.length} label="Urgente" pulse />
      </div>

      {/* Kanban header */}
      <div className="kanban-kb-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>Pedidos do Dia</div>
          <div style={{ fontSize: 10, color: 'var(--t3)' }}>
            {orders.length === 0 ? 'Fila vazia · faça um pedido no totem' : `${orders.length} pedido(s) no total`}
          </div>
        </div>
      </div>

      <div className="kanban-cols">
        <KanbanCol
          title="Aguardando Corte"
          color="var(--t3)"
          orders={waiting}
          primaryLabel="▶ Iniciar"
          onPrimary={(o) => moveOrder(o.id, 'em_preparo')}
        />
        <KanbanCol
          title="Em Preparo"
          color="var(--orange)"
          orders={inProg}
          primaryLabel="✓ Pronto"
          onPrimary={(o) => moveOrder(o.id, 'pronto')}
          clock={clock}
        />
        <KanbanCol
          title="Pronto · Aguardando"
          color="var(--green)"
          orders={done}
          primaryLabel="Retirado"
          onPrimary={(o) => moveOrder(o.id, 'retirado')}
          isGreen
        />
      </div>

      <div className="kanban-dock">
        <button
          type="button"
          className="kanban-dock-btn primary"
          onClick={() => { const next = waiting[0]; if (next) moveOrder(next.id, 'em_preparo') }}
          disabled={waiting.length === 0}
        >
          ▶ Iniciar próximo
        </button>
        <button
          type="button"
          className="kanban-dock-btn secondary"
          onClick={resetOrders}
          title="Zerar fila"
        >
          ↺
        </button>
      </div>
    </div>
  )
}

function MetricCard({ color, value, label, pulse }: { color: string; value: number; label: string; pulse?: boolean }) {
  return (
    <div style={{ background: 'var(--s2)', border: `1px solid ${pulse && value > 0 ? 'rgba(192,39,45,.3)' : 'var(--border)'}`, borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, animation: pulse && value > 0 ? 'pulse 1.5s infinite' : undefined }} />
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: pulse && value > 0 ? 'var(--primary)' : 'var(--t1)' }}>{value}</div>
        <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 1 }}>{label}</div>
      </div>
    </div>
  )
}

function KanbanCol({ title, color, orders, primaryLabel, onPrimary, isGreen, clock }: {
  title: string; color: string; orders: Order[]
  primaryLabel: string; onPrimary: (o: Order) => void
  isGreen?: boolean; clock?: Date
}) {
  return (
    <div className="kanban-col">
      <div className="kanban-col-head">
        <div className="col-dot" style={{ background: color }} />
        <div className="col-name">{title}</div>
        <div className="col-cnt">{orders.length}</div>
      </div>
      <div className="scroll">
        {orders.length === 0 ? (
          <div className="empty-col"><strong>Vazio</strong><br />Pedidos aparecem aqui</div>
        ) : (
          orders.map((o) => (
            <KanbanCard key={o.id} order={o} primaryLabel={primaryLabel} onPrimary={onPrimary} isGreen={isGreen} clock={clock} />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanCard({ order, primaryLabel, onPrimary, isGreen, clock }: {
  order: Order; primaryLabel: string; onPrimary: (o: Order) => void; isGreen?: boolean; clock?: Date
}) {
  const minutesLeft = clock
    ? Math.round((new Date(`1970-01-01T${order.slotTime}:00`).getTime() - clock.getTime() % 86400000) / 60000)
    : 99

  const timerClass = minutesLeft < 5 ? 'timer-urg' : minutesLeft < 10 ? 'timer-warn' : 'timer-ok'
  const timerLabel = minutesLeft > 0 ? `${minutesLeft}min` : 'AGORA'

  const isPriority = order.priority || order.slotTime === 'Preferencial'

  return (
    <div className={`tkc${isPriority ? ' priority' : ''}${minutesLeft < 5 && !isPriority ? ' urgent' : ''}`} style={{ animation: 'tkcIn .45s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--t1)', letterSpacing: 1 }}>
          {order.pickupCode}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isPriority && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', padding: '3px 7px', borderRadius: 6, background: 'rgba(74,144,217,.2)', color: '#7eb8f0', border: '1px solid rgba(74,144,217,.45)' }}>
              Preferencial
            </span>
          )}
          {clock && !isPriority && <div className={`timer-badge ${timerClass}`}>{timerLabel}</div>}
        </div>
      </div>
      {order.items.length === 0 ? (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 8, lineHeight: 1.4 }}>
          {isPriority ? 'Atendimento preferencial no balcão' : 'Atendimento no balcão'}
        </div>
      ) : order.items.map((item, idx) => (
        <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: idx < order.items.length - 1 ? 6 : 8 }}>
          <img src={item.product.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{item.product.name}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{item.cutType.name} · ~{item.weightKg}kg</div>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 9px', background: 'var(--s3)', borderRadius: 9, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--t3)' }}>🕐 {order.slotTime}</span>
        {order.items.length > 1 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)' }}>{order.items.length} itens</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className={`tkca ${isGreen ? 'green' : 'primary'}`} onClick={() => onPrimary(order)}>
          {primaryLabel}
        </button>
        <button className="tkca secondary">Detalhes</button>
      </div>
    </div>
  )
}
