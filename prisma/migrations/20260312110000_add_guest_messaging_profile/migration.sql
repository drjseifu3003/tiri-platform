CREATE TABLE "GuestMessagingProfile" (
  "guestId" TEXT NOT NULL,
  "telegramChatId" TEXT,
  "telegramUsername" TEXT,
  "rsvpStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "rsvpPlusOne" INTEGER NOT NULL DEFAULT 0,
  "rsvpRespondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GuestMessagingProfile_pkey" PRIMARY KEY ("guestId"),
  CONSTRAINT "GuestMessagingProfile_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "GuestMessagingProfile_telegramChatId_idx" ON "GuestMessagingProfile" ("telegramChatId");
CREATE INDEX "GuestMessagingProfile_rsvpStatus_idx" ON "GuestMessagingProfile" ("rsvpStatus");
