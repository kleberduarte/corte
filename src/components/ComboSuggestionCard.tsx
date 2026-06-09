import type { Product } from '../data/products'
import type { Suggestion } from '../data/products'

type Props = {
  product: Product
  suggestedProduct: Product
  suggestion: Suggestion
  added: boolean
  onAdd: () => void
  onCustomize: () => void
  onDismiss: () => void
}

export default function ComboSuggestionCard({
  suggestedProduct,
  added,
  onAdd,
  onCustomize,
  onDismiss,
}: Props) {
  const priceText = `R$ ${suggestedProduct.pricePerKg.toFixed(2).replace('.', ',')}/kg`

  if (added) {
    return (
      <div className="combo-suggest combo-suggest--added" role="status" aria-live="polite">
        <div className="combo-suggest-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(52,199,89,.15)', border: '2px solid var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>
              ✓
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--t1)' }}>
              {suggestedProduct.name} adicionado
            </div>
          </div>
          <button
            type="button"
            onClick={onCustomize}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 12,
              border: '1px solid var(--border2)', background: 'var(--s2)',
              color: 'var(--t2)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Ajustar corte ou peso deste item
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="combo-suggest" aria-live="polite">
      <div className="combo-suggest-inner">
        <div className="combo-suggest-row">
          <div className="combo-suggest-thumb">
            <img src={suggestedProduct.imageUrl} alt={suggestedProduct.name} />
          </div>
          <div className="combo-suggest-info">
            <div className="combo-suggest-name">{suggestedProduct.name}</div>
            <div className="combo-suggest-price">{priceText}</div>
          </div>
          <button type="button" className="combo-suggest-btn" onClick={onAdd}>
            + Levar também
          </button>
        </div>
        <button type="button" className="combo-suggest-skip" onClick={onDismiss}>
          Não, obrigado
        </button>
      </div>
    </div>
  )
}
