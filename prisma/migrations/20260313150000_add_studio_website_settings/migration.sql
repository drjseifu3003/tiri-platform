CREATE TABLE "StudioWebsiteSettings" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "featuredEvents" JSONB NOT NULL,
    "packages" JSONB NOT NULL,
    "gallery" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioWebsiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudioWebsiteSettings_studioId_key" ON "StudioWebsiteSettings"("studioId");
CREATE INDEX "StudioWebsiteSettings_studioId_idx" ON "StudioWebsiteSettings"("studioId");

ALTER TABLE "StudioWebsiteSettings"
ADD CONSTRAINT "StudioWebsiteSettings_studioId_fkey"
FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
