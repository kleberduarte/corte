import QRCode from 'qrcode'

export async function generateQrDataUrl(text: string, size = 120): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: 'M' })
}
