ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'FRIOS';

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "badge" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rating" DECIMAL(2,1);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "review_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cut_types" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ean" TEXT;

ALTER TABLE "store_products" ADD COLUMN IF NOT EXISTS "external_product_code" TEXT;
DO $$ BEGIN
  CREATE TYPE "PriceSource" AS ENUM ('MANUAL', 'INTEGRATION');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE "store_products" ADD COLUMN IF NOT EXISTS "price_source" "PriceSource" NOT NULL DEFAULT 'MANUAL';

CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_key" ON "products"("sku");
CREATE UNIQUE INDEX IF NOT EXISTS "store_products_storeId_external_product_code_key" ON "store_products"("storeId", "external_product_code");
