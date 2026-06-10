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
    <div className="screen screen--phone">
      <div className="phone-header">
        <h1 className="phone-heading">Seu WhatsApp</h1>
        <p className="phone-lead">
          Informe o número para receber as informações do pedido por mensagem.
        </p>
      </div>

      <div className="phone-body">
        <div className="phone-order-summary">
          <div className="phone-order-summary-label">
            Resumo do pedido · {immediate ? 'Escolher e Aguardar' : `Hoje · ${slotTime}`}
          </div>
          <CartOrderPanel items={items} variant="compact" />
        </div>
      </div>

      <div className="phone-footer">
        <label className="phone-label" htmlFor="phone-input">
          Número com DDD
        </label>
        <div className="input-wrap">
          <div className="input-prefix">🇧🇷 +55</div>
          <input
            ref={inputRef}
            id="phone-input"
            className="input-f"
            type="tel"
            inputMode="tel"
            placeholder="(11) 9 0000-0000"
            autoFocus
          />
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          Enviar informações e imprimir pedido
        </button>
        <button className="btn-secondary" onClick={() => onConfirm('')}>
          Pular — apenas imprimir comprovante
        </button>

        <p className="phone-disclaimer">
          Você receberá a confirmação no WhatsApp e um comprovante impresso aqui no totem. Dados usados apenas para este pedido (LGPD).
        </p>
      </div>
    </div>
  )
}
