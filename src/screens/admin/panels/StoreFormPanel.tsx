import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { getAdminToken } from '../../../lib/adminAuth'

type StoreData = {
  name: string; chain: string; slug: string; active: boolean
  config: {
    primaryColor: string; primaryDark: string; accentColor: string
    logoUrl: string; morningOpen: string; morningClose: string
    afternoonOpen: string; afternoonClose: string
    slotIntervalMin: number; minLeadTimeMin: number; inactivityTimeout: number
  }
}

const CHAINS = [
  { value: 'CORTE_SUPERMERCADO', label: 'Corte Supermercado' },
  { value: 'PAO_DE_ACUCAR',      label: 'Pão de Açúcar' },
  { value: 'EXTRA',              label: 'Extra' },
  { value: 'VIOLETA',            label: 'Violeta' },
  { value: 'CARREFOUR',          label: 'Carrefour' },
  { value: 'OUTROS',             label: 'Outros' },
]

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
  const [form, setForm]     = useState<StoreData>(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const isEdit = !!storeId

  useEffect(() => {
    if (!storeId) { setForm(DEFAULT); return }
    setLoading(true)
    api.get<any>(`/admin/stores/${storeId}`, getAdminToken() ?? '').then(data => {
      setForm({
        name: data.name, chain: data.chain, slug: data.slug, active: data.active,
        config: { ...DEFAULT.config, ...data.config, logoUrl: data.config?.logoUrl ?? '' },
      })
    }).finally(() => setLoading(false))
  }, [storeId])

  function setField(field: keyof StoreData, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function setConfig(field: string, value: any) {
    setForm(f => ({ ...f, config: { ...f.config, [field]: value } }))
  }

  function autoSlug(name: string) {
    if (isEdit) return
    setField('slug', name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const token = getAdminToken() ?? ''
      const payload = { ...form, config: { ...form.config, logoUrl: form.config.logoUrl || null } }
      if (isEdit) {
        await api.put(`/admin/stores/${storeId}`, payload, token)
      } else {
        await api.post('/admin/stores', payload, token)
      }
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  if (loading) return <div style={{ color: 'rgba(255,255,255,.4)', padding: 40 }}>Carregando...</div>

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 20, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{isEdit ? 'Editar loja' : 'Nova loja'}</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Dados básicos */}
        <Section title="Dados da loja">
          <Row>
            <Field label="Nome da loja">
              <input style={inputStyle} value={form.name} required
                onChange={e => { setField('name', e.target.value); autoSlug(e.target.value) }} />
            </Field>
            <Field label="Rede">
              <select style={inputStyle} value={form.chain} onChange={e => setField('chain', e.target.value)}>
                {CHAINS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Slug (URL)" hint="Apenas letras minúsculas, números e hífens">
              <input style={inputStyle} value={form.slug} required disabled={isEdit}
                onChange={e => setField('slug', e.target.value)} />
            </Field>
          </Row>
        </Section>

        {/* Identidade visual */}
        <Section title="Identidade visual">
          <Row>
            <Field label="Cor principal">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.config.primaryColor} onChange={e => setConfig('primaryColor', e.target.value)} style={{ width: 44, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
                <input style={{ ...inputStyle, flex: 1 }} value={form.config.primaryColor} onChange={e => setConfig('primaryColor', e.target.value)} />
              </div>
            </Field>
            <Field label="Cor escura">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.config.primaryDark} onChange={e => setConfig('primaryDark', e.target.value)} style={{ width: 44, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
                <input style={{ ...inputStyle, flex: 1 }} value={form.config.primaryDark} onChange={e => setConfig('primaryDark', e.target.value)} />
              </div>
            </Field>
            <Field label="Cor de destaque">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.config.accentColor} onChange={e => setConfig('accentColor', e.target.value)} style={{ width: 44, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
                <input style={{ ...inputStyle, flex: 1 }} value={form.config.accentColor} onChange={e => setConfig('accentColor', e.target.value)} />
              </div>
            </Field>
          </Row>
          <Field label="URL da logo" hint="Link público da imagem (PNG/SVG)">
            <input style={inputStyle} value={form.config.logoUrl} placeholder="https://..." onChange={e => setConfig('logoUrl', e.target.value)} />
          </Field>
        </Section>

        {/* Horários */}
        <Section title="Horários de funcionamento">
          <Row>
            <Field label="Manhã — abertura"><input style={inputStyle} type="time" value={form.config.morningOpen} onChange={e => setConfig('morningOpen', e.target.value)} /></Field>
            <Field label="Manhã — fechamento"><input style={inputStyle} type="time" value={form.config.morningClose} onChange={e => setConfig('morningClose', e.target.value)} /></Field>
            <Field label="Tarde — abertura"><input style={inputStyle} type="time" value={form.config.afternoonOpen} onChange={e => setConfig('afternoonOpen', e.target.value)} /></Field>
            <Field label="Tarde — fechamento"><input style={inputStyle} type="time" value={form.config.afternoonClose} onChange={e => setConfig('afternoonClose', e.target.value)} /></Field>
          </Row>
          <Row>
            <Field label="Intervalo entre slots (min)">
              <input style={inputStyle} type="number" min={5} max={120} value={form.config.slotIntervalMin} onChange={e => setConfig('slotIntervalMin', Number(e.target.value))} />
            </Field>
            <Field label="Antecedência mínima (min)">
              <input style={inputStyle} type="number" min={0} max={120} value={form.config.minLeadTimeMin} onChange={e => setConfig('minLeadTimeMin', Number(e.target.value))} />
            </Field>
            <Field label="Inatividade do totem (s)">
              <input style={inputStyle} type="number" min={30} max={300} value={form.config.inactivityTimeout} onChange={e => setConfig('inactivityTimeout', Number(e.target.value))} />
            </Field>
          </Row>
        </Section>

        {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onBack} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar loja'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#1a1a1c', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>{children}</div>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>{hint}</div>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)',
  background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}
const btnPrimary:   React.CSSProperties = { padding: '12px', borderRadius: 10, border: 'none', background: '#C0272D', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnSecondary: React.CSSProperties = { padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
