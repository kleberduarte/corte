import { loginAdmin } from '../../lib/adminAuth'
import { ApiError } from '../../lib/api'
import PanelLoginScreen from '../../components/PanelLoginScreen'

export default function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  return (
    <PanelLoginScreen
      subtitle="Painel administrativo"
      onLogin={async (email, password) => {
        await loginAdmin(email, password)
        onSuccess()
      }}
      formatError={(err) => {
        if (err instanceof ApiError && err.status === 401) {
          return 'E-mail ou senha incorretos'
        }
        return err instanceof ApiError ? err.message : 'Não foi possível conectar ao servidor'
      }}
    />
  )
}
