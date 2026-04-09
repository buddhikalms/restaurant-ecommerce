-- AlterTable
ALTER TABLE `Address` ADD COLUMN `latitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `longitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `placeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `codFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `deliveryInstructions` TEXT NULL,
    ADD COLUMN `deliveryMethodDescription` TEXT NULL,
    ADD COLUMN `estimatedDeliveryMaxDays` INTEGER NULL,
    ADD COLUMN `estimatedDeliveryMinDays` INTEGER NULL,
    ADD COLUMN `gatewayResponseSummary` JSON NULL,
    ADD COLUMN `handlingFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paymentGateway` ENUM('STRIPE', 'PAYPAL', 'CASH_ON_DELIVERY') NULL,
    ADD COLUMN `paymentMethodName` VARCHAR(191) NULL,
    ADD COLUMN `paymentReference` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN `shippingCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `shippingMethodId` VARCHAR(191) NULL,
    ADD COLUMN `shippingMethodName` VARCHAR(191) NULL,
    ADD COLUMN `shippingMethodType` ENUM('FLAT_RATE', 'FREE_SHIPPING', 'LOCAL_DELIVERY', 'STORE_PICKUP', 'WEIGHT_BASED', 'PRICE_BASED') NULL,
    ADD COLUMN `shippingZoneId` VARCHAR(191) NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `allowLocalDelivery` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `allowStorePickup` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `requiresShipping` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `weight` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `StoreSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'store-settings',
    `deliveryNotes` TEXT NULL,
    `defaultHandlingFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `weightUnit` VARCHAR(191) NOT NULL DEFAULT 'kg',
    `dimensionUnit` VARCHAR(191) NOT NULL DEFAULT 'cm',
    `mapsEnabled` BOOLEAN NOT NULL DEFAULT false,
    `googleMapsApiKey` TEXT NULL,
    `defaultMapLatitude` DECIMAL(10, 7) NULL,
    `defaultMapLongitude` DECIMAL(10, 7) NULL,
    `defaultMapZoom` INTEGER NOT NULL DEFAULT 12,
    `storeLocationName` VARCHAR(191) NULL,
    `storeAddress` TEXT NULL,
    `storeLatitude` DECIMAL(10, 7) NULL,
    `storeLongitude` DECIMAL(10, 7) NULL,
    `serviceAreaCountries` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingZone` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingZone_isEnabled_sortOrder_idx`(`isEnabled`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingZoneRegion` (
    `id` VARCHAR(191) NOT NULL,
    `shippingZoneId` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `postalCodePattern` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingZoneRegion_shippingZoneId_sortOrder_idx`(`shippingZoneId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingMethod` (
    `id` VARCHAR(191) NOT NULL,
    `shippingZoneId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('FLAT_RATE', 'FREE_SHIPPING', 'LOCAL_DELIVERY', 'STORE_PICKUP', 'WEIGHT_BASED', 'PRICE_BASED') NOT NULL,
    `baseCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `minimumOrderAmount` DECIMAL(10, 2) NULL,
    `maximumOrderAmount` DECIMAL(10, 2) NULL,
    `minimumWeight` DECIMAL(10, 2) NULL,
    `maximumWeight` DECIMAL(10, 2) NULL,
    `freeShippingMinimum` DECIMAL(10, 2) NULL,
    `maximumDistanceKm` DECIMAL(10, 2) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `estimatedMinDays` INTEGER NULL,
    `estimatedMaxDays` INTEGER NULL,
    `instructions` TEXT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `codAllowed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingMethod_shippingZoneId_isEnabled_sortOrder_idx`(`shippingZoneId`, `isEnabled`, `sortOrder`),
    INDEX `ShippingMethod_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingRateTier` (
    `id` VARCHAR(191) NOT NULL,
    `shippingMethodId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,
    `minimumValue` DECIMAL(10, 2) NULL,
    `maximumValue` DECIMAL(10, 2) NULL,
    `cost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingRateTier_shippingMethodId_sortOrder_idx`(`shippingMethodId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentMethodSetting` (
    `id` VARCHAR(191) NOT NULL,
    `gateway` ENUM('STRIPE', 'PAYPAL', 'CASH_ON_DELIVERY') NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `instructions` TEXT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT false,
    `mode` ENUM('SANDBOX', 'LIVE') NOT NULL DEFAULT 'SANDBOX',
    `publicKey` TEXT NULL,
    `secretKey` TEXT NULL,
    `webhookSecret` TEXT NULL,
    `extraFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `minimumOrderAmount` DECIMAL(10, 2) NULL,
    `maximumOrderAmount` DECIMAL(10, 2) NULL,
    `allowedShippingMethodTypes` JSON NOT NULL,
    `allowedZoneIds` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PaymentMethodSetting_gateway_key`(`gateway`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckoutSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `paymentGateway` ENUM('STRIPE', 'PAYPAL', 'CASH_ON_DELIVERY') NOT NULL,
    `externalReference` VARCHAR(191) NULL,
    `checkoutPayload` JSON NOT NULL,
    `gatewayResponseSummary` JSON NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `shippingCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `handlingFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `paymentFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10, 2) NOT NULL,
    `shippingZoneId` VARCHAR(191) NULL,
    `shippingMethodId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CheckoutSession_externalReference_key`(`externalReference`),
    UNIQUE INDEX `CheckoutSession_orderId_key`(`orderId`),
    INDEX `CheckoutSession_userId_status_createdAt_idx`(`userId`, `status`, `createdAt`),
    INDEX `CheckoutSession_shippingZoneId_idx`(`shippingZoneId`),
    INDEX `CheckoutSession_shippingMethodId_idx`(`shippingMethodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_paymentStatus_createdAt_idx` ON `Order`(`paymentStatus`, `createdAt`);

-- CreateIndex
CREATE INDEX `Order_shippingZoneId_idx` ON `Order`(`shippingZoneId`);

-- CreateIndex
CREATE INDEX `Order_shippingMethodId_idx` ON `Order`(`shippingMethodId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_shippingZoneId_fkey` FOREIGN KEY (`shippingZoneId`) REFERENCES `ShippingZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_shippingMethodId_fkey` FOREIGN KEY (`shippingMethodId`) REFERENCES `ShippingMethod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingZoneRegion` ADD CONSTRAINT `ShippingZoneRegion_shippingZoneId_fkey` FOREIGN KEY (`shippingZoneId`) REFERENCES `ShippingZone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingMethod` ADD CONSTRAINT `ShippingMethod_shippingZoneId_fkey` FOREIGN KEY (`shippingZoneId`) REFERENCES `ShippingZone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingRateTier` ADD CONSTRAINT `ShippingRateTier_shippingMethodId_fkey` FOREIGN KEY (`shippingMethodId`) REFERENCES `ShippingMethod`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckoutSession` ADD CONSTRAINT `CheckoutSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckoutSession` ADD CONSTRAINT `CheckoutSession_shippingZoneId_fkey` FOREIGN KEY (`shippingZoneId`) REFERENCES `ShippingZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckoutSession` ADD CONSTRAINT `CheckoutSession_shippingMethodId_fkey` FOREIGN KEY (`shippingMethodId`) REFERENCES `ShippingMethod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckoutSession` ADD CONSTRAINT `CheckoutSession_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
