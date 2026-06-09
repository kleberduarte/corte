import { useState } from 'react'
import type { Product, CutType } from '../../data/products'
import { PRODUCTS, SUGGESTIONS } from '../../data/products'
import { getTodaySlots } from '../../data/slots'
import { useStore } from '../../data/config'
import type { CartItem } from '../../store/cartStore'
import CartOrderPanel from '../../components/CartOrderPanel'
import ComboSuggestionCard from '../../components/ComboSuggestionCard'

const DISMISS_KEY = 'corte_combo_dismissed'

function isDismissed(productId: string) {
  try {
    return sessionStorage.getItem(`${DISMISS_KEY}_${productId}`) === '1'
  } catch {
    return false
  }
}

function dismissSuggestion(productId: string) {
  try {
    sessionStorage.setItem(`${DISMISS_KEY}_${productId}`, '1')
  } catch { /* ignore */ }
}

type Props = {
  product: Product
  cutType: CutType
  weightKg: number
  cartItems: CartItem[]
  onConfirm: (slotTime: string, weightKg: number) => void
  onAddCombo: (product: Product) => void
  onCustomizeCombo: (product: Product) => void
  onAddMore: () => void
}

const WEIGHT_PRESETS = [0.5, 1, 1.5, 2, 3]

export default function ScheduleScreen({
  product,
  cutType: _cutType,
  weightKg: initialWeight,
  cartItems,
  onConfirm,
  onAddCombo,
  onCustomizeCombo,
  onAddMore,
}: Props) {
  const store = useStore()
  const slots = getTodaySlots(store)
  const firstAvail = slots.find((s) => s.available)
  const [selectedSlot, setSelectedSlot] = useState(firstAvail?.time ?? '')
  const [weight, setWeight] = useState(initialWeight)
  const [dismissed, setDismissed] = useState(() => isDismissed(product.id))

  const suggestion = SUGGESTIONS[product.id]
  const suggestedProduct = suggestion ? PRODUCTS.find((p) => p.id === suggestion.productId) : null
  const comboInCart = suggestedProduct
    ? cartItems.some((i) => i.product.id === suggestedProduct.id)
    : false
  const showSuggestion = !!suggestedProduct && !!suggestion && !dismissed && !comboInCart

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const totalEstimate = cartItems.reduce((sum, i) => sum + i.estimatedPrice, 0)
  const weightLabel = weight < 1 ? `${weight * 1000}g` : `${weight}kg`

  function handleDismiss() {
    dismissSuggestion(product.id)
    setDismissed(true)
  }

  return (
    <div className="screen screen--schedule">
      <div className="schedule-header">
        <div className="schedule-title">Agendar retirada</div>
        <div className="schedule-lead">Escolha o peso e o horário para buscar hoje</div>
      </div>

      <div className="schedule-body">
        <div className="schedule-cart">
          <div className="schedule-section-label">
            {cartItems.length > 1 ? `Seu pedido · ${cartItems.length} itens` : 'Seu pedido · 1 item'}
          </div>
          <CartOrderPanel items={cartItems} variant="compact" />
          <button type="button" className="btn-secondary schedule-add-more-btn" onClick={onAddMore}>
            ➕ Adicionar mais cortes ao pedido
          </button>
        </div>

        {showSuggestion && suggestedProduct && (
          <ComboSuggestionCard
            product={product}
            suggestedProduct={suggestedProduct}
            suggestion={suggestion}
            added={false}
            onAdd={() => onAddCombo(suggestedProduct)}
            onCustomize={() => onCustomizeCombo(suggestedProduct)}
            onDismiss={handleDismiss}
          />
        )}
        {comboInCart && suggestedProduct && suggestion && (
          <ComboSuggestionCard
            product={product}
            suggestedProduct={suggestedProduct}
            suggestion={suggestion}
            added
            onAdd={() => {}}
            onCustomize={() => onCustomizeCombo(suggestedProduct)}
            onDismiss={handleDismiss}
          />
        )}

        <div className="schedule-section">
          <div className="schedule-section-title">
            {cartItems.length > 1 ? 'Peso para todos os itens' : 'Quanto você quer?'}
          </div>
          <div className="schedule-weight-grid">
            {WEIGHT_PRESETS.map((w) => (
              <button
                key={w}
                type="button"
                className={`schedule-weight-btn${weight === w ? ' schedule-weight-btn--on' : ''}`}
                onClick={() => setWeight(w)}
              >
                {w < 1 ? `${w * 1000}g` : `${w}kg`}
              </button>
            ))}
          </div>
        </div>

        <div className="schedule-section">
          <div className="schedule-section-title">Retirada</div>
          <div className="schedule-pickup-bar">
            <span className="schedule-pickup-dot" />
            <span className="schedule-pickup-text">Hoje · {today}</span>
          </div>
        </div>

        <div className="schedule-section schedule-section--slots">
          <div className="schedule-section-title">Horário</div>
          <div className="slots-grid slots-grid--compact schedule-slots-grid">
            {slots.filter((s) => s.available).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSlot(s.time)}
                className={`slot${selectedSlot === s.time ? ' slot-sel' : ''}`}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="schedule-checkout">
        <div className="schedule-summary">
          Hoje · {selectedSlot} · {weightLabel}
          {cartItems.length > 1 && ` · ${cartItems.length} itens`}
        </div>
        {cartItems.length > 1 && (
          <div className="schedule-summary-total">
            Estimativa total ~R$ {totalEstimate.toFixed(2).replace('.', ',')}
          </div>
        )}
        <button
          className="btn-primary schedule-cta"
          disabled={!selectedSlot}
          onClick={() => onConfirm(selectedSlot, weight)}
          style={{ opacity: selectedSlot ? 1 : 0.4 }}
        >
          Confirmar agendamento
        </button>
        <div className="schedule-pay-hint">Pagamento no caixa do mercado</div>
      </div>
    </div>
  )
}
