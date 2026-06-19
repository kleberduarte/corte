import { useEffect, useRef, useState, useCallback } from 'react'

const INACTIVITY_MS = 90_000
const COUNTDOWN_S   = 15

export function useInactivity(onReset: () => void) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const mainTimer  = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const countTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = () => {
    if (mainTimer.current)  clearTimeout(mainTimer.current)
    if (countTimer.current) clearInterval(countTimer.current)
    mainTimer.current = countTimer.current = null
  }

  const reset = useCallback(() => {
    clear()
    setCountdown(null)
    mainTimer.current = setTimeout(() => {
      setCountdown(COUNTDOWN_S)
      let s = COUNTDOWN_S
      countTimer.current = setInterval(() => {
        s -= 1
        setCountdown(s)
        if (s <= 0) { clear(); setCountdown(null); onReset() }
      }, 1000)
    }, INACTIVITY_MS - COUNTDOWN_S * 1000)
  }, [onReset])

  const dismiss = useCallback(() => reset(), [reset])

  useEffect(() => {
    reset()
    const events = ['touchstart', 'mousedown', 'keydown'] as const
    const handler = () => { if (countTimer.current === null) reset() }
    events.forEach((e) => document.addEventListener(e, handler))
    return () => { clear(); events.forEach((e) => document.removeEventListener(e, handler)) }
  }, [reset])

  return { countdown, dismiss }
}
