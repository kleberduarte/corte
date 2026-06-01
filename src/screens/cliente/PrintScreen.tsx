import { useEffect, useRef, useState } from 'react'
import type { Order } from '../../store/cartStore'
import { useStore } from '../../data/config'
import { getOrderTrackingUrl } from '../../utils/orderTrackingUrl'
import { generateQrDataUrl } from '../../utils/qrCode'
import { printReceiptSilent } from '../../utils/silentPrint'

type Props = {
  order: Order
  onDone: () => void
}

function pickupLabel(slotTime: string) {
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

const COUNTER_LINE = 'Atendimento presencial no balcão'

function isTotemLocalHost(): boolean {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1'
}

export default function PrintScreen({ order, onDone }: Props) {
  const store = useStore()
  const [stage, setStage] = useState<'printing' | 'done'>('printing')
  const [countdown, setCountdown] = useState(8)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [printOk, setPrintOk] = useState<boolean | null>(null)
  const printedRef = useRef(false)

  useEffect(() => {
    generateQrDataUrl(getOrderTrackingUrl(order.pickupCode), 140).then(setQrDataUrl)
  }, [order.pickupCode])

  useEffect(() => {
    if (printedRef.current) return
    printedRef.current = true
    printReceiptSilent(order, store.name, store.id).then(setPrintOk)
  }, [order, store.name, store.id])

  useEffect(() => {
    const t = setTimeout(() => setStage('done'), 3200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (stage !== 'done') return

    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [stage])

  useEffect(() => {
    if (stage === 'done' && countdown === 0) onDone()
  }, [stage, countdown, onDone])

  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (stage === 'done') {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,199,89,.15)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 18, animation: 'popIn .55s cubic-bezier(.175,.885,.32,1.275) both' }}>
          ✓
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
          Pedido finalizado!
        </div>
        {printOk === false && (
          <div style={{
            background: 'rgba(255,159,10,.12)', border: '1px solid rgba(255,159,10,.45)',
            borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 16, maxWidth: 320,
            fontSize: 13, color: 'var(--t1)', lineHeight: 1.5,
          }}>
            Não foi possível imprimir o comprovante. Anote o código abaixo ou procure um funcionário.
            {!isTotemLocalHost() && (
              <> O totem deve ser aberto via <strong>corte.bat</strong> (http://localhost:4173), não pela URL da internet.</>
            )}
            {isTotemLocalHost() && (
              <> Verifique a janela <strong>CORTE Print</strong> (porta 3334) e o nome da impressora em <code>print-server\.env</code>.</>
            )}
          </div>
        )}
        <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.55, marginBottom: 24, maxWidth: 300 }}>
          {printOk === false
            ? (order.customerPhone
              ? 'Pedido registrado e informações enviadas ao WhatsApp.'
              : 'Pedido registrado com sucesso.')
            : order.items.length === 0
              ? 'Comprovante impresso com sucesso. Apresente a senha no balcão do açougue.'
              : order.customerPhone
                ? 'Informações enviadas para o WhatsApp. Comprovante impresso com sucesso.'
                : order.slotTime === 'Imediata'
                  ? 'Comprovante impresso com sucesso. Dirija-se ao balcão do açougue.'
                  : 'Comprovante impresso com sucesso. Dirija-se ao açougue no horário agendado.'}
        </div>
        <div style={{ background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '14px 20px', marginBottom: 20, width: '100%' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--t3)', marginBottom: 8 }}>
            Código de retirada
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, fontWeight: 700, color: 'var(--accent)', letterSpacing: 8 }}>
            {order.pickupCode}
          </div>
        </div>
        {qrDataUrl && (
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 28, width: '100%' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--t3)', marginBottom: 12 }}>
              Acompanhe seu pedido
            </div>
            <div style={{ background: '#fff', borderRadius: 12, width: 140, height: 140, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              <img src={qrDataUrl} alt="QR Code para acompanhar pedido" width={124} height={124} style={{ display: 'block' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Escaneie para ver o andamento em tempo real</div>
          </div>
        )}
        <button className="btn-primary" onClick={onDone} style={{ maxWidth: 320 }}>
          Voltar ao início ({countdown}s)
        </button>
        <style>{`@keyframes popIn { from { transform: scale(.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    )
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t2)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 22, height: 22, border: '3px solid var(--border2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        Imprimindo pedido...
      </div>

      <div style={{ width: '100%', maxWidth: 320, background: '#1a1a1c', borderRadius: 16, padding: 16, border: '1px solid var(--border2)', boxShadow: '0 20px 50px rgba(0,0,0,.4)' }}>
        <div style={{ background: '#2a2a2e', borderRadius: '10px 10px 4px 4px', height: 14, marginBottom: 8, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, #3a3a3e, transparent)', animation: 'slotShine 1.2s ease-in-out infinite' }} />
        </div>
        <div style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Courier New', monospace", fontSize: 11.5, lineHeight: 1.45, padding: '18px 14px', borderRadius: 4, animation: 'receiptReveal 2.5s ease forwards' }}>
          <div style={{ textAlign: 'center', fontWeight: 700 }}>CORTE · Açougue Inteligente</div>
          <div style={{ textAlign: 'center', fontSize: 10, marginBottom: 4 }}>{store.name}</div>
          <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }} />
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, margin: '6px 0' }}>
            {order.items.length === 0 ? 'SENHA DE BALCÃO' : order.slotTime === 'Imediata' ? 'PEDIDO IMEDIATO' : 'PEDIDO AGENDADO'}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }} />
          {order.items.length === 0 ? (
            <div><strong>Pedido:</strong> {COUNTER_LINE}</div>
          ) : order.items.map((item, idx) => (
            <div key={item.product.id} style={{ marginBottom: idx < order.items.length - 1 ? 6 : 0 }}>
              <div><strong>{order.items.length > 1 ? `Item ${idx + 1}:` : 'Corte:'}</strong> {item.product.name}</div>
              <div><strong>Tipo:</strong> {item.cutType.name}</div>
              <div><strong>Peso:</strong> ~{item.weightKg}kg</div>
            </div>
          ))}
          <div><strong>Retirada:</strong> {pickupLabel(order.slotTime)}</div>
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, letterSpacing: 3, margin: '8px 0' }}>
            {order.pickupCode}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          {qrDataUrl ? (
            <>
              <div style={{ textAlign: 'center', fontSize: 10, marginBottom: 6 }}>Acompanhe seu pedido</div>
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <img src={qrDataUrl} alt="" width={72} height={72} style={{ display: 'inline-block' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 9, color: '#666' }}>Escaneie para ver o andamento</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', fontSize: 10, color: '#666' }}>Gerando QR Code...</div>
          )}
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          <div style={{ textAlign: 'center', fontSize: 10 }}>Apresente este comprovante</div>
          <div style={{ textAlign: 'center', fontSize: 10 }}>no balcão do açougue</div>
          <div style={{ textAlign: 'center', fontSize: 9, marginTop: 8, color: '#666' }}>{dateStr} {timeStr}</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slotShine { 0%,100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
        @keyframes receiptReveal { from { max-height: 0; opacity: 0; } to { max-height: 600px; opacity: 1; } }
      `}</style>
    </div>
  )
}
