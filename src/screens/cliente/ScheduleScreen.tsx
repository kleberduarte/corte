import { useState } from 'react'
import type { Product, CutType } from '../../data/products'
import { PRODUCTS, SUGGESTIONS } from '../../data/products'
import { getTodaySlots } from '../../data/slots'
import { useStore } from '../../data/config'
import type { CartItem } from '../../store/cartStore'
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

  function handleDismiss() {
    dismissSuggestion(product.id)
    setDismissed(true)
  }

  /* Etapa 3: .screen--flow rola direto (protótipo totem-schedule-screen), sem .scroll aninhado */
  return (
    <div className="screen screen--flow" style={{ paddingBottom: 28 }}>
      <div style={{ padding: '4px 24px 14px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600, color: 'var(--accent)' }}>
          Agendar retirada
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>
          Escolha o peso e o horário para buscar hoje
        </div>
      </div>

      <div style={{ margin: '0 24px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', marginBottom: 8 }}>
          {cartItems.length > 1 ? `${cartItems.length} itens no pedido` : 'Seu corte'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: 'var(--s2)', border: `1px solid ${item.product.id === product.id ? 'rgba(192,39,45,.35)' : 'var(--border2)'}`,
                borderRadius: 'var(--r)',
              }}
            >
              <img src={item.product.imageUrl} alt={item.product.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{item.product.name}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{item.cutType.name}</div>
              </div>
              {item.product.id !== product.id && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'rgba(52,199,89,.12)', padding: '3px 8px', borderRadius: 8 }}>
                  + combo
                </span>
              )}
            </div>
          ))}
        </div>
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

      <div style={{ margin: '0 24px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 10 }}>
          {cartItems.length > 1 ? 'Peso para todos os itens' : 'Quanto você quer?'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {WEIGHT_PRESETS.map((w) => (
            <div
              key={w}
              onClick={() => setWeight(w)}
              style={{
                flex: 1, padding: '14px 0', textAlign: 'center', borderRadius: 12,
                border: `1px solid ${weight === w ? 'var(--primary)' : 'var(--border)'}`,
                background: weight === w ? 'rgba(192,39,45,.18)' : 'var(--s2)',
                color: weight === w ? '#FF8A8A' : 'var(--t3)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {w < 1 ? `${w * 1000}g` : `${w}kg`}
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: '0 24px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 10 }}>Retirada</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'rgba(52,199,89,.1)', border: '1px solid rgba(52,199,89,.28)', borderRadius: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 0 3px rgba(52,199,89,.2)' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize' }}>Hoje · {today}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8, lineHeight: 1.4 }}>
          Agendamento disponível apenas para retirada no mesmo dia.
        </p>
      </div>

      <div style={{ margin: '0 24px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 10 }}>Horário</div>
        <div className="slots-grid slots-grid--compact">
          {slots.filter((s) => s.available).map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSlot(s.time)}
              className={`slot${selectedSlot === s.time ? ' slot-sel' : ''}`}
            >
              {s.time}
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: '8px 24px 0', padding: 16, background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 'var(--r-lg)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', textAlign: 'center', marginBottom: 6 }}>
          Hoje · {selectedSlot} · {weight}kg
          {cartItems.length > 1 && ` · ${cartItems.length} itens`}
        </div>
        {cartItems.length > 1 && (
          <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', marginBottom: 12 }}>
            Estimativa total ~R$ {totalEstimate.toFixed(2).replace('.', ',')}
          </div>
        )}
        <button
          className="btn-primary"
          disabled={!selectedSlot}
          onClick={() => onConfirm(selectedSlot, weight)}
          style={{ opacity: selectedSlot ? 1 : 0.4 }}
        >
          Confirmar agendamento
        </button>
        <div style={{ fontSize: 11.5, color: 'var(--t3)', textAlign: 'center', marginTop: 10 }}>
          Pagamento no caixa do mercado
        </div>
      </div>
    </div>
  )
}
