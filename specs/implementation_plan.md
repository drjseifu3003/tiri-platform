# Implementation Plan

## Step 1: Project Setup
- Initialize Next.js app with App Router
- Install Prisma, PostgreSQL (Supabase)
- Configure TailwindCSS & ShadCN UI
- Setup .env for DB & JWT secret

## Step 2: Database & Schema
- Create tables:
  - Studio
  - User (phone login)
  - Template
  - Event (includes bride/groom phones, access token)
  - Guest
  - Media
- Setup Prisma migrations

## Step 3: Auth
- Phone + password login
- JWT with HTTP-only cookie
- Middleware to protect `/studio/*` routes
- Logout API

## Step 4: Core Features
- Invitation Template CRUD (admin)
- Event creation with template selection
- Guest management (add, bulk import, check-in)
- Media upload and linking

## Step 5: Frontend
- Studio login page
- Dashboard skeleton
- Event creation & template selection UI
- Guest list & check-in UI
- Media upload page

## Step 6: Testing
- Unit test Prisma queries
- API route tests
- Manual studio workflow testing

## Step 7: Deployment
- Deploy Next.js to Vercel
- Supabase for DB & Storage
- Add env variables
