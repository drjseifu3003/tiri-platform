# Tiri Technical Guide

## Tech Stack
- Frontend + Backend: Next.js (App Router)
- ORM: Prisma
- Database: PostgreSQL (Supabase for MVP)
- Storage: Supabase Storage (photos/videos)
- Styling: TailwindCSS + ShadCN UI
- Auth: JWT + HTTP-only cookies (studio), token access (couples)
- Deployment: Vercel

## API Design
- POST /api/auth/login → phone + password → JWT cookie
- POST /api/auth/logout → clear cookie
- CRUD routes under /api/studio/* for events, templates, guests, media
- JWT middleware to protect studio routes

## Database Principles
- Multi-tenant via studioId
- UUID primary keys
- Index foreign keys
- Event → Guest → Media hierarchy
- Templates immutable for studios
