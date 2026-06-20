import type { ReactNode } from 'react'

type Props = {
  icon?:        ReactNode
  title:        string
  description?: string
  action?:      ReactNode
  compact?:     boolean   // versão menor para uso dentro de colunas (ex: Kanban)
}

// Componente unificado para estados vazios.
// Usar em todos os lugares onde uma lista pode estar vazia — never show nothing.
export function EmptyState({ icon, title, description, action, compact = false }: Props) {
  return (
    <div
      className={['ui-empty', compact ? 'ui-empty--compact' : ''].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
    >
      {icon && <div className="ui-empty-icon" aria-hidden="true">{icon}</div>}
      <p className="ui-empty-title">{title}</p>
      {description && <p className="ui-empty-desc">{description}</p>}
      {action && <div className="ui-empty-action">{action}</div>}
    </div>
  )
}
