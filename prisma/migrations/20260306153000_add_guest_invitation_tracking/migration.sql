CREATE TABLE IF NOT EXISTS "GuestInvitation" (
  "id" BIGSERIAL PRIMARY KEY,
  "guestId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "channel" TEXT NOT NULL CHECK ("channel" IN ('WHATSAPP', 'TELEGRAM', 'SMS')),
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuestInvitation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GuestInvitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "GuestInvitation_guestId_sentAt_idx"
  ON "GuestInvitation" ("guestId", "sentAt" DESC);

CREATE INDEX IF NOT EXISTS "GuestInvitation_eventId_idx"
  ON "GuestInvitation" ("eventId");
