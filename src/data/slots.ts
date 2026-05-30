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

  // Faixa contínua: abertura da manhã até fechamento da tarde
  const [closeH, closeM] = hours.afternoon.close.split(':').map(Number)
  const lastSlotTotal = closeH * 60 + closeM - minLeadTimeMin

  const allSlots = generateSlots(hours.morning.open, hours.afternoon.close, slotIntervalMin)

  return allSlots.map((time, i) => {
    const [h, m] = time.split(':').map(Number)
    const slotTotal = h * 60 + m
    return {
      id: `slot-${time}`,
      time,
      available: slotTotal > nowTotal && slotTotal <= lastSlotTotal && !mockFullSlotIndexes.includes(i),
    }
  })
}
