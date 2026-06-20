import { useEffect, useRef, useState } from 'react'
import { useKanbanStore } from '../../store/kanbanStore'
import type { Order } from '../../store/cartStore'
import { useStore } from '../../data/config'
import { isOperatorLoggedIn, logoutOperator } from '../../lib/auth'
import LoginScreen from './LoginScreen'
import { EmptyState } from '../../components/ui/EmptyState'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'

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
  const { orders, moveOrder, resetOrders, startPolling, sessionExpired, clearSessionExpired } = useKanbanStore()
  const store = useStore()
  const toast = useToast()
  const [clock, setClock] = useState(new Date())
  const [loggedIn, setLoggedIn] = useState(isOperatorLoggedIn)
  const prevCount = useRef(0)

  useEffect(() => {
    if (sessionExpired) {
      setLoggedIn(false)
      clearSessionExpired()
      toast.error('Sessão expirada — faça login novamente')
    }
  }, [sessionExpired, clearSessionExpired, toast])

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

  const slotMinutes = (slotTime: string): number => {
    if (slotTime === 'Preferencial' || slotTime === 'Imediata' || slotTime === 'Balcão') return -1
    const match = slotTime.match(/^(\d{2}):(\d{2})$/)
    if (!match) return 9999
    return parseInt(match[1]) * 60 + parseInt(match[2])
  }

  const sortQueue = (list: Order[]) =>
    [...list].sort((a, b) => {
      // 1. Preferencial sempre primeiro
      if (a.priority && !b.priority) return -1
      if (!a.priority && b.priority) return 1
      // 2. Imediata/Balcão logo após preferenciais, antes de agendados
      const aMin = slotMinutes(a.slotTime)
      const bMin = slotMinutes(b.slotTime)
      if (aMin === -1 && bMin !== -1) return -1
      if (aMin !== -1 && bMin === -1) return 1
      // 3. Horário mais próximo primeiro
      if (aMin !== bMin) return aMin - bMin
      // 4. Desempate: quem chegou primeiro
      return a.createdAt.getTime() - b.createdAt.getTime()
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
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px 8px', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>Pedidos do Dia</div>
          <div style={{ fontSize: 10, color: 'var(--t3)' }}>
            {orders.length === 0 ? 'Fila vazia · faça um pedido no totem' : `${orders.length} pedido(s) no total`}
          </div>
        </div>
      </div>

      {/* Colunas */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 12px 0', overflow: 'hidden', minHeight: 0 }}>
        <KanbanCol
          title="Aguardando Corte"
          color="var(--t3)"
          orders={waiting}
          primaryLabel="▶ Iniciar"
          onPrimary={async (o) => {
            const ok = await moveOrder(o.id, 'em_preparo')
            if (!ok) toast.error('Falha ao atualizar pedido — verifique a conexão')
          }}
        />
        <KanbanCol
          title="Em Preparo"
          color="var(--orange)"
          orders={inProg}
          primaryLabel="✓ Pronto"
          onPrimary={async (o) => {
            const ok = await moveOrder(o.id, 'pronto')
            if (ok) toast.success(`Pedido ${o.pickupCode} marcado como pronto`)
            else     toast.error('Falha ao atualizar pedido — verifique a conexão')
          }}
          clock={clock}
        />
        <KanbanCol
          title="Pronto · Aguardando"
          color="var(--green)"
          orders={done}
          primaryLabel="Retirado"
          onPrimary={async (o) => {
            const ok = await moveOrder(o.id, 'retirado')
            if (!ok) toast.error('Falha ao registrar retirada — verifique a conexão')
          }}
          isGreen
        />
      </div>

      {/* Botão Zerar — fixo no canto inferior direito */}
      <button
        type="button"
        onClick={resetOrders}
        title="Zerar fila"
        style={{
          position: 'fixed', bottom: 20, right: 20,
          fontSize: 12, padding: '7px 18px',
          background: 'transparent', color: 'var(--primary)',
          border: '1px solid var(--primary)', borderRadius: 8,
          cursor: 'pointer', opacity: 0.6, transition: 'opacity .2s',
          zIndex: 100,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
      >
        Zerar fila
      </button>
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div className="kanban-col-head">
        <div className="col-dot" style={{ background: color }} />
        <div className="col-name">{title}</div>
        <div className="col-cnt">{orders.length}</div>
      </div>
      <div className="scroll" style={{ flex: 1 }}>
        {orders.length === 0 ? (
          <EmptyState compact title="Vazio" description="Pedidos aparecem aqui" />
        ) : (
          orders.map((o) => (
            <KanbanCard key={o.id} order={o} primaryLabel={primaryLabel} onPrimary={onPrimary} isGreen={isGreen} clock={clock} />
          ))
        )}
      </div>
    </div>
  )
}

function urgencyBar(minutesLeft: number, isPriority: boolean, isGreen: boolean | undefined): { color: string; label: string } {
  if (isGreen)    return { color: 'var(--green)',  label: 'Pronto' }
  if (isPriority) return { color: '#4A90D9',       label: 'Preferencial' }
  if (minutesLeft <= 0)  return { color: 'var(--primary)', label: 'AGORA' }
  if (minutesLeft < 5)   return { color: 'var(--primary)', label: `${minutesLeft} min` }
  if (minutesLeft < 10)  return { color: 'var(--gold)',    label: `${minutesLeft} min` }
  return { color: 'var(--green)', label: `${minutesLeft} min` }
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
  const bar = urgencyBar(minutesLeft, isPriority, isGreen)

  return (
    <div className={`tkc${isPriority ? ' priority' : ''}${minutesLeft < 5 && !isPriority ? ' urgent' : ''}`} style={{ animation: 'tkcIn .45s ease', overflow: 'hidden' }}>
      {/* Barra de urgência no topo */}
      <div style={{ margin: '-14px -14px 12px', height: 5, background: bar.color, borderRadius: '14px 14px 0 0', opacity: 0.85 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--t1)', letterSpacing: 1 }}>
          {order.pickupCode}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isPriority && <Badge variant="blue" size="sm">Preferencial</Badge>}
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
