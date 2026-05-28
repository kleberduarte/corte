import type { StoreConfig } from './config'

export type Slot = {
  id: string
  time: string
  available: boolean
}

function generateSlots(openTime: string, closeTime: string, intervalMin: number): string[] {
  const slots: string[] = []
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  const closeTotal = closeH * 60 + closeM

  let current = openH * 60 + openM
  while (current < closeTotal) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += intervalMin
  }
  return slots
}

export function getTodaySlots(store: StoreConfig): Slot[] {
  const { hours, slotIntervalMin, minLeadTimeMin, mockFullSlotIndexes } = store
  const now = new Date()
  const nowTotal = now.getHours() * 60 + now.getMinutes()

  // Último slot possível = fechamento - antecedência mínima
  const [closeAfH, closeAfM] = hours.afternoon.close.split(':').map(Number)
  const lastSlotTotal = closeAfH * 60 + closeAfM - minLeadTimeMin

  const allSlots = [
    ...generateSlots(hours.morning.open, hours.morning.close, slotIntervalMin),
    ...generateSlots(hours.afternoon.open, hours.afternoon.close, slotIntervalMin),
  ]

  return allSlots.map((time, i) => {
    const [h, m] = time.split(':').map(Number)
    const slotTotal = h * 60 + m
    const isPast = slotTotal <= nowTotal
    const isTooLate = slotTotal > lastSlotTotal
    return {
      id: `slot-${time}`,
      time,
      available: !isPast && !isTooLate && !mockFullSlotIndexes.includes(i),
    }
  })
}
