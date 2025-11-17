-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'GENERATED', 'SENT', 'ERROR');

-- CreateTable
CREATE TABLE "EtsyShop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "etsyShopId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EtsyShop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtsyListing" (
    "id" SERIAL NOT NULL,
    "etsyListingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "shopId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EtsyListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "etsyReceiptId" TEXT NOT NULL,
    "etsyTransactionId" TEXT,
    "buyerName" TEXT,
    "buyerUserId" TEXT,
    "personalization" TEXT,
    "name" TEXT,
    "age" TEXT,
    "question" TEXT,
    "productCode" TEXT NOT NULL,
    "shopId" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "readingText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "externalUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EtsyShop_etsyShopId_key" ON "EtsyShop"("etsyShopId");

-- CreateIndex
CREATE UNIQUE INDEX "EtsyListing_etsyListingId_key" ON "EtsyListing"("etsyListingId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_etsyReceiptId_key" ON "Order"("etsyReceiptId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_slug_key" ON "Shop"("slug");

-- AddForeignKey
ALTER TABLE "EtsyListing" ADD CONSTRAINT "EtsyListing_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "EtsyShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "EtsyShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
