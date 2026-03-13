CREATE TYPE "BookingRequestStatus" AS ENUM ('NEW', 'HANDLED', 'CANCELLED');

ALTER TABLE "BookingRequest"
ADD COLUMN "status" "BookingRequestStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN "handledEventId" TEXT;

CREATE UNIQUE INDEX "BookingRequest_handledEventId_key" ON "BookingRequest" ("handledEventId");
CREATE INDEX "BookingRequest_status_idx" ON "BookingRequest" ("status");

ALTER TABLE "BookingRequest"
ADD CONSTRAINT "BookingRequest_handledEventId_fkey"
FOREIGN KEY ("handledEventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
