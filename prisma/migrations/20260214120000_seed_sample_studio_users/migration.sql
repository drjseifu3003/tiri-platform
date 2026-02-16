-- Seed sample studio and users for local development
-- Sample user password (both users): password123

INSERT INTO "Studio" ("id", "name", "email", "phone", "logoUrl", "primaryColor", "createdAt", "updatedAt")
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo Studio',
  'hello@demostudio.local',
  '+12025550100',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("phone") DO NOTHING;

INSERT INTO "User" ("id", "phone", "password", "role", "studioId", "createdAt", "updatedAt")
VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '+12025550101',
    '$2b$12$khP7DeopBWtGTnasSuPr..7evJGydFiakmYqzcEeSB0XMVQPbdLJ2',
    'ADMIN',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '+12025550102',
    '$2b$12$khP7DeopBWtGTnasSuPr..7evJGydFiakmYqzcEeSB0XMVQPbdLJ2',
    'STAFF',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("phone") DO NOTHING;

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
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    (SELECT "id" FROM "Template" WHERE "slug" = 'timeless-orthodox-gold'),
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
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    (SELECT "id" FROM "Template" WHERE "slug" = 'modern-garden-minimal'),
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
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    '11111111-1111-1111-1111-111111111111',
    (SELECT "id" FROM "Template" WHERE "slug" = 'traditional-habesha-elegance'),
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
  )
ON CONFLICT ("slug") DO NOTHING;