// Sistema de Toast — feedback visual para ações do operador.
//
// Uso:
//   const { toast } = useToast()
//   toast.success('Pedido movido para Pronto')
//   toast.error('Falha ao atualizar — tente novamente')
//
// O ToastProvider deve envolver a aplicação uma única vez (App.tsx).
// Limite de 4 toasts visíveis simultâneos — o mais antigo é removido automaticamente.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

type ToastItem = {
  id:       string
  type:     ToastType
  message:  string
  durationMs: number
}

type ToastContextValue = {
  success: (msg: string, durationMs?: number) => void
  error:   (msg: string, durationMs?: number) => void
  warning: (msg: string, durationMs?: number) => void
  info:    (msg: string, durationMs?: number) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

const MAX_VISIBLE = 4
const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  error:   6000,   // erros ficam mais tempo — o operador precisa ler
  warning: 5000,
  info:    3500,
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

// Componente individual de toast — usa CSS vars do tema
function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(item.id), item.durationMs)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [item.id, item.durationMs, onDismiss])

  return (
    <div
      className={`ui-toast ui-toast--${item.type}`}
      role={item.type === 'error' ? 'alert' : 'status'}
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <span className="ui-toast-icon" aria-hidden="true">{ICONS[item.type]}</span>
      <span className="ui-toast-msg">{item.message}</span>
      <button
        className="ui-toast-close"
        onClick={() => onDismiss(item.id)}
        aria-label="Fechar notificação"
      >
        ×
      </button>

      {/* Barra de progresso animada */}
      <span
        className="ui-toast-progress"
        style={{ animationDuration: `${item.durationMs}ms` }}
        aria-hidden="true"
      />
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((type: ToastType, message: string, durationMs?: number) => {
    const item: ToastItem = {
      id: crypto.randomUUID(),
      type,
      message,
      durationMs: durationMs ?? DEFAULT_DURATION[type],
    }
    setToasts((prev) => {
      const next = [item, ...prev]
      // Remove o mais antigo se passou do limite
      return next.length > MAX_VISIBLE ? next.slice(0, MAX_VISIBLE) : next
    })
  }, [])

  const api: ToastContextValue = {
    success: (msg, ms) => push('success', msg, ms),
    error:   (msg, ms) => push('error',   msg, ms),
    warning: (msg, ms) => push('warning', msg, ms),
    info:    (msg, ms) => push('info',    msg, ms),
  }

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* Portal-like: posicionado pelo CSS fora do flow normal */}
      {toasts.length > 0 && (
        <div
          className="ui-toast-region"
          aria-label="Notificações"
          role="region"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}
