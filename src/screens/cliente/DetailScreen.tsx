import { useState } from 'react'
import type { Product, CutType } from '../../data/products'

type Props = {
  product: Product
  immediate?: boolean
  onSchedule: (cutType: CutType, weightKg: number) => void
}

export default function DetailScreen({ product: p, immediate = false, onSchedule }: Props) {
  const [selectedCut, setSelectedCut] = useState<CutType>(p.cutTypes[0])
  const [weight, setWeight] = useState(1.5)

  const weightLabel = weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1).replace('.', ',')
  const estimated = (p.pricePerKg * weight).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="screen screen--detail">
      <div className="detail-scroll scroll">
        <div className="detail-hero">
          <img src={p.imageUrl} alt={p.name} />
          <div className="detail-hero-ov" />
        </div>

        <div className="detail-body">
          <h1 className="detail-title">{p.name}</h1>

          <div className="detail-cut">
            <div className="detail-cut-label">Tipo de Corte</div>
            <div className="detail-cut-grid">
              {p.cutTypes.map((ct) => (
                <div
                  key={ct.id}
                  className={`detail-cut-opt${selectedCut.id === ct.id ? ' on' : ''}`}
                  onClick={() => setSelectedCut(ct)}
                >
                  <div className="detail-cut-name">{ct.name}</div>
                  <div className="detail-cut-desc">{ct.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-price-row">
            <div>
              <div className="detail-price-label">Preço por kg</div>
              <div className="detail-price">
                <sup>R$</sup>
                {p.pricePerKg.toFixed(2).replace('.', ',')}
                <sub>/kg</sub>
              </div>
            </div>
            <div className="detail-qty">
              <button
                type="button"
                className="detail-qty-btn"
                onClick={() => setWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))}
              >
                −
              </button>
              <div className="detail-qty-val">{weightLabel} kg</div>
              <button
                type="button"
                className="detail-qty-btn"
                onClick={() => setWeight((w) => +(w + 0.5).toFixed(1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="detail-estimate">
            <div className="detail-estimate-top">
              <span className="detail-estimate-label">Estimativa ({weightLabel} kg)</span>
              <span className="detail-estimate-val">~{estimated}</span>
            </div>
            <div className="detail-estimate-hint">Peso exato pesado na hora · preço definitivo no caixa</div>
          </div>

          <div className="detail-pay-hint">
            <span className="detail-pay-icon">🛒</span>
            <span className="detail-pay-text">
              <strong>Pagamento no caixa.</strong> Retire seu corte no açougue e dirija-se ao caixa para pagar.
            </span>
          </div>

          <button className="btn-primary detail-cta" onClick={() => onSchedule(selectedCut, weight)}>
            {immediate ? '⚡ Confirmar retirada imediata' : '📅 Agendar este corte'}
          </button>
        </div>
      </div>
    </div>
  )
}
