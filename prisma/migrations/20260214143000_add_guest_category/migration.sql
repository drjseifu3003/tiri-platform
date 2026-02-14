-- Add guest category support for bride and groom segmentation
CREATE TYPE "GuestCategory" AS ENUM ('GENERAL', 'BRIDE_GUEST', 'GROOM_GUEST');

ALTER TABLE "Guest"
ADD COLUMN "category" "GuestCategory" NOT NULL DEFAULT 'GENERAL';
