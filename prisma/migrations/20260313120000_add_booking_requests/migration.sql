CREATE TABLE "BookingRequest" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "weddingDate" TIMESTAMP(3) NOT NULL,
  "weddingPlace" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookingRequest_createdAt_idx" ON "BookingRequest" ("createdAt");
CREATE INDEX "BookingRequest_weddingDate_idx" ON "BookingRequest" ("weddingDate");