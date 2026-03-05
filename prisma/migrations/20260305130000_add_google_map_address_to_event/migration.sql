-- Add required Google Maps address to events
ALTER TABLE "Event"
ADD COLUMN IF NOT EXISTS "googleMapAddress" TEXT;

UPDATE "Event"
SET "googleMapAddress" = COALESCE(NULLIF("googleMapAddress", ''), COALESCE("location", ''));

ALTER TABLE "Event"
ALTER COLUMN "googleMapAddress" SET NOT NULL;