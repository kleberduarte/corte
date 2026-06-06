import { useState } from 'react'
import { PRODUCTS, CATEGORIES, type Product } from '../../data/products'

type Props = {
  initialFilter?: string
  onProduct: (p: Product) => void
  cartCount: number
  onCart: () => void
  immediate?: boolean
}

export default function CatalogScreen({ initialFilter = 'todos', onProduct, cartCount, onCart, immediate = false }: Props) {
  const [filter, setFilter] = useState(initialFilter)
  const [added, setAdded]   = useState<string | null>(null)

  const visible = filter === 'todos' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)

  function handleAdd(e: React.MouseEvent, p: Product) {
    e.stopPropagation()
    setAdded(p.id)
    setTimeout(() => setAdded(null), 700)
    onProduct(p)
  }

  return (
    <div className="screen screen--catalog" style={{ position: 'relative' }}>
      <div className="catalog-header">
        <div className="catalog-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 600, color: 'var(--accent)' }}>
          Nossos Cortes
        </div>
        <div className="catalog-count" style={{ fontSize: 15, color: 'var(--t3)', marginTop: 3 }}>
          {visible.length} produto{visible.length !== 1 ? 's' : ''} disponíve{visible.length !== 1 ? 'is' : 'l'}
        </div>
      </div>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <div key={c.id} className={`chip${filter === c.id ? ' on' : ''}`} onClick={() => setFilter(c.id)}>
            {c.label}
          </div>
        ))}
      </div>

      <div className={`catalog-scroll scroll${cartCount > 0 ? ' catalog-scroll--fab' : ''}`}>
        <div className="catalog-grid">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              added={added === p.id}
              onClick={() => onProduct(p)}
              onAdd={(e) => handleAdd(e, p)}
            />
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="fab" onClick={onCart} style={{ animation: 'fabIn .35s cubic-bezier(.34,1.2,.64,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="fab-cnt">{cartCount}</div>
            <span className="fab-label">{immediate ? 'Finalizar pedido' : `Agendar corte${cartCount > 1 ? 's' : ''}`}</span>
          </div>
          <span className="fab-hint">🛒 Pagar no caixa</span>
        </div>
      )}

      <style>{`@keyframes fabIn { from { opacity:0; transform:translateY(16px) scale(.95); } to { opacity:1; transform:none; } }`}</style>
    </div>
  )
}

function ProductCard({ product: p, added, onClick, onAdd }: {
  product: Product; added: boolean
  onClick: () => void; onAdd: (e: React.MouseEvent) => void
}) {
  return (
    <div
      className={`product-card${added ? ' product-card--added' : ''}`}
      onClick={onClick}
    >
      <div className="product-card-media">
        <img src={p.imageUrl} alt={p.name} />
        {p.badge && <div className="product-card-badge">{p.badge}</div>}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{p.name}</div>
        <div className="product-card-footer">
          <div className="product-card-price">
            <sup>R$</sup>
            {p.pricePerKg.toFixed(2).replace('.', ',')}
            <sub>/kg</sub>
          </div>
          <div
            className={`product-card-add${added ? ' product-card-add--added' : ''}`}
            onClick={onAdd}
          >
            {added ? '✓' : '+'}
          </div>
        </div>
      </div>
    </div>
  )
}
