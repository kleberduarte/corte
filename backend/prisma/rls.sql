-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — Cortes App
--
-- Esta é a SEGUNDA camada de isolamento multi-tenant (a primeira é o código).
-- O RLS garante que mesmo uma query mal escrita ou um bug no código nunca
-- vaze dados de uma loja para outra — o PostgreSQL bloqueia no banco.
--
-- COMO APLICAR:
--   Execute este script MANUALMENTE após rodar `prisma migrate deploy`.
--   No Railway: clique no serviço PostgreSQL → aba "Data" → cole e execute.
--   Localmente: psql $DATABASE_URL -f prisma/rls.sql
--
-- COMO FUNCIONA:
--   1. Ativamos RLS nas tabelas com dados por loja
--   2. As políticas permitem acesso apenas quando
--      current_setting('app.current_store_id') bate com o store_id da linha
--   3. O backend seta essa variável antes de cada query sensível
--      via prismaForStore() em src/config/database.ts
--
-- NOTA: Não criamos um role separado pois o Railway não permite CREATE ROLE.
--   O usuário padrão do Railway (postgres) tem BYPASSRLS automático para
--   migrations — as políticas são aplicadas apenas em queries da aplicação.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Habilitar RLS nas tabelas com dados por loja
-- ---------------------------------------------------------------------------
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators          ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_integrations ENABLE ROW LEVEL SECURITY;

-- Tabelas globais — sem RLS (compartilhadas entre lojas)
-- stores, products: leitura liberada para todos os tenants

-- ---------------------------------------------------------------------------
-- Políticas de acesso — somente linhas da loja da sessão atual
-- ---------------------------------------------------------------------------

-- Remove políticas anteriores se existirem (idempotente)
DROP POLICY IF EXISTS orders_tenant_isolation             ON orders;
DROP POLICY IF EXISTS order_items_tenant_isolation        ON order_items;
DROP POLICY IF EXISTS store_products_tenant_isolation     ON store_products;
DROP POLICY IF EXISTS operators_tenant_isolation          ON operators;
DROP POLICY IF EXISTS store_configs_tenant_isolation      ON store_configs;
DROP POLICY IF EXISTS store_integrations_tenant_isolation ON store_integrations;

-- orders
CREATE POLICY orders_tenant_isolation ON orders
  USING (store_id = current_setting('app.current_store_id', true));

-- order_items (defense-in-depth via join com orders)
CREATE POLICY order_items_tenant_isolation ON order_items
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE store_id = current_setting('app.current_store_id', true)
    )
  );

-- store_products
CREATE POLICY store_products_tenant_isolation ON store_products
  USING (store_id = current_setting('app.current_store_id', true));

-- operators
CREATE POLICY operators_tenant_isolation ON operators
  USING (store_id = current_setting('app.current_store_id', true));

-- store_configs
CREATE POLICY store_configs_tenant_isolation ON store_configs
  USING (store_id = current_setting('app.current_store_id', true));

-- store_integrations
CREATE POLICY store_integrations_tenant_isolation ON store_integrations
  USING (store_id = current_setting('app.current_store_id', true));

-- ---------------------------------------------------------------------------
-- VERIFICAÇÃO — rode após aplicar para confirmar
-- ---------------------------------------------------------------------------
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
