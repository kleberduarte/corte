-- =============================================================================
-- CORTES APP — Reset parcial do banco (PostgreSQL)
--
-- Remove pedidos e catálogo, preservando admins, lojas e operadores.
--
-- Removido:
--   order_items, orders, store_products, products
--
-- Preservado:
--   admins, stores, store_configs, store_integrations, operators
--   (+ enums, schema, migrations, RLS)
--
-- Importante: lojas NÃO são apagadas porque operators.storeId → stores.id
-- usa ON DELETE CASCADE — deletar lojas apagaria os operadores também.
--
-- COMO EXECUTAR:
--   Local (Docker):
--     psql "postgresql://cortes:cortes123@localhost:5435/cortes_app" -f backend/prisma/reset-except-admin.sql
--
--   Railway / produção:
--     psql "$DATABASE_URL" -f backend/prisma/reset-except-admin.sql
--
--   Ou cole no console SQL do Railway (PostgreSQL → Data → Query).
--
-- APÓS O RESET:
--   1. Opcional: repopule o catálogo global
--        node backend/prisma/bootstrap-catalog.cjs --force
--   2. Reconfigure preços/disponibilidade por loja no painel admin
--
-- ATENÇÃO: operação irreversível. Faça backup antes em produção.
-- =============================================================================

BEGIN;

-- 1. Pedidos (filhos antes dos pais)
DELETE FROM order_items;
DELETE FROM orders;

-- 2. Vínculos loja ↔ produto (bloqueia DELETE em products enquanto existir)
DELETE FROM store_products;

-- 3. Catálogo global
DELETE FROM products;

-- Opcional: manter apenas um admin específico (descomente e ajuste o e-mail)
-- DELETE FROM admins WHERE email <> 'admin@corte.com.br';

COMMIT;

-- ---------------------------------------------------------------------------
-- Resumo pós-reset
-- ---------------------------------------------------------------------------
SELECT 'admins'              AS tabela, COUNT(*) AS registros FROM admins
UNION ALL SELECT 'stores',             COUNT(*) FROM stores
UNION ALL SELECT 'store_configs',      COUNT(*) FROM store_configs
UNION ALL SELECT 'store_integrations', COUNT(*) FROM store_integrations
UNION ALL SELECT 'operators',         COUNT(*) FROM operators
UNION ALL SELECT 'products',          COUNT(*) FROM products
UNION ALL SELECT 'store_products',    COUNT(*) FROM store_products
UNION ALL SELECT 'orders',            COUNT(*) FROM orders
UNION ALL SELECT 'order_items',       COUNT(*) FROM order_items
ORDER BY tabela;
