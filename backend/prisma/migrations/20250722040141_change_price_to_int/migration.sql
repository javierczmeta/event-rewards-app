/*
  Warnings:

  - The `price` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "price",
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0;
