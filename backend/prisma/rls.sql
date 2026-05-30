-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — Cortes App
--
-- Esta é a SEGUNDA camada de isolamento multi-tenant (a primeira é o código).
-- O RLS garante que mesmo uma query mal escrita ou um bug no código nunca
-- vaze dados de uma loja para outra — o PostgreSQL bloqueia no banco.
--
-- COMO APLICAR:
--   Execute este script MANUALMENTE após rodar `prisma migrate deploy`.
--   Ele não faz parte das migrations do Prisma pois o Prisma não gerencia RLS.
--   No Railway: Settings > Database > Query Runner > cole e execute.
--   Localmente: psql $DATABASE_URL -f prisma/rls.sql
--
-- COMO FUNCIONA:
--   1. Criamos um usuário de aplicação (app_user) com menos privilégios
--   2. Ativamos RLS nas tabelas com dados por loja
--   3. Definimos políticas que permitem acesso apenas quando
--      current_setting('app.current_store_id') bate com o storeId da linha
--   4. O backend seta essa variável de sessão antes de cada query sensível
--      (ver src/config/database.ts — extensão com $executeRaw)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Usuário de aplicação (permissões reduzidas — não é superuser)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'troque-esta-senha-no-railway';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE postgres TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Garante que novas tabelas criadas por migrations também recebem as permissões
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- ---------------------------------------------------------------------------
-- 2. Habilitar RLS nas tabelas com dados por loja
-- ---------------------------------------------------------------------------
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators          ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_integrations ENABLE ROW LEVEL SECURITY;

-- Tabelas globais (sem isolamento por loja) — sem RLS
-- stores, products: leitura liberada para todos os tenants

-- ---------------------------------------------------------------------------
-- 3. Políticas de acesso — somente linhas da loja da sessão
-- ---------------------------------------------------------------------------

-- orders
CREATE POLICY orders_tenant_isolation ON orders
  USING (store_id = current_setting('app.current_store_id', true));

-- order_items (acesso via orderId que já é protegido, mas defense-in-depth)
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
-- 4. Superuser e migrations ficam isentos do RLS
--    (BYPASSRLS é automático para superuser — migrações do Prisma não quebram)
-- ---------------------------------------------------------------------------

-- Confirma que o owner das tabelas (superuser da migration) bypassa o RLS
-- Isso é automático no PostgreSQL para roles com SUPERUSER ou BYPASSRLS

-- ---------------------------------------------------------------------------
-- VERIFICAÇÃO — rode após aplicar para confirmar que o RLS está ativo
-- ---------------------------------------------------------------------------
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
