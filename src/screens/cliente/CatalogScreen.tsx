import { useState } from 'react'
import { useCatalog } from '../../data/catalog'
import type { Product } from '../../data/products'

type Props = {
  initialFilter?: string
  onProduct: (p: Product) => void
  cartCount: number
  onCart: () => void
  immediate?: boolean
}

export default function CatalogScreen({ initialFilter = 'todos', onProduct, cartCount, onCart, immediate = false }: Props) {
  const { products, categories } = useCatalog()
  const [filter, setFilter] = useState(initialFilter)
  const [added, setAdded]   = useState<string | null>(null)

  const visible = filter === 'todos' ? products : products.filter((p) => p.category === filter)

  function handleAdd(e: React.MouseEvent, p: Product) {
    e.stopPropagation()
    setAdded(p.id)
    setTimeout(() => setAdded(null), 700)
    onProduct(p)
  }

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div style={{ flexShrink: 0, padding: '8px 24px 10px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'calc(28px * var(--font-scale))', fontWeight: 600, color: 'var(--accent)' }}>
          Nossos Cortes
        </div>
        <div style={{ fontSize: 'calc(12px * var(--font-scale))', color: 'var(--t3)', marginTop: 3 }}>{visible.length} produto{visible.length !== 1 ? 's' : ''} disponíve{visible.length !== 1 ? 'is' : 'l'}</div>
      </div>

      <div className="chips">
        {categories.map((c) => (
          <div key={c.id} className={`chip${filter === c.id ? ' on' : ''}`} onClick={() => setFilter(c.id)}>
            {c.label}
          </div>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, paddingBottom: cartCount > 0 ? 100 : 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 24px' }}>
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
      onClick={onClick}
      style={{
        background: 'var(--s1)', borderRadius: 'var(--r)',
        border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`,
        overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color .25s, box-shadow .25s',
        boxShadow: added ? '0 0 0 2px rgba(52,199,89,.25)' : 'none',
      }}
    >
      <div style={{ width: '100%', height: 140, position: 'relative', background: 'var(--s3)', overflow: 'hidden' }}>
        <img
          src={p.imageUrl} alt={p.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 42%', display: 'block', transition: 'transform .4s' }}
        />
        {p.badge && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', color: 'var(--t1)', fontSize: 'calc(9.5px * var(--font-scale))', fontWeight: 600, padding: '3px 7px', borderRadius: 20, border: '1px solid rgba(255,255,255,.1)' }}>
            {p.badge}
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 'calc(15px * var(--font-scale))', fontWeight: 600, color: 'var(--t1)', marginBottom: 3 }}>{p.name}</div>
          <div style={{ fontSize: 'calc(11.5px * var(--font-scale))', color: 'var(--t3)', lineHeight: 1.45, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.description}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 'calc(16px * var(--font-scale))', fontWeight: 700, color: 'var(--accent)' }}>
              <sup style={{ fontSize: 'calc(11px * var(--font-scale))', fontWeight: 600 }}>R$</sup>
              {p.pricePerKg.toFixed(2).replace('.', ',')}
              <sub style={{ fontSize: 'calc(11px * var(--font-scale))', fontWeight: 400, color: 'var(--t3)' }}>/kg</sub>
            </div>
            <div className="stars" style={{ fontSize: 'calc(10.5px * var(--font-scale))', display: 'flex', alignItems: 'center', gap: 3 }}>
              {'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}
              <span style={{ color: 'var(--t3)' }}>({p.reviews})</span>
            </div>
          </div>
          <div
            onClick={onAdd}
            style={{
              width: 36, height: 36,
              background: added ? 'var(--green)' : 'var(--primary)',
              borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: added ? 18 : 22, color: 'white', flexShrink: 0,
              boxShadow: `0 3px 10px ${added ? 'rgba(52,199,89,.35)' : 'var(--primary-glow)'}`,
              transition: 'background .25s, box-shadow .25s, transform .15s',
              transform: added ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {added ? '✓' : '+'}
          </div>
        </div>
      </div>
    </div>
  )
}
