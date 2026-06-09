import { useState } from 'react'
import type { Product, CutType } from '../../data/products'

type Props = {
  product: Product
  immediate?: boolean
  cartCount?: number
  onSchedule: (cutType: CutType, weightKg: number) => void
}

export default function DetailScreen({ product: p, immediate = false, cartCount = 0, onSchedule }: Props) {
  const [selectedCut, setSelectedCut] = useState<CutType>(p.cutTypes[0])
  const [weight, setWeight] = useState(1.5)

  const estimated = (p.pricePerKg * weight).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const weightLabel = weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1).replace('.', ',')

  return (
    <div className="screen screen--detail">
      <div className="detail-hero">
        <img src={p.imageUrl} alt={p.name} />
        <div className="detail-hero-overlay" />
      </div>

      <div className="detail-body">
        <div className="detail-title">{p.name}</div>

        <div className="detail-section">
          <div className="detail-section-label">Tipo de Corte</div>
          <div className="detail-cuts">
            {p.cutTypes.map((ct) => (
              <button
                key={ct.id}
                type="button"
                className={`detail-cut${selectedCut.id === ct.id ? ' detail-cut--on' : ''}`}
                onClick={() => setSelectedCut(ct)}
              >
                {ct.name}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-checkout">
          <div className="detail-price-row">
            <div className="detail-price-block">
              <div className="detail-price-label">Preço por kg</div>
              <div className="detail-price">
                <sup>R$</sup>
                {p.pricePerKg.toFixed(2).replace('.', ',')}
                <sub>/kg</sub>
              </div>
            </div>
            <div className="detail-qty">
              <button type="button" className="detail-qty-btn" onClick={() => setWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))}>−</button>
              <span className="detail-qty-val">{weightLabel} kg</span>
              <button type="button" className="detail-qty-btn" onClick={() => setWeight((w) => +(w + 0.5).toFixed(1))}>+</button>
            </div>
          </div>

          <div className="detail-estimate">
            <div className="detail-estimate-row">
              <span className="detail-estimate-label">Estimativa ({weightLabel} kg)</span>
              <span className="detail-estimate-val">~{estimated}</span>
            </div>
            <div className="detail-estimate-hint">Peso exato pesado na hora · preço definitivo no caixa</div>
          </div>

          <div className="detail-pay-note">
            <span className="detail-pay-icon">🛒</span>
            <span>
              <strong>Pagamento no caixa.</strong> Retire seu corte no açougue e dirija-se ao caixa para pagar.
            </span>
          </div>

          <button className="btn-primary detail-cta" onClick={() => onSchedule(selectedCut, weight)}>
            {cartCount > 0
              ? '➕ Adicionar ao pedido'
              : immediate
                ? '⚡ Confirmar retirada imediata'
                : '📅 Adicionar ao pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
