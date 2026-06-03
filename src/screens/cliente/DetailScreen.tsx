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
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1, marginBottom: 16, marginTop: 12 }}>
          {p.name}
        </div>

        {/* Tipo de corte */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', marginBottom: 10 }}>
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
                <div style={{ fontSize: 17, fontWeight: 600, color: selectedCut.id === ct.id ? '#FF9090' : 'var(--t1)' }}>{ct.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preço + Quantidade */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 3 }}>Preço por kg</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 46, fontWeight: 700, color: 'var(--accent)' }}>
              <sup style={{ fontSize: 23 }}>R$</sup>
              {p.pricePerKg.toFixed(2).replace('.', ',')}
              <sub style={{ fontSize: 18, fontWeight: 400, color: 'var(--t3)' }}>/kg</sub>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 14px' }}>
            <div onClick={() => setWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer', color: 'var(--t1)' }}>−</div>
            <div style={{ fontSize: 20, fontWeight: 700, minWidth: 52, textAlign: 'center' }}>
              {weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1).replace('.', ',')} kg
            </div>
            <div onClick={() => setWeight((w) => +(w + 0.5).toFixed(1))} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer', color: 'var(--t1)' }}>+</div>
          </div>
        </div>

        {/* Estimativa */}
        <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 15, color: 'var(--t3)' }}>Estimativa ({weight.toFixed(1).replace('.', ',')} kg)</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>~{estimated}</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--t3)' }}>Peso exato pesado na hora · preço definitivo no caixa</div>
        </div>

        {/* Pagamento no caixa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(10,132,255,.08)', border: '1px solid rgba(10,132,255,.2)', borderRadius: 12, padding: '11px 14px', marginBottom: 24 }}>
          <span style={{ fontSize: 23, flexShrink: 0 }}>🛒</span>
          <span style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.5 }}>
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
