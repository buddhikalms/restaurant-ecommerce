-- AlterTable
ALTER TABLE `fooditem` ADD COLUMN `includedItemsSummary` TEXT NULL,
    ADD COLUMN `itemType` ENUM('SINGLE', 'COMBO') NOT NULL DEFAULT 'SINGLE',
    ADD COLUMN `offerDescription` TEXT NULL,
    ADD COLUMN `offerTitle` VARCHAR(191) NULL;
