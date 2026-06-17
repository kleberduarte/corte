import { useEffect, useState } from 'react'
import { useStore } from '../../data/config'
import { BOARD_POLL_MS, useBoardStore, type BoardOrder } from '../../store/boardStore'

function useTenantLogo() {
  return document.documentElement.dataset.logoUrl ?? ''
}

function BoardOrderList({
  orders,
  variant,
  emptyLabel,
  tickKey,
}: {
  orders: BoardOrder[]
  variant: 'waiting' | 'preparing' | 'ready'
  emptyLabel: string
  tickKey: number
}) {
  if (orders.length === 0) {
    return <div className="board-empty">{emptyLabel}</div>
  }

  return (
    <div className="board-esteira" key={tickKey}>
      {orders.map((order, idx) => {
        const isHighlight = idx === orders.length - 1
        return (
          <div key={order.pickupCode} className="board-slot">
            <div
              className={[
                'board-number',
                variant === 'ready' ? 'board-number--ready' : '',
                variant === 'waiting' ? 'board-number--waiting' : '',
                isHighlight ? 'board-number--highlight' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {order.pickupCode}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OrdersBoardScreen() {
  const store = useStore()
  const logoUrl = useTenantLogo()
  const { board, tick, startPolling } = useBoardStore()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => startPolling(store.id), [store.id, startPolling])

  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="board-shell">
      <header className="board-header">
        <div className="board-brand">
          {logoUrl ? (
            <img src={logoUrl} alt={store.name} className="board-brand-logo" />
          ) : (
            <div className="board-brand-icon">🔪</div>
          )}
          <div>
            <div className="board-brand-name">CORTE</div>
            <div className="board-brand-sub">{store.name}</div>
          </div>
        </div>
        <div className="board-clock">{timeStr}</div>
      </header>

      <div className="board-title-bar">Acompanhe o número do seu pedido</div>

      <div className="board-columns">
        <section className="board-col board-col--waiting">
          <div className="board-col-header">🕐 Aguardando</div>
          <div className="board-col-body">
            <BoardOrderList
              orders={board.waiting}
              variant="waiting"
              emptyLabel="Nenhum pedido na fila"
              tickKey={tick}
            />
          </div>
        </section>

        <section className="board-col board-col--preparing">
          <div className="board-col-header">⏳ Preparando</div>
          <div className="board-col-body">
            <BoardOrderList
              orders={board.preparing}
              variant="preparing"
              emptyLabel="Nenhum pedido em preparo"
              tickKey={tick}
            />
          </div>
        </section>

        <section className="board-col board-col--ready">
          <div className="board-col-header">✅ Pronto</div>
          <div className="board-col-body">
            <BoardOrderList
              orders={board.ready}
              variant="ready"
              emptyLabel="Aguardando pedidos prontos"
              tickKey={tick}
            />
          </div>
        </section>
      </div>

      <div className="board-banner">
        Carnes selecionadas · Atendimento com qualidade
      </div>

      <footer className="board-footer">
        <div className="board-status">
          <div className="board-status-dot" />
          <span>Painel ao vivo</span>
        </div>
        <span className="board-footer-hint">Atualização a cada {BOARD_POLL_MS / 1000}s</span>
      </footer>
    </div>
  )
}
