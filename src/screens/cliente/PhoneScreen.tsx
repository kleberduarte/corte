import { useRef } from 'react'
import CartOrderPanel from '../../components/CartOrderPanel'
import type { CartItem } from '../../store/cartStore'

type Props = {
  items: CartItem[]
  slotTime: string
  immediate?: boolean
  onConfirm: (phone: string) => void
}

export default function PhoneScreen({ items, slotTime, immediate = false, onConfirm }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  function handleSubmit() {
    const val = inputRef.current?.value.replace(/\D/g, '') ?? ''
    onConfirm(val)
  }

  return (
    <div className="screen">
    <div className="scroll" style={{ flex: 1, padding: '16px 28px 28px' }}>
      <div className="phone-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
        Seu WhatsApp
      </div>
      <div className="phone-lead" style={{ fontSize: 18, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 22 }}>
        Informe o número para receber as informações do pedido por mensagem.
      </div>

      {/* Resumo */}
      <div className="phone-order-summary" style={{ marginBottom: 22 }}>
        <div className="phone-order-summary-label">
          Resumo do pedido · {immediate ? 'Escolher e Aguardar' : `Hoje · ${slotTime}`}
        </div>
        <CartOrderPanel items={items} variant="compact" />
      </div>

      <label style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', display: 'block', marginBottom: 7 }}>
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

      <p style={{ fontSize: 15, color: 'var(--t3)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
        Você receberá a confirmação no WhatsApp e um comprovante impresso aqui no totem. Dados usados apenas para este pedido (LGPD).
      </p>
    </div>
    </div>
  )
}
