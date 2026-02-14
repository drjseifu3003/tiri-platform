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