import { loginOperator } from '../../lib/auth'
import { ApiError } from '../../lib/api'
import { useStore } from '../../data/config'
import PanelLoginScreen from '../../components/PanelLoginScreen'

type Props = {
  onSuccess: () => void
}

export default function LoginScreen({ onSuccess }: Props) {
  const store = useStore()

  return (
    <PanelLoginScreen
      subtitle={`Painel do operador · ${store.name}`}
      onLogin={async (email, password) => {
        await loginOperator(store.id, email, password)
        onSuccess()
      }}
      formatError={(err) => {
        if (err instanceof ApiError) return err.message
        return 'Não foi possível conectar ao servidor'
      }}
    />
  )
}
