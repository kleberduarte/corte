const CHANNEL_NAME = 'corte-board'

export function notifyBoardUpdate() {
  try {
    new BroadcastChannel(CHANNEL_NAME).postMessage({ type: 'refresh' })
  } catch {
    /* BroadcastChannel indisponível */
  }
  window.dispatchEvent(new CustomEvent('corte-board-refresh'))
}

export function subscribeBoardUpdate(onRefresh: () => void) {
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = () => onRefresh()
  } catch {
    /* ignore */
  }

  window.addEventListener('corte-board-refresh', onRefresh)
  return () => {
    channel?.close()
    window.removeEventListener('corte-board-refresh', onRefresh)
  }
}
