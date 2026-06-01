import QRCode from 'qrcode'

export async function generateQrDataUrl(text: string, size = 120): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: 'M' })
}

/** Blob URL costuma renderizar melhor no diálogo/impressão do Chrome que data: URL. */
export async function generateQrObjectUrl(text: string, size = 120): Promise<string> {
  const dataUrl = await generateQrDataUrl(text, size)
  const res = await fetch(dataUrl)
  return URL.createObjectURL(await res.blob())
}
