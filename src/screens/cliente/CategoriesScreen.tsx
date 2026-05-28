import { CATEGORY_CARDS } from '../../data/products'

type Props = { onSelect: (filter: string) => void }

export default function CategoriesScreen({ onSelect }: Props) {
  return (
    <div className="screen" style={{ padding: '0 0 8px' }}>
      <div style={{ flexShrink: 0, padding: '8px 16px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
          O que você procura?
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'right' }}>
          Toque em uma categoria
        </div>
      </div>

      <div style={{
        flex: 1, minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gap: 8,
        padding: '0 8px 8px',
      }}>
        {CATEGORY_CARDS.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelect(cat.filter)}
            style={{
              position: 'relative',
              gridColumn: cat.wide ? '1 / -1' : undefined,
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,.35)',
            }}
          >
            <img
              src={cat.imageUrl}
              alt={cat.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(165deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,.35) 40%, rgba(0,0,0,.82) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '14px 16px 16px' }}>
              <div style={{ fontSize: cat.wide ? 36 : 32, lineHeight: 1, marginBottom: 8, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.6))' }}>
                {cat.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: cat.wide ? 28 : 24, fontWeight: 700, color: 'white', lineHeight: 1.05, textShadow: '0 2px 16px rgba(0,0,0,.65)' }}>
                {cat.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', marginTop: 5, fontWeight: 500 }}>
                {cat.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
