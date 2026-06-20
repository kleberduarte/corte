import type { ReactNode } from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'blue'

type Props = {
  variant?: BadgeVariant
  children: ReactNode
  size?: 'sm' | 'md'
  dot?: boolean
  pulse?: boolean
}

export function Badge({ variant = 'default', size = 'md', dot, pulse, children }: Props) {
  return (
    <span
      className={[
        'ui-badge',
        `ui-badge--${variant}`,
        `ui-badge--${size}`,
        pulse ? 'ui-badge--pulse' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className="ui-badge-dot"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
