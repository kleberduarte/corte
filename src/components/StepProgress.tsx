type Props = { current: number; total: number; labels?: string[] }

export default function StepProgress({ current, total, labels }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px 0', flexShrink: 0 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : undefined, gap: 8 }}>
          <div className="step-dot" style={{
            width: 30, height: 30, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            background: i < current || (i === current && i === total - 1) ? 'var(--green)' : i === current ? 'var(--primary)' : 'var(--s3)',
            border: `2px solid ${i < current || (i === current && i === total - 1) ? 'var(--green)' : i === current ? 'var(--primary)' : 'var(--border)'}`,
            fontSize: 16, fontWeight: 700,
            color: i <= current ? 'white' : 'var(--t4)',
            transition: 'all .3s',
          }}>
            {i < current || (i === current && i === total - 1) ? '✓' : i + 1}
          </div>
          {labels && (
            <div style={{ fontSize: 13, color: i === current ? 'var(--t2)' : 'var(--t4)', whiteSpace: 'nowrap', display: i < total - 1 ? 'none' : undefined }}>
              {labels[i]}
            </div>
          )}
          {i < total - 1 && (
            <div style={{ flex: 1, height: 2, borderRadius: 1, background: i < current ? 'var(--green)' : 'var(--s4)', transition: 'background .3s' }} />
          )}
        </div>
      ))}
    </div>
  )
}
