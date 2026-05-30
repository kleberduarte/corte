import { useEffect, useState } from 'react'
import { api, ApiError } from '../../../lib/api'
import { getAdminToken } from '../../../lib/adminAuth'
import { CHAIN_OPTIONS } from '../constants'
import { useAdminUi } from '../adminUi'

type StoreData = {
  name: string; chain: string; slug: string; active: boolean
  config: {
    primaryColor: string; primaryDark: string; accentColor: string
    logoUrl: string; morningOpen: string; morningClose: string
    afternoonOpen: string; afternoonClose: string
    slotIntervalMin: number; minLeadTimeMin: number; inactivityTimeout: number
  }
}

const CHAINS = CHAIN_OPTIONS.filter((c) => c.value !== '')

const DEFAULT: StoreData = {
  name: '', chain: 'OUTROS', slug: '', active: true,
  config: {
    primaryColor: '#C0272D', primaryDark: '#7A1015', accentColor: '#F5EDDB',
    logoUrl: '', morningOpen: '08:00', morningClose: '12:00',
    afternoonOpen: '14:00', afternoonClose: '22:00',
    slotIntervalMin: 30, minLeadTimeMin: 30, inactivityTimeout: 90,
  },
}

export default function StoreFormPanel({ storeId, onBack, onSaved }: {
  storeId: string | null
  onBack: () => void
  onSaved: () => void
}) {
  const { toast } = useAdminUi()
  const [form, setForm]     = useState<StoreData>(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const isEdit = !!storeId

  useEffect(() => {
    if (!storeId) { setForm(DEFAULT); return }
    setLoading(true)
    api.get<any>(`/admin/stores/${storeId}`, getAdminToken() ?? '').then((data) => {
      setForm({
        name: data.name, chain: data.chain, slug: data.slug, active: data.active,
        config: { ...DEFAULT.config, ...data.config, logoUrl: data.config?.logoUrl ?? '' },
      })
    }).catch((err) => {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar loja')
    }).finally(() => setLoading(false))
  }, [storeId])

  function setField(field: keyof StoreData, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function setConfig(field: string, value: unknown) {
    setForm((f) => ({ ...f, config: { ...f.config, [field]: value } }))
  }

  function autoSlug(name: string) {
    if (isEdit) return
    setField('slug', name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const token = getAdminToken() ?? ''
      const payload = { ...form, config: { ...form.config, logoUrl: form.config.logoUrl || null } }
      if (isEdit) {
        await api.put(`/admin/stores/${storeId}`, payload, token)
        toast('Loja atualizada com sucesso')
      } else {
        await api.post('/admin/stores', payload, token)
        toast('Loja criada com sucesso')
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading-block">
        <span className="admin-spinner" aria-hidden />
        Carregando formulário...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="admin-page-title">{isEdit ? 'Editar loja' : 'Nova loja'}</h1>
      <p className="admin-page-sub">
        {isEdit ? 'Altere dados, identidade visual e horários.' : 'Preencha os dados para cadastrar uma nova unidade.'}
      </p>

      <form onSubmit={handleSubmit}>
        <section className="admin-form-section">
          <h2 className="admin-form-section__title">Dados da loja</h2>
          <div className="admin-grid">
            <div className="admin-field">
              <label htmlFor="store-name">Nome da loja</label>
              <input
                id="store-name"
                required
                value={form.name}
                onChange={(e) => { setField('name', e.target.value); autoSlug(e.target.value) }}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="store-chain">Rede</label>
              <select id="store-chain" value={form.chain} onChange={(e) => setField('chain', e.target.value)}>
                {CHAINS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="store-slug">Slug (URL)</label>
              <input
                id="store-slug"
                required
                disabled={isEdit}
                value={form.slug}
                onChange={(e) => setField('slug', e.target.value)}
              />
              <p className="admin-field__hint">Usado em ?store=slug — apenas letras minúsculas, números e hífens</p>
            </div>
          </div>
        </section>

        <section className="admin-form-section">
          <h2 className="admin-form-section__title">Identidade visual</h2>
          <div className="admin-grid">
            {(['primaryColor', 'primaryDark', 'accentColor'] as const).map((key) => (
              <div className="admin-field" key={key}>
                <label>{key === 'primaryColor' ? 'Cor principal' : key === 'primaryDark' ? 'Cor escura' : 'Cor de destaque'}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={form.config[key]}
                    onChange={(e) => setConfig(key, e.target.value)}
                    style={{ width: 44, height: 38, borderRadius: 8, border: 'none', padding: 0 }}
                  />
                  <input value={form.config[key]} onChange={(e) => setConfig(key, e.target.value)} />
                </div>
              </div>
            ))}
            <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="store-logo">URL da logo</label>
              <input
                id="store-logo"
                placeholder="https://..."
                value={form.config.logoUrl}
                onChange={(e) => setConfig('logoUrl', e.target.value)}
              />
              <p className="admin-field__hint">Link público da imagem (PNG ou SVG)</p>
              {form.config.logoUrl && (
                <div className="admin-preview-logo">
                  <img src={form.config.logoUrl} alt="Prévia da logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="admin-form-section">
          <h2 className="admin-form-section__title">Horários e totem</h2>
          <div className="admin-grid">
            <div className="admin-field">
              <label htmlFor="morning-open">Manhã — abertura</label>
              <input id="morning-open" type="time" value={form.config.morningOpen} onChange={(e) => setConfig('morningOpen', e.target.value)} />
            </div>
            <div className="admin-field">
              <label htmlFor="morning-close">Manhã — fechamento</label>
              <input id="morning-close" type="time" value={form.config.morningClose} onChange={(e) => setConfig('morningClose', e.target.value)} />
            </div>
            <div className="admin-field">
              <label htmlFor="afternoon-open">Tarde — abertura</label>
              <input id="afternoon-open" type="time" value={form.config.afternoonOpen} onChange={(e) => setConfig('afternoonOpen', e.target.value)} />
            </div>
            <div className="admin-field">
              <label htmlFor="afternoon-close">Tarde — fechamento</label>
              <input id="afternoon-close" type="time" value={form.config.afternoonClose} onChange={(e) => setConfig('afternoonClose', e.target.value)} />
            </div>
            <div className="admin-field">
              <label htmlFor="slot-interval">Intervalo entre slots (min)</label>
              <input id="slot-interval" type="number" min={5} max={120} value={form.config.slotIntervalMin} onChange={(e) => setConfig('slotIntervalMin', Number(e.target.value))} />
            </div>
            <div className="admin-field">
              <label htmlFor="lead-time">Antecedência mínima (min)</label>
              <input id="lead-time" type="number" min={0} max={120} value={form.config.minLeadTimeMin} onChange={(e) => setConfig('minLeadTimeMin', Number(e.target.value))} />
            </div>
            <div className="admin-field">
              <label htmlFor="inactivity">Inatividade do totem (s)</label>
              <input id="inactivity" type="number" min={30} max={300} value={form.config.inactivityTimeout} onChange={(e) => setConfig('inactivityTimeout', Number(e.target.value))} />
            </div>
          </div>
        </section>

        {error && <div className="admin-error" role="alert">{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" className="admin-btn admin-btn--ghost" style={{ flex: 1 }} onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" style={{ flex: 2 }} disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar loja'}
          </button>
        </div>
      </form>
    </div>
  )
}
