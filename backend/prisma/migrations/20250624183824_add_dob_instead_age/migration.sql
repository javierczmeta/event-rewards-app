/*
  Warnings:

  - You are about to drop the column `age` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `dob` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "age",
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL;
