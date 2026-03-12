/*
  Warnings:

  - You are about to drop the `GuestMessagingProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GuestMessagingProfile" DROP CONSTRAINT "GuestMessagingProfile_guestId_fkey";

-- DropTable
DROP TABLE "GuestMessagingProfile";
