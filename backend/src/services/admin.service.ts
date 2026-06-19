// Barrel re-export — responsabilidades separadas em:
//   admin-auth.service.ts  (autenticação + stats)
//   store.service.ts       (CRUD de lojas)
//   operator.service.ts    (CRUD de operadores)
export * from './admin-auth.service'
export * from './store.service'
export * from './operator.service'
