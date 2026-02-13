/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Studio` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `Studio` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Studio_email_key";

-- AlterTable
ALTER TABLE "Studio" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Studio_phone_key" ON "Studio"("phone");
