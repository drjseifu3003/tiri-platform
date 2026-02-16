-- Backfill existing event records so both bridePhone and groomPhone are present
-- This supports stricter API validation without breaking existing data.

UPDATE "Event"
SET
  "bridePhone" = CASE
    WHEN NULLIF(BTRIM("bridePhone"), '') IS NOT NULL THEN "bridePhone"
    WHEN NULLIF(BTRIM("groomPhone"), '') IS NOT NULL THEN "groomPhone"
    ELSE '+12025550991'
  END,
  "groomPhone" = CASE
    WHEN NULLIF(BTRIM("groomPhone"), '') IS NOT NULL THEN "groomPhone"
    WHEN NULLIF(BTRIM("bridePhone"), '') IS NOT NULL THEN "bridePhone"
    ELSE '+12025550992'
  END
WHERE
  NULLIF(BTRIM("bridePhone"), '') IS NULL
  OR NULLIF(BTRIM("groomPhone"), '') IS NULL;
