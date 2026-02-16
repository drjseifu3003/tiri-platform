-- Seed templates and demo events for existing databases without reset
-- Safe to run multiple times

INSERT INTO "Template" ("id", "name", "slug", "category", "previewImage", "isActive", "createdAt", "updatedAt")
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    'Timeless Orthodox Gold',
    'timeless-orthodox-gold',
    'RELIGIOUS',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    'Modern Garden Minimal',
    'modern-garden-minimal',
    'MODERN',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    'Traditional Habesha Elegance',
    'traditional-habesha-elegance',
    'TRADITIONAL',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("slug") DO NOTHING;

WITH demo_studio AS (
  SELECT "id"
  FROM "Studio"
  WHERE "phone" = '+12025550100'
  LIMIT 1
)
INSERT INTO "Event" (
  "id",
  "studioId",
  "templateId",
  "title",
  "brideName",
  "groomName",
  "bridePhone",
  "groomPhone",
  "coupleAccessToken",
  "eventDate",
  "location",
  "description",
  "coverImage",
  "slug",
  "subdomain",
  "isPublished",
  "createdAt",
  "updatedAt"
)
SELECT
  '55555555-5555-5555-5555-555555555551',
  demo_studio."id",
  template."id",
  'Meron & Dawit Wedding',
  'Meron',
  'Dawit',
  '+12025550111',
  '+12025550112',
  'eeeeeeee-1111-1111-1111-111111111111',
  CURRENT_TIMESTAMP + INTERVAL '30 day',
  'Skylight Hotel, Addis Ababa',
  'A classic Orthodox ceremony followed by an elegant reception.',
  NULL,
  'meron-dawit-wedding',
  'merondawit',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM demo_studio
JOIN "Template" template ON template."slug" = 'timeless-orthodox-gold'
WHERE NOT EXISTS (
  SELECT 1 FROM "Event" existing WHERE existing."slug" = 'meron-dawit-wedding'
);

WITH demo_studio AS (
  SELECT "id"
  FROM "Studio"
  WHERE "phone" = '+12025550100'
  LIMIT 1
)
INSERT INTO "Event" (
  "id",
  "studioId",
  "templateId",
  "title",
  "brideName",
  "groomName",
  "bridePhone",
  "groomPhone",
  "coupleAccessToken",
  "eventDate",
  "location",
  "description",
  "coverImage",
  "slug",
  "subdomain",
  "isPublished",
  "createdAt",
  "updatedAt"
)
SELECT
  '55555555-5555-5555-5555-555555555552',
  demo_studio."id",
  template."id",
  'Lidiya & Abel Wedding',
  'Lidiya',
  'Abel',
  '+12025550113',
  '+12025550114',
  'eeeeeeee-2222-2222-2222-222222222222',
  CURRENT_TIMESTAMP + INTERVAL '75 day',
  'Kuriftu Resort, Bishoftu',
  'Modern outdoor wedding with intimate evening lighting.',
  NULL,
  'lidiya-abel-wedding',
  'lidiyaabel',
  FALSE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM demo_studio
JOIN "Template" template ON template."slug" = 'modern-garden-minimal'
WHERE NOT EXISTS (
  SELECT 1 FROM "Event" existing WHERE existing."slug" = 'lidiya-abel-wedding'
);

WITH demo_studio AS (
  SELECT "id"
  FROM "Studio"
  WHERE "phone" = '+12025550100'
  LIMIT 1
)
INSERT INTO "Event" (
  "id",
  "studioId",
  "templateId",
  "title",
  "brideName",
  "groomName",
  "bridePhone",
  "groomPhone",
  "coupleAccessToken",
  "eventDate",
  "location",
  "description",
  "coverImage",
  "slug",
  "subdomain",
  "isPublished",
  "createdAt",
  "updatedAt"
)
SELECT
  '55555555-5555-5555-5555-555555555553',
  demo_studio."id",
  template."id",
  'Bethlehem & Henok Wedding',
  'Bethlehem',
  'Henok',
  '+12025550115',
  '+12025550116',
  'eeeeeeee-3333-3333-3333-333333333333',
  CURRENT_TIMESTAMP - INTERVAL '20 day',
  'Adama Cultural Hall',
  'Traditional ceremony and family-centered celebration.',
  NULL,
  'bethlehem-henok-wedding',
  'bethlehemhenok',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM demo_studio
JOIN "Template" template ON template."slug" = 'traditional-habesha-elegance'
WHERE NOT EXISTS (
  SELECT 1 FROM "Event" existing WHERE existing."slug" = 'bethlehem-henok-wedding'
);
