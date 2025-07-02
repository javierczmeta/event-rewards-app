/*
  Warnings:

  - You are about to drop the column `tags` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Feedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_user_id_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "tags",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Miscellaneous';

-- DropTable
DROP TABLE "Feedback";
