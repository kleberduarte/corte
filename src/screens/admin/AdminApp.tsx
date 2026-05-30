import { useState } from 'react'
import { isAdminLoggedIn } from '../../lib/adminAuth'
import AdminLoginScreen from './AdminLoginScreen'
import AdminDashboard from './AdminDashboard'

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn)

  if (!loggedIn) return <AdminLoginScreen onSuccess={() => setLoggedIn(true)} />
  return <AdminDashboard onLogout={() => setLoggedIn(false)} />
}
