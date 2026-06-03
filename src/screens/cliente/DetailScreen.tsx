import { useState } from 'react'
import type { Product, CutType } from '../../data/products'
import { CATEGORY_LABELS } from '../../data/products'

type Props = {
  product: Product
  immediate?: boolean
  onSchedule: (cutType: CutType, weightKg: number) => void
}

export default function DetailScreen({ product: p, immediate = false, onSchedule }: Props) {
  const [selectedCut, setSelectedCut] = useState<CutType>(p.cutTypes[0])
  const [weight, setWeight] = useState(1.5)

  const estimated = (p.pricePerKg * weight).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="screen">
    <div className="scroll" style={{ flex: 1, paddingBottom: 28 }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 248, flexShrink: 0 }}>
        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,13,14,.25) 0%, transparent 40%, rgba(13,13,14,1) 100%)' }} />
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {/* Nome e avaliação */}
        <div style={{ fontSize: 'calc(11px * var(--font-scale))', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 12 }}>
          {CATEGORY_LABELS[p.category]} · {p.badge || 'Seleção'}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'calc(30px * var(--font-scale))', fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1, marginBottom: 10 }}>
          {p.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <span className="stars" style={{ fontSize: 'calc(14px * var(--font-scale))' }}>{'★'.repeat(Math.round(p.rating))}</span>
          <span style={{ fontSize: 'calc(13px * var(--font-scale))', fontWeight: 600 }}>{p.rating.toFixed(1)}</span>
          <span style={{ fontSize: 'calc(12px * var(--font-scale))', color: 'var(--t3)' }}>({p.reviews} avaliações)</span>
        </div>
        <div style={{ fontSize: 'calc(13.5px * var(--font-scale))', color: 'var(--t2)', lineHeight: 1.65, marginBottom: 18 }}>{p.description}</div>

        {/* Tipo de corte */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 'calc(11px * var(--font-scale))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', marginBottom: 10 }}>
            Tipo de Corte
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {p.cutTypes.map((ct) => (
              <div
                key={ct.id}
                onClick={() => setSelectedCut(ct)}
                style={{
                  padding: '10px 12px', borderRadius: 12,
                  border: `1px solid ${selectedCut.id === ct.id ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedCut.id === ct.id ? 'rgba(192,39,45,.12)' : 'var(--s2)',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                <div style={{ fontSize: 'calc(13px * var(--font-scale))', fontWeight: 600, color: selectedCut.id === ct.id ? '#FF9090' : 'var(--t1)' }}>{ct.name}</div>
                <div style={{ fontSize: 'calc(10.5px * var(--font-scale))', color: 'var(--t3)', marginTop: 2 }}>{ct.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 22, flexWrap: 'wrap' }}>
          {p.tags.map((tag) => (
            <div key={tag} style={{ padding: '5px 12px', borderRadius: 20, background: 'var(--s2)', border: '1px solid var(--border2)', fontSize: 'calc(11.5px * var(--font-scale))', color: 'var(--t2)', fontWeight: 500 }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Preço + Quantidade */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 'calc(11px * var(--font-scale))', color: 'var(--t3)', marginBottom: 3 }}>Preço por kg</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'calc(36px * var(--font-scale))', fontWeight: 700, color: 'var(--accent)' }}>
              <sup style={{ fontSize: 'calc(18px * var(--font-scale))' }}>R$</sup>
              {p.pricePerKg.toFixed(2).replace('.', ',')}
              <sub style={{ fontSize: 'calc(14px * var(--font-scale))', fontWeight: 400, color: 'var(--t3)' }}>/kg</sub>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 14px' }}>
            <div onClick={() => setWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'calc(17px * var(--font-scale))', cursor: 'pointer', color: 'var(--t1)' }}>−</div>
            <div style={{ fontSize: 'calc(16px * var(--font-scale))', fontWeight: 700, minWidth: 52, textAlign: 'center' }}>
              {weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1).replace('.', ',')} kg
            </div>
            <div onClick={() => setWeight((w) => +(w + 0.5).toFixed(1))} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'calc(17px * var(--font-scale))', cursor: 'pointer', color: 'var(--t1)' }}>+</div>
          </div>
        </div>

        {/* Estimativa */}
        <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 'calc(12px * var(--font-scale))', color: 'var(--t3)' }}>Estimativa ({weight.toFixed(1).replace('.', ',')} kg)</span>
            <span style={{ fontSize: 'calc(16px * var(--font-scale))', fontWeight: 700, color: 'var(--accent)' }}>~{estimated}</span>
          </div>
          <div style={{ fontSize: 'calc(11.5px * var(--font-scale))', color: 'var(--t3)' }}>Peso exato pesado na hora · preço definitivo no caixa</div>
        </div>

        {/* Pagamento no caixa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(10,132,255,.08)', border: '1px solid rgba(10,132,255,.2)', borderRadius: 12, padding: '11px 14px', marginBottom: 24 }}>
          <span style={{ fontSize: 'calc(18px * var(--font-scale))', flexShrink: 0 }}>🛒</span>
          <span style={{ fontSize: 'calc(12px * var(--font-scale))', color: 'var(--t2)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--t1)' }}>Pagamento no caixa.</strong> Retire seu corte no açougue e dirija-se ao caixa para pagar.
          </span>
        </div>

        {/* CTA */}
        <button className="btn-primary" onClick={() => onSchedule(selectedCut, weight)}>
          {immediate ? '⚡ Confirmar retirada imediata' : '📅 Agendar este corte'}
        </button>
      </div>
    </div>
    </div>
  )
}
