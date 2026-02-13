# Tiri Specifications

## Studio
- id, name, phone, logoUrl, primaryColor, timestamps
- Roles: ADMIN / STAFF
- Manual onboarding only

## User (Studio Staff)
- phone (unique), password (bcrypt)
- role: ADMIN / STAFF
- studioId
- createdAt / updatedAt

## Invitation Template
- id, name, slug, previewImage, category, isActive, timestamps
- Global admin control
- Categories: Traditional / Modern / Religious

## Event
- id, studioId, templateId
- title, brideName, groomName, bridePhone, groomPhone
- coupleAccessToken
- eventDate, location, coverImage, slug, subdomain
- isPublished, timestamps

## Guest
- id, eventId
- name, phone, email, invitationCode
- checkedIn, checkedInAt

## Media
- id, eventId
- type: IMAGE / VIDEO
- url, createdAt
