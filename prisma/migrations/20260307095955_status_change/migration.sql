/*
  Warnings:

  - Changed the type of `channel` on the `GuestInvitation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InvitationChannel" AS ENUM ('WHATSAPP', 'TELEGRAM', 'SMS');

-- DropIndex
DROP INDEX "GuestInvitation_guestId_sentAt_idx";

-- AlterTable
ALTER TABLE "GuestInvitation" DROP COLUMN "channel",
ADD COLUMN     "channel" "InvitationChannel" NOT NULL;

-- CreateIndex
CREATE INDEX "GuestInvitation_guestId_sentAt_idx" ON "GuestInvitation"("guestId", "sentAt");
