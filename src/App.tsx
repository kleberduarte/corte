import { useEffect, useRef, useState, useCallback } from 'react'
import { applyStoreTheme } from './data/theme'
import { fetchActiveStore, StoreContext, useStore } from './data/config'
import type { StoreConfig } from './data/config'
import { useCartStore } from './store/cartStore'
import { useKanbanStore } from './store/kanbanStore'
import type { Product, CutType } from './data/products'

import Topbar from './components/Topbar'
import InactivityOverlay from './components/InactivityOverlay'
import StepProgress from './components/StepProgress'
import HomeScreen from './screens/cliente/HomeScreen'
import PickupModeScreen, { type PickupMode } from './screens/cliente/PickupModeScreen'
import FlowChoiceScreen, { type FlowChoice } from './screens/cliente/FlowChoiceScreen'
import CategoriesScreen from './screens/cliente/CategoriesScreen'
import CatalogScreen from './screens/cliente/CatalogScreen'
import DetailScreen from './screens/cliente/DetailScreen'
import ScheduleScreen from './screens/cliente/ScheduleScreen'
import PhoneScreen from './screens/cliente/PhoneScreen'
import PrintScreen from './screens/cliente/PrintScreen'
import OrderTrackingScreen from './screens/cliente/OrderTrackingScreen'
import KanbanScreen from './screens/operador/KanbanScreen'
import AdminApp from './screens/admin/AdminApp'

type ClienteScreen = 'home' | 'pickup-mode' | 'flow-choice' | 'categories' | 'catalog' | 'detail' | 'schedule' | 'phone' | 'print'

const INACTIVITY_MS = 90_000
const COUNTDOWN_S   = 15
const IMMEDIATE_SLOT = 'Imediata'
const PREFERENTIAL_SLOT = 'Preferencial'

function getBackScreen(screen: ClienteScreen, pickupMode: PickupMode, counterOnly: boolean): ClienteScreen {
  const map: Record<ClienteScreen, ClienteScreen> = {
    home: 'home',
    'pickup-mode': 'home',
    'flow-choice': 'pickup-mode',
    categories: 'flow-choice',
    catalog: 'categories',
    detail: 'catalog',
    schedule: 'detail',
    phone: pickupMode === 'immediate' ? 'detail' : 'schedule',
    print: counterOnly ? 'flow-choice' : 'phone',
  }
  return map[screen]
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
  const store = useStore()
  const [screen, setScreen]               = useState<ClienteScreen>('home')
  const [screenKey, setScreenKey]         = useState(0)
  const [catalogFilter, setCatalogFilter] = useState('todos')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCut, setSelectedCut]     = useState<CutType | null>(null)
  const [pickupMode, setPickupMode]       = useState<PickupMode>('scheduled')
  const [counterOnly, setCounterOnly]     = useState(false)
  const [scheduleWeight, setScheduleWeight] = useState(1.5)
  const [scheduleSlot, setScheduleSlot]   = useState('')

  const { items, setPrimaryItem, setItems, addItem, hasProduct, updateAllWeights, confirmOrder, createCounterTicket, currentOrder, reset } = useCartStore()
  const { addOrder } = useKanbanStore()

  const handleReset = useCallback(() => {
    reset()
    setSelectedProduct(null)
    setPickupMode('scheduled')
    setCounterOnly(false)
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
    if (pickupMode === 'immediate') {
      setScheduleSlot(IMMEDIATE_SLOT)
      go('phone')
    } else {
      go('schedule')
    }
  }

  function handlePickupModeSelect(mode: PickupMode) {
    setPickupMode(mode)
    go('flow-choice')
  }

  async function handleFlowChoice(choice: FlowChoice) {
    if (choice === 'categories') {
      setCounterOnly(false)
      go('categories')
      return
    }
    setCounterOnly(true)
    const isPreferential = choice === 'preferential'
    const slot = isPreferential
      ? PREFERENTIAL_SLOT
      : pickupMode === 'immediate'
        ? IMMEDIATE_SLOT
        : 'Balcão'
    const order = await createCounterTicket(store.id, slot, { priority: isPreferential })
    addOrder(order)
    go('print')
  }

  function handleCartCheckout() {
    if (pickupMode === 'immediate') {
      setScheduleSlot(IMMEDIATE_SLOT)
      go('phone')
    } else {
      go('schedule')
    }
  }

  function handleAddCombo(p: Product) {
    addItem({ product: p, cutType: p.cutTypes[0], weightKg: scheduleWeight, estimatedPrice: p.pricePerKg * scheduleWeight })
  }

  function handleCustomizeCombo(p: Product) { setSelectedProduct(p); setSelectedCut(p.cutTypes[0]); go('detail') }

  function handleConfirmSchedule(slot: string, weight: number) {
    setScheduleSlot(slot); setScheduleWeight(weight); updateAllWeights(weight); go('phone')
  }

  async function handlePhone(phone: string) {
    if (items.length === 0) return
    setCounterOnly(false)
    const order = await confirmOrder(store.id, scheduleSlot, phone)
    addOrder(order)
    go('print')
  }

  function handleDone() {
    reset()
    setSelectedProduct(null)
    setCounterOnly(false)
    go('home')
  }

  const showBack   = screen !== 'home'
  const hideTopbar = screen === 'home' || screen === 'print'
  const STEP_SCREENS: ClienteScreen[] = pickupMode === 'immediate'
    ? ['catalog', 'detail', 'phone', 'print']
    : ['catalog', 'detail', 'schedule', 'phone', 'print']
  const stepIndex  = STEP_SCREENS.indexOf(screen)

  return (
    <div className="totem-shell">
      {screen === 'home' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30 }}>
          <Topbar hideStatus />
        </div>
      )}
      {!hideTopbar && <Topbar showBack={showBack} onBack={() => go(getBackScreen(screen, pickupMode, counterOnly))} />}
      {stepIndex >= 0 && <StepProgress current={stepIndex} total={STEP_SCREENS.length} />}

      {screen === 'home'        && <HomeScreen key={screenKey} onStart={() => go('pickup-mode')} />}
      {screen === 'pickup-mode' && <PickupModeScreen key={screenKey} onSelect={handlePickupModeSelect} />}
      {screen === 'flow-choice' && <FlowChoiceScreen key={screenKey} onSelect={handleFlowChoice} />}
      {screen === 'categories'  && <CategoriesScreen key={screenKey} onSelect={handleCategorySelect} />}
      {screen === 'catalog'     && (
        <CatalogScreen
          key={`catalog-${catalogFilter}-${screenKey}`}
          initialFilter={catalogFilter}
          onProduct={handleProductSelect}
          cartCount={items.length}
          onCart={handleCartCheckout}
          immediate={pickupMode === 'immediate'}
        />
      )}
      {screen === 'detail' && selectedProduct && (
        <DetailScreen
          key={selectedProduct.id}
          product={selectedProduct}
          immediate={pickupMode === 'immediate'}
          onSchedule={handleSchedule}
        />
      )}
      {screen === 'schedule'   && selectedProduct && selectedCut && (
        <ScheduleScreen
          key={`schedule-${screenKey}`}
          product={selectedProduct}
          cutType={selectedCut}
          weightKg={scheduleWeight}
          cartItems={items}
          onConfirm={handleConfirmSchedule}
          onAddCombo={handleAddCombo}
          onCustomizeCombo={handleCustomizeCombo}
        />
      )}
      {screen === 'phone' && items.length > 0 && (
        <PhoneScreen
          items={items}
          slotTime={scheduleSlot}
          immediate={pickupMode === 'immediate'}
          onConfirm={handlePhone}
        />
      )}
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
  const view = new URLSearchParams(window.location.search).get('view')
  if (view === 'admin') return <AdminApp />
  return <TotemApp view={view} />
}

function TotemApp({ view }: { view: string | null }) {
  const [store, setStore] = useState<StoreConfig | null>(null)

  useEffect(() => {
    fetchActiveStore().then((s) => {
      applyStoreTheme(s)
      setStore(s)
    })
  }, [])

  if (!store) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0e', color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
      Carregando...
    </div>
  )

  if (store.active === false) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d0d0e', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>🔪</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{store.name}</div>
      <div style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', maxWidth: 340, lineHeight: 1.6 }}>
        Este serviço está temporariamente indisponível.<br />Por favor, procure um funcionário do açougue.
      </div>
    </div>
  )

  const trackingOrderId = new URLSearchParams(window.location.search).get('id')

  return (
    <StoreContext.Provider value={store}>
      {view === 'operador' ? (
        <OperadorView />
      ) : view === 'pedido' && trackingOrderId ? (
        <OrderTrackingScreen orderId={trackingOrderId} />
      ) : (
        <ClienteView />
      )}
    </StoreContext.Provider>
  )
}
