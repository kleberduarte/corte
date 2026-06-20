const CHANNEL_NAME = 'corte-board'

export function notifyBoardUpdate() {
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME)
    ch.postMessage({ type: 'refresh' })
    ch.close()
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
