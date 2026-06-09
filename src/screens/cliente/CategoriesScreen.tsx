import { CATEGORY_CARDS } from '../../data/products'

type Props = { onSelect: (filter: string) => void }

export default function CategoriesScreen({ onSelect }: Props) {
  return (
    <div className="screen" style={{ padding: '0 0 8px' }}>
      <div style={{ flexShrink: 0, padding: '8px 16px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="cat-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: 31, fontWeight: 700, color: 'var(--accent)' }}>
          O que você procura?
        </div>
        <div className="cat-hint" style={{ fontSize: 15, color: 'var(--t3)', textAlign: 'right' }}>
          Toque em uma categoria
        </div>
      </div>

      <div
        className="scroll"
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0 8px 8px',
        }}
      >
        <div
          className="cat-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridAutoRows: 'minmax(132px, 1fr)',
            gap: 8,
            minHeight: '100%',
          }}
        >
          {CATEGORY_CARDS.map((cat) => {
            return (
              <div
                key={cat.id}
                onClick={() => onSelect(cat.filter)}
                style={{
                  position: 'relative',
                  minHeight: 132,
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
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(13,13,14,.45)',
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,.35)',
                  }}
                />
                <div
                  className="cat-name"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 0,
                    padding: '12px 14px',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 36,
                    fontWeight: 800,
                    color: '#fff',
                    lineHeight: 1.08,
                    textAlign: 'center',
                    letterSpacing: '.3px',
                    textShadow:
                      '0 0 20px rgba(255,255,255,.3), 0 2px 18px rgba(0,0,0,.9), 0 4px 36px rgba(0,0,0,.7)',
                  }}
                >
                  {cat.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
