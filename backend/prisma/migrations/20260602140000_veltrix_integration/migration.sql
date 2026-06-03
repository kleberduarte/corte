-- Integração Veltrix ERP

ALTER TYPE "IntegrationType" ADD VALUE IF NOT EXISTS 'VELTRIX';

ALTER TABLE "store_integrations" ADD COLUMN IF NOT EXISTS "integration_meta" JSONB;
