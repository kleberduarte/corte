import { useRef } from 'react'
import type { CartItem } from '../../store/cartStore'

type Props = {
  items: CartItem[]
  slotTime: string
  onConfirm: (phone: string) => void
}

export default function PhoneScreen({ items, slotTime, onConfirm }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const totalEstimate = items.reduce((sum, i) => sum + i.estimatedPrice, 0)

  function handleSubmit() {
    const val = inputRef.current?.value.replace(/\D/g, '') ?? ''
    onConfirm(val)
  }

  return (
    <div className="screen scroll" style={{ padding: '16px 28px 28px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
        Seu WhatsApp
      </div>
      <div style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 22 }}>
        Informe o número para receber as informações do pedido por mensagem.
      </div>

      {/* Resumo */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', marginBottom: 10 }}>
          Resumo do pedido · Hoje · {slotTime}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={item.product.imageUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{item.product.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>{item.cutType.name} · ~{item.weightKg}kg</div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 1 && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border2)', fontSize: 13, fontWeight: 600, color: 'var(--gold)', textAlign: 'right' }}>
            Estimativa ~R$ {totalEstimate.toFixed(2).replace('.', ',')}
          </div>
        )}
      </div>

      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', display: 'block', marginBottom: 7 }}>
        Número com DDD
      </label>
      <div className="input-wrap" style={{ marginBottom: 20 }}>
        <div className="input-prefix">🇧🇷 +55</div>
        <input
          ref={inputRef}
          className="input-f"
          type="tel"
          inputMode="tel"
          placeholder="(11) 9 0000-0000"
          autoFocus
        />
      </div>

      <button className="btn-primary" onClick={handleSubmit} style={{ marginBottom: 12 }}>
        Enviar informações e imprimir pedido
      </button>
      <button className="btn-secondary" onClick={() => onConfirm('')}>
        Pular — apenas imprimir comprovante
      </button>

      <p style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
        Você receberá a confirmação no WhatsApp e um comprovante impresso aqui no totem. Dados usados apenas para este pedido (LGPD).
      </p>
    </div>
  )
}
