import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type Toast = { message: string; type: 'success' | 'error' }

type ConfirmState = {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  resolve: (ok: boolean) => void
}

type AdminUiContextValue = {
  toast: (message: string, type?: Toast['type']) => void
  confirm: (opts: { title: string; message: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>
}

const AdminUiContext = createContext<AdminUiContextValue | null>(null)

export function useAdminUi() {
  const ctx = useContext(AdminUiContext)
  if (!ctx) throw new Error('useAdminUi deve ser usado dentro de AdminUiProvider')
  return ctx
}

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const [toast, setToast]       = useState<Toast | null>(null)
  const [confirm, setConfirm]   = useState<ConfirmState | null>(null)

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const askConfirm = useCallback((opts: Omit<ConfirmState, 'resolve'>) => {
    return new Promise<boolean>((resolve) => {
      setConfirm({ ...opts, resolve })
    })
  }, [])

  function closeConfirm(ok: boolean) {
    confirm?.resolve(ok)
    setConfirm(null)
  }

  return (
    <AdminUiContext.Provider value={{ toast: showToast, confirm: askConfirm }}>
      {children}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
      {confirm && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => closeConfirm(false)}>
          <div className="admin-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__title">{confirm.title}</div>
            <p className="admin-modal__message">{confirm.message}</p>
            <div className="admin-modal__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => closeConfirm(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className={`admin-btn ${confirm.danger ? 'admin-btn--danger' : 'admin-btn--primary'}`}
                onClick={() => closeConfirm(true)}
              >
                {confirm.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminUiContext.Provider>
  )
}

export function totemUrl(slug: string, view: 'cliente' | 'operador') {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('view', view)
  url.searchParams.set('store', slug)
  return url.toString()
}
