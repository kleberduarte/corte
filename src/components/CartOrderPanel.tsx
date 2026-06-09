import type { CartItem } from '../store/cartStore'

type Props = {
  items: CartItem[]
  variant?: 'compact' | 'full'
  showTotal?: boolean
}

function formatWeight(kg: number) {
  return kg % 1 === 0 ? `${kg.toFixed(0)} kg` : `${kg.toFixed(1).replace('.', ',')} kg`
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CartOrderPanel({ items, variant = 'full', showTotal = true }: Props) {
  const total = items.reduce((sum, i) => sum + i.estimatedPrice, 0)

  return (
    <div className={`cart-panel cart-panel--${variant}`}>
      <div className="cart-panel-list">
        {items.map((item, index) => (
          <div key={item.product.id} className="cart-panel-item">
            <div className="cart-panel-item-index">{index + 1}</div>
            <img src={item.product.imageUrl} alt={item.product.name} className="cart-panel-item-img" />
            <div className="cart-panel-item-body">
              <div className="cart-panel-item-name">{item.product.name}</div>
              <div className="cart-panel-item-meta">
                <span className="cart-panel-item-cut">{item.cutType.name}</span>
                <span className="cart-panel-item-sep">·</span>
                <span className="cart-panel-item-weight">{formatWeight(item.weightKg)}</span>
              </div>
              <div className="cart-panel-item-price">~{formatPrice(item.estimatedPrice)}</div>
            </div>
          </div>
        ))}
      </div>

      {showTotal && items.length > 0 && (
        <div className="cart-panel-total">
          <span className="cart-panel-total-label">
            {items.length === 1 ? 'Estimativa do pedido' : `Total · ${items.length} itens`}
          </span>
          <span className="cart-panel-total-val">~{formatPrice(total)}</span>
        </div>
      )}
    </div>
  )
}
