import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

// Variantes mapeadas para classes CSS definidas em index.css
// Isso evita inline styles e garante que o tema do tenant (via CSS vars) seja aplicado.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  icon?:     ReactNode
  fullWidth?: boolean
}

// Usamos forwardRef para que o componente seja compatível com bibliotecas de acessibilidade
// e possíveis usos como children de componentes que precisam de ref (ex: tooltips, modais).
export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={[
          'ui-btn',
          `ui-btn--${variant}`,
          `ui-btn--${size}`,
          fullWidth ? 'ui-btn--full' : '',
          loading   ? 'ui-btn--loading' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        style={style}
        {...rest}
      >
        {loading && (
          <span className="ui-btn-spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {!loading && icon && <span className="ui-btn-icon" aria-hidden="true">{icon}</span>}
        <span className="ui-btn-label">{children}</span>
      </button>
    )
  },
)

Button.displayName = 'Button'
