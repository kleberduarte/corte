type Props = {
  size?: number
  label?: string   // texto para leitores de tela
  color?: string   // padrão: var(--primary)
}

export function Spinner({ size = 24, label = 'Carregando...', color }: Props) {
  const r = (size / 2 - 3).toFixed(1)
  const circ = (2 * Math.PI * Number(r)).toFixed(1)

  return (
    <span
      role="status"
      aria-label={label}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        fill="none"
        aria-hidden="true"
        style={{ animation: 'ui-spin .75s linear infinite' }}
      >
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color ?? 'var(--primary)'}
          strokeWidth="3"
          strokeOpacity=".2"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color ?? 'var(--primary)'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={String(Number(circ) * 0.75)}
        />
      </svg>
    </span>
  )
}
