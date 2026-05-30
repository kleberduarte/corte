import { useEffect, useState } from 'react'
import { validateAdminSession } from '../../lib/adminAuth'
import { AdminUiProvider } from './adminUi'
import AdminLoginScreen from './AdminLoginScreen'
import AdminDashboard from './AdminDashboard'
import './admin.css'

type AuthState = 'checking' | 'guest' | 'authenticated'

export default function AdminApp() {
  const [auth, setAuth] = useState<AuthState>('checking')

  useEffect(() => {
    document.body.classList.add('mode-admin')
    document.title = 'CORTE · Painel Admin'
    validateAdminSession().then((ok) => setAuth(ok ? 'authenticated' : 'guest'))
    return () => {
      document.body.classList.remove('mode-admin')
      document.title = 'CORTE · Açougue Inteligente'
    }
  }, [])

  function handleLoginSuccess() {
    setAuth('authenticated')
  }

  function handleLogout() {
    setAuth('guest')
  }

  return (
    <AdminUiProvider>
      {auth === 'checking' && (
        <div className="admin-login">
          <div className="admin-loading-block" style={{ justifyContent: 'center' }}>
            <span className="admin-spinner" aria-hidden />
            Verificando sessão...
          </div>
        </div>
      )}
      {auth === 'guest' && <AdminLoginScreen onSuccess={handleLoginSuccess} />}
      {auth === 'authenticated' && <AdminDashboard onLogout={handleLogout} />}
    </AdminUiProvider>
  )
}
