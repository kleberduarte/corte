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
  product,
  suggestedProduct,
  suggestion,
  added,
  onAdd,
  onCustomize,
  onDismiss,
}: Props) {
  const firstName = product.name.split(' ')[0]
  const priceText = `R$ ${suggestedProduct.pricePerKg.toFixed(2).replace('.', ',')}/kg`

  if (added) {
    return (
      <div
        className="combo-suggest"
        style={{ margin: '0 24px 20px' }}
        role="status"
        aria-live="polite"
      >
        <div className="combo-suggest-inner" style={{ padding: '16px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(52,199,89,.15)', border: '2px solid var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
                {suggestedProduct.name} adicionado!
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                Mesmo horário e peso do seu pedido principal.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCustomize}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 12,
              border: '1px solid var(--border2)', background: 'var(--s2)',
              color: 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
    <div className="combo-suggest" style={{ margin: '0 24px 20px' }} aria-live="polite">
      <div className="combo-suggest-inner">
        <div className="combo-suggest-badge">{suggestion.badge}</div>
        <div className="combo-suggest-hook">{suggestion.hook}</div>
        <p className="combo-suggest-msg">{suggestion.message}</p>
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
          Só o {firstName} por agora, obrigado
        </button>
      </div>
    </div>
  )
}
