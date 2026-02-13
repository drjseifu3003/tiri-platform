# Tiri Constitution

## Project Overview
Tiri is a digital event infrastructure platform for photo studios and event organizers in Ethiopia, starting with weddings and expanding to pan-African events.

- **Goal:** Studio-first MVP to provide high-quality invitation templates, event management, guest check-in, and post-event media delivery.
- **Tech Stack:** Next.js (App Router), Prisma ORM, PostgreSQL (Supabase for MVP), Supabase Storage, TailwindCSS / ShadCN UI
- **Auth:** Studio login via phone + password; couples access via token link only (no login for MVP)

## Core Principles
1. Studio-first design: all data tied to `studioId` (multi-tenant)
2. Templates as wedge: premium, culturally tailored wedding invitation templates
3. Simple MVP auth: studio login only
4. Future-proof: scalable for other events and couple dashboards
5. Secure & scalable: Prisma ORM, UUID keys, JWT session

## Ethical Principles
- Respect user data
- Minimal friction for studios
- Maintain quality in invitation templates
- MVP-focused; avoid over-engineering
