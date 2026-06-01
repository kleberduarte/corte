/** Totem físico: impressão só funciona com frontend em HTTP local (corte.bat → localhost:4173). */

export function isTotemPrintCapable(): boolean {
  const { protocol, hostname } = window.location
  if (protocol === 'https:') return false
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) return true
  return false
}

export function getTotemAccessWarning(): string | null {
  if (isTotemPrintCapable()) return null

  const { protocol, hostname, href } = window.location

  if (protocol === 'https:') {
    return `Este endereço (${hostname}) é HTTPS na internet — o navegador bloqueia a impressora local. Feche o Chrome, execute corte.bat → opção 2 e use apenas http://localhost:4173`
  }

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `Endereço atual: ${href}. Para imprimir, use corte.bat → opção 2 (http://localhost:4173), não um atalho da internet.`
  }

  return 'Use corte.bat → opção 2 para abrir http://localhost:4173 no totem.'
}
