import CartOrderPanel from '../../components/CartOrderPanel'
import type { CartItem } from '../../store/cartStore'

type Props = {
  items: CartItem[]
  immediate?: boolean
  onAddMore: () => void
  onContinue: () => void
}

export default function CartScreen({ items, immediate = false, onAddMore, onContinue }: Props) {
  const count = items.length

  return (
    <div className="screen screen--cart">
      <div className="cart-header">
        <div className="cart-title">Seu pedido</div>
        <div className="cart-lead">
          {count === 1
            ? '1 corte selecionado · você pode adicionar mais itens antes de continuar'
            : `${count} cortes no pedido · confira tudo antes de continuar`}
        </div>
        <div className="cart-count-badge">
          <span className="cart-count-num">{count}</span>
          <span className="cart-count-label">{count === 1 ? 'item' : 'itens'}</span>
        </div>
      </div>

      <div className="cart-body">
        <CartOrderPanel items={items} variant="full" />
      </div>

      <div className="cart-checkout">
        <div className="cart-pay-note">
          <span className="cart-pay-icon">🛒</span>
          <span>
            <strong>Pagamento no caixa.</strong> O peso exato é definido na hora — preço final no caixa do mercado.
          </span>
        </div>

        <button type="button" className="btn-secondary cart-add-btn" onClick={onAddMore}>
          ➕ Adicionar mais cortes
        </button>

        <button type="button" className="btn-primary cart-continue-btn" onClick={onContinue}>
          {immediate ? '⚡ Continuar pedido' : '📅 Continuar para agendamento'}
        </button>
      </div>
    </div>
  )
}
