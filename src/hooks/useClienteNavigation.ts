import type { PickupMode } from '../screens/cliente/PickupModeScreen'

export type ClienteScreen =
  | 'home' | 'pickup-mode' | 'flow-choice' | 'categories'
  | 'catalog' | 'detail' | 'cart' | 'schedule' | 'phone' | 'print'

export function getBackScreen(
  screen: ClienteScreen,
  pickupMode: PickupMode,
  counterOnly: boolean,
): ClienteScreen {
  const map: Record<ClienteScreen, ClienteScreen> = {
    home:          'home',
    'pickup-mode': 'home',
    'flow-choice': 'pickup-mode',
    categories:    pickupMode === 'scheduled' ? 'pickup-mode' : 'flow-choice',
    catalog:       'categories',
    detail:        'catalog',
    cart:          'catalog',
    schedule:      'cart',
    phone:         pickupMode === 'immediate' ? 'cart' : 'schedule',
    print:         counterOnly ? 'flow-choice' : 'phone',
  }
  return map[screen]
}
