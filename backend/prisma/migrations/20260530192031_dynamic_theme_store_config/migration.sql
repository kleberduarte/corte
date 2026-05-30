-- Migração: tema dinâmico por loja
-- Adiciona campos de horário detalhado e identidade visual ao store_configs

-- Novos campos de horário (mantém openingTime/closingTime como base para migrar)
ALTER TABLE "store_configs"
  ADD COLUMN IF NOT EXISTS "morningOpen"    TEXT NOT NULL DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS "morningClose"   TEXT NOT NULL DEFAULT '12:00',
  ADD COLUMN IF NOT EXISTS "afternoonOpen"  TEXT NOT NULL DEFAULT '14:00',
  ADD COLUMN IF NOT EXISTS "afternoonClose" TEXT NOT NULL DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS "minLeadTimeMin" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "primaryDark"    TEXT NOT NULL DEFAULT '#7A1015',
  ADD COLUMN IF NOT EXISTS "accentColor"    TEXT NOT NULL DEFAULT '#F5EDDB',
  ADD COLUMN IF NOT EXISTS "fontFamily"     TEXT;

-- Migra openingTime -> morningOpen e closingTime -> afternoonClose
UPDATE "store_configs" SET
  "morningOpen"    = COALESCE("openingTime", '08:00'),
  "afternoonClose" = COALESCE("closingTime", '22:00');

-- Remove colunas antigas
ALTER TABLE "store_configs"
  DROP COLUMN IF EXISTS "openingTime",
  DROP COLUMN IF EXISTS "closingTime";
