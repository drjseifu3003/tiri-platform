-- Add team role field for studio team management in settings
ALTER TABLE "User"
ADD COLUMN "teamRole" TEXT NOT NULL DEFAULT 'EVENT_PLANNER';
