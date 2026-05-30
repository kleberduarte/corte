-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('PAO_DE_ACUCAR', 'EXTRA', 'VIOLETA', 'CARREFOUR', 'OUTROS');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('LINX', 'TOTVS', 'SAP', 'GENERIC_REST', 'MANUAL');

-- CreateEnum
CREATE TYPE "OperatorRole" AS ENUM ('OPERATOR', 'MANAGER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BOVINO', 'SUINO', 'FRANGO', 'LINGUICA', 'OUTROS');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('KG', 'UNIDADE', 'BANDEJA');

-- CreateEnum
CREATE TYPE "PickupMode" AS ENUM ('SCHEDULED', 'IMMEDIATE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_configs" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "openingTime" TEXT NOT NULL,
    "closingTime" TEXT NOT NULL,
    "slotIntervalMin" INTEGER NOT NULL DEFAULT 15,
    "maxOrdersPerSlot" INTEGER NOT NULL DEFAULT 5,
    "inactivityTimeout" INTEGER NOT NULL DEFAULT 90,
    "primaryColor" TEXT NOT NULL DEFAULT '#6B21A8',
    "logoUrl" TEXT,

    CONSTRAINT "store_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_integrations" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "apiBaseUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER NOT NULL DEFAULT 60,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncOk" BOOLEAN,

    CONSTRAINT "store_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "OperatorRole" NOT NULL DEFAULT 'OPERATOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "unit" "Unit" NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_products" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "pickupCode" TEXT NOT NULL,
    "customerPhone" TEXT,
    "pickupMode" "PickupMode" NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "cutType" TEXT,
    "quantity" DECIMAL(8,3) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "store_configs_storeId_key" ON "store_configs"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "store_integrations_storeId_key" ON "store_integrations"("storeId");

-- CreateIndex
CREATE INDEX "operators_storeId_idx" ON "operators"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "operators_storeId_email_key" ON "operators"("storeId", "email");

-- CreateIndex
CREATE INDEX "store_products_storeId_idx" ON "store_products"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "store_products_storeId_productId_key" ON "store_products"("storeId", "productId");

-- CreateIndex
CREATE INDEX "orders_storeId_status_idx" ON "orders"("storeId", "status");

-- CreateIndex
CREATE INDEX "orders_storeId_scheduledAt_idx" ON "orders"("storeId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_storeId_orderNumber_key" ON "orders"("storeId", "orderNumber");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- AddForeignKey
ALTER TABLE "store_configs" ADD CONSTRAINT "store_configs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_integrations" ADD CONSTRAINT "store_integrations_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operators" ADD CONSTRAINT "operators_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
