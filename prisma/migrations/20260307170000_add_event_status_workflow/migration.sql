-- Create enum for explicit event lifecycle workflow
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- Add status and lifecycle tracking fields to Event
ALTER TABLE "Event"
ADD COLUMN "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "startNotificationSentAt" TIMESTAMP(3);

-- Backfill current events from existing publish/date behavior
UPDATE "Event"
SET "status" = CASE
  WHEN "eventDate" < NOW() THEN 'COMPLETED'::"EventStatus"
  WHEN "isPublished" = TRUE THEN 'SCHEDULED'::"EventStatus"
  ELSE 'DRAFT'::"EventStatus"
END;
