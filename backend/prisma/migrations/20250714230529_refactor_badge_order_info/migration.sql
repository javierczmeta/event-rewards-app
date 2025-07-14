/*
  Warnings:

  - You are about to drop the column `position` on the `Badge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "position";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "badge_order" INTEGER[];
