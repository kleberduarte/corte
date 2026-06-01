import { getTotemAccessWarning } from '../utils/totemAccess'

export default function TotemAccessBanner() {
  const warning = getTotemAccessWarning()
  if (!warning) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000,
      background: 'rgba(180, 40, 40, 0.95)', color: '#fff',
      padding: '12px 16px', fontSize: 13, lineHeight: 1.45,
      borderBottom: '2px solid rgba(255,200,80,.8)',
      boxShadow: '0 4px 20px rgba(0,0,0,.4)',
    }}>
      <strong>Impressão indisponível neste endereço.</strong> {warning}
    </div>
  )
}
