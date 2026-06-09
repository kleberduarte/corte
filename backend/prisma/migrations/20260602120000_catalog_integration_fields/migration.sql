-- Catálogo completo no banco + campos para integração com ERPs de supermercado

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('MANUAL', 'INTEGRATION');

-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'FRIOS';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "rating" DECIMAL(2,1),
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "cut_types" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "ean" TEXT;

-- AlterTable
ALTER TABLE "store_products" ADD COLUMN     "external_product_code" TEXT,
ADD COLUMN     "price_source" "PriceSource" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "store_products_storeId_external_product_code_key" ON "store_products"("storeId", "external_product_code");
