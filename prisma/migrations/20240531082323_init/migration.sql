-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_user_fkey`;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_user_fkey` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

