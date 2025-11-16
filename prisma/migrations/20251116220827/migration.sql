-- CreateTable
CREATE TABLE "EtsyShop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "etsyShopId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EtsyListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "etsyListingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "shopId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EtsyListing_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "EtsyShop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "readingText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "EtsyShop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EtsyShop_etsyShopId_key" ON "EtsyShop"("etsyShopId");

-- CreateIndex
CREATE UNIQUE INDEX "EtsyListing_etsyListingId_key" ON "EtsyListing"("etsyListingId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_etsyReceiptId_key" ON "Order"("etsyReceiptId");
