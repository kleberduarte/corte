import { useEffect, useRef, useState, useCallback } from 'react'
import { THEMES, DEFAULT_THEME, applyTheme } from './data/theme'
import { fetchActiveStore, StoreContext } from './data/config'
import type { StoreConfig } from './data/config'
import { useCartStore } from './store/cartStore'
import { useKanbanStore } from './store/kanbanStore'
import type { Product, CutType } from './data/products'

import Topbar from './components/Topbar'
import InactivityOverlay from './components/InactivityOverlay'
import StepProgress from './components/StepProgress'
import HomeScreen from './screens/cliente/HomeScreen'
import CategoriesScreen from './screens/cliente/CategoriesScreen'
import CatalogScreen from './screens/cliente/CatalogScreen'
import DetailScreen from './screens/cliente/DetailScreen'
import ScheduleScreen from './screens/cliente/ScheduleScreen'
import PhoneScreen from './screens/cliente/PhoneScreen'
import PrintScreen from './screens/cliente/PrintScreen'
import KanbanScreen from './screens/operador/KanbanScreen'

type ClienteScreen = 'home' | 'categories' | 'catalog' | 'detail' | 'schedule' | 'phone' | 'print'

const INACTIVITY_MS = 90_000
const COUNTDOWN_S   = 15

const BACK_MAP: Record<ClienteScreen, ClienteScreen> = {
  home: 'home', categories: 'home', catalog: 'categories',
  detail: 'catalog', schedule: 'detail', phone: 'schedule', print: 'phone',
}

// ─── Hook de inatividade com countdown ───────────────────────────────────────
function useInactivity(onReset: () => void) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const mainTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countTimer  = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = () => {
    if (mainTimer.current)  clearTimeout(mainTimer.current)
    if (countTimer.current) clearInterval(countTimer.current)
    mainTimer.current = countTimer.current = null
  }

  const reset = useCallback(() => {
    clear()
    setCountdown(null)
    mainTimer.current = setTimeout(() => {
      setCountdown(COUNTDOWN_S)
      let s = COUNTDOWN_S
      countTimer.current = setInterval(() => {
        s -= 1
        setCountdown(s)
        if (s <= 0) { clear(); setCountdown(null); onReset() }
      }, 1000)
    }, INACTIVITY_MS - COUNTDOWN_S * 1000)
  }, [onReset])

  const dismiss = useCallback(() => reset(), [reset])

  useEffect(() => {
    reset()
    const events = ['touchstart', 'mousedown', 'keydown'] as const
    const handler = () => { if (countTimer.current === null) reset() }
    events.forEach((e) => document.addEventListener(e, handler))
    return () => { clear(); events.forEach((e) => document.removeEventListener(e, handler)) }
  }, [reset])

  return { countdown, dismiss }
}

// ─── View do Cliente ─────────────────────────────────────────────────────────
function ClienteView() {
  const [screen, setScreen]               = useState<ClienteScreen>('home')
  const [screenKey, setScreenKey]         = useState(0)
  const [catalogFilter, setCatalogFilter] = useState('todos')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCut, setSelectedCut]     = useState<CutType | null>(null)
  const [scheduleWeight, setScheduleWeight] = useState(1.5)
  const [scheduleSlot, setScheduleSlot]   = useState('')

  const { items, setPrimaryItem, setItems, addItem, hasProduct, updateAllWeights, confirmOrder, currentOrder, reset } = useCartStore()
  const { addOrder } = useKanbanStore()

  const handleReset = useCallback(() => {
    reset()
    setSelectedProduct(null)
    setScreen('home')
    setScreenKey((k) => k + 1)
  }, [reset])

  const { countdown, dismiss } = useInactivity(handleReset)

  function go(s: ClienteScreen) { setScreen(s); setScreenKey((k) => k + 1) }

  function handleCategorySelect(filter: string) { setCatalogFilter(filter); go('catalog') }
  function handleProductSelect(p: Product) { setSelectedProduct(p); go('detail') }

  function handleSchedule(cut: CutType, weight: number) {
    if (!selectedProduct) return
    setSelectedCut(cut)
    setScheduleWeight(weight)
    const item = { product: selectedProduct, cutType: cut, weightKg: weight, estimatedPrice: selectedProduct.pricePerKg * weight }
    if (hasProduct(selectedProduct.id)) {
      setItems(items.map((i) => (i.product.id === selectedProduct.id ? item : i)))
    } else if (items.length === 0) {
      setPrimaryItem(item)
    } else {
      addItem(item)
    }
    go('schedule')
  }

  function handleAddCombo(p: Product) {
    addItem({ product: p, cutType: p.cutTypes[0], weightKg: scheduleWeight, estimatedPrice: p.pricePerKg * scheduleWeight })
  }

  function handleCustomizeCombo(p: Product) { setSelectedProduct(p); setSelectedCut(p.cutTypes[0]); go('detail') }

  function handleConfirmSchedule(slot: string, weight: number) {
    setScheduleSlot(slot); setScheduleWeight(weight); updateAllWeights(weight); go('phone')
  }

  function handlePhone(phone: string) {
    if (items.length === 0) return
    const order = confirmOrder(scheduleSlot, phone)
    addOrder(order)
    go('print')
  }

  function handleDone() { reset(); setSelectedProduct(null); go('home') }

  const showBack   = !(['home', 'categories'] as ClienteScreen[]).includes(screen)
  const hideTopbar = screen === 'home' || screen === 'print'
  const STEP_SCREENS: ClienteScreen[] = ['catalog', 'detail', 'schedule', 'phone', 'print']
  const stepIndex  = STEP_SCREENS.indexOf(screen)

  return (
    <div className="totem-shell">
      {screen === 'home' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30 }}>
          <Topbar hideStatus />
        </div>
      )}
      {!hideTopbar && <Topbar showBack={showBack} onBack={() => go(BACK_MAP[screen])} />}
      {stepIndex >= 0 && <StepProgress current={stepIndex} total={STEP_SCREENS.length} />}

      {screen === 'home'       && <HomeScreen key={screenKey} onStart={() => go('categories')} />}
      {screen === 'categories' && <CategoriesScreen key={screenKey} onSelect={handleCategorySelect} />}
      {screen === 'catalog'    && <CatalogScreen key={`catalog-${catalogFilter}-${screenKey}`} initialFilter={catalogFilter} onProduct={handleProductSelect} cartCount={items.length} onCart={() => go('schedule')} />}
      {screen === 'detail'     && selectedProduct && <DetailScreen key={selectedProduct.id} product={selectedProduct} onSchedule={handleSchedule} />}
      {screen === 'schedule'   && selectedProduct && selectedCut && (
        <ScheduleScreen
          product={selectedProduct}
          cutType={selectedCut}
          weightKg={scheduleWeight}
          cartItems={items}
          onConfirm={handleConfirmSchedule}
          onAddCombo={handleAddCombo}
          onCustomizeCombo={handleCustomizeCombo}
        />
      )}
      {screen === 'phone' && items.length > 0 && <PhoneScreen items={items} slotTime={scheduleSlot} onConfirm={handlePhone} />}
      {screen === 'print' && currentOrder       && <PrintScreen order={currentOrder} onDone={handleDone} />}

      {countdown !== null && (
        <InactivityOverlay secondsLeft={countdown} onContinue={dismiss} onReset={handleReset} />
      )}
      <ModeBadge label="Cliente" />
    </div>
  )
}

// ─── View do Operador ─────────────────────────────────────────────────────────
function OperadorView() {
  return (
    <div className="totem-shell">
      <KanbanScreen />
      <ModeBadge label="Operador" />
    </div>
  )
}

function ModeBadge({ label }: { label: string }) {
  return (
    <div style={{
      position: 'fixed', bottom: 10, left: 10, zIndex: 9999,
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
      padding: '5px 10px', borderRadius: 8,
      background: 'rgba(0,0,0,.55)', color: 'rgba(255,255,255,.75)',
      border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
      pointerEvents: 'none',
    }}>
      Totem · {label}
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [store, setStore] = useState<StoreConfig | null>(null)

  useEffect(() => {
    fetchActiveStore()
      .then((s) => {
        const theme = THEMES[s.themeKey] ?? DEFAULT_THEME
        applyTheme(theme)
        setStore(s)
      })
      .catch(() => {
        applyTheme(DEFAULT_THEME)
        setStore({ id: 'fallback', name: 'Açougue', themeKey: 'pao-de-acucar', hours: { morning: { open: '08:00', close: '12:00' }, afternoon: { open: '14:00', close: '21:00' } }, slotIntervalMin: 30, minLeadTimeMin: 30, mockFullSlotIndexes: [] })
      })
  }, [])

  if (!store) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0e', color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
      Carregando...
    </div>
  )

  const view = new URLSearchParams(window.location.search).get('view')

  return (
    <StoreContext.Provider value={store}>
      {view === 'operador' ? <OperadorView /> : <ClienteView />}
    </StoreContext.Provider>
  )
}
