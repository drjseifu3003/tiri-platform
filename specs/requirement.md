# Tiri Requirements

## Functional Requirements
1. Studio login via phone + password
2. Invitation template selection for events
3. Event creation & linking templates
4. Guest management (add, bulk upload, check-in)
5. Media upload and management post-event
6. Couple access via token (no login)
7. Multi-tenant isolation by studioId
8. Admin role for template and event control

## Non-Functional Requirements
1. Secure password storage (bcrypt)
2. JWT for session management
3. HTTP-only cookies
4. Mobile-first UI
5. Scalable DB design (UUIDs, indexed relations)
6. Future-proof for other events & pan-African expansion
