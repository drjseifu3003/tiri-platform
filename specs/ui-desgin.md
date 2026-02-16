# Tiri Studio Dashboard Specification (MVP)

## Purpose

The Studio Dashboard is an operations control center for photo studios managing many weddings simultaneously.
It must prioritize speed, clarity, and workflow efficiency for high-volume wedding management.

This spec is authoritative. All dashboard UI and API implementations must follow this document.

---

## Core Design Principles

1. Studio-first multi-tenant system
2. Optimized for studios managing multiple weddings per week/month
3. Mobile-first (used on wedding day)
4. Fast navigation with minimal clicks
5. Clear status visibility for all events
6. Invitation templates are the main adoption wedge
7. No public signup; studio users only

---

## Navigation Structure

Dashboard Navigation:

- Overview
- Events
- Templates
- Guests (optional global view)
- Media (optional global view)
- Settings

All routes under `/studio/*` must be protected by authentication middleware.

---

## Overview Page

### Purpose
Provide immediate operational awareness for studios managing many weddings.

### Required Sections

#### Quick Stats
- Total events
- Upcoming events (next 30 days)
- Total guests invited (all events)
- Guests checked-in today
- Total media files uploaded

#### Today / This Week
- List of weddings happening today
- List of weddings happening this week

Each item must show:
- Event title
- Bride & groom names
- Event date
- Location
- Buttons:
  - Open Check-in
  - View Event

#### Attention Needed (Alerts)
System must surface events that require action:
- Upcoming events (<7 days) with:
  - No guests added
  - No template selected
  - Invitation not published
- Past events with:
  - No media uploaded

---

## Events List Page

### Purpose
Enable studios to manage many weddings efficiently.

### Required Table Columns

- Event title
- Bride & groom names
- Date
- Status: Draft / Published / Completed
- Guest count
- Checked-in count
- Media count
- Actions: View, Manage Guests, Check-in, Upload Media

### Required Filters

- Today
- This week
- This month
- Upcoming
- Past
- Drafts
- Missing guests
- Missing media

### Required Search

- By bride or groom name
- By phone number
- By event date

---

## Event Detail Page

Each event must follow a workflow layout:

### Step 1: Invitation
- Selected template preview
- Edit event details
- Publish / Unpublish
- Copy invitation link

### Step 2: Guests
- Add guest (single)
- Bulk upload (CSV)
- Guest list with:
  - Name
  - Phone
  - Check-in status
  - Check-in timestamp
- Search guests

### Step 3: Media
- Upload photos
- Upload videos
- Media preview grid
- Copy media share link

---

## Wedding Day Mode (Check-in View)

### Purpose
Optimize guest check-in on mobile phones during the wedding.

### Requirements

- Shows only today’s events
- Mobile-first layout
- Large buttons
- Search guest by name or phone
- One-tap check-in
- Minimal UI distractions

This mode must be accessible from the Overview page and Event list page.

---

## Templates Page

### Purpose
Templates are the core adoption wedge for studios.

### Requirements

- Grid view of invitation templates
- Categories:
  - Traditional
  - Modern
  - Religious
- Template preview
- Studio branding preview (logo + color applied)
- One-click apply template to event
- Show most-used templates
- Show recently used templates

This page must feel premium and emotionally appealing.

---

## Settings Page

### Required Fields

- Studio name
- Studio logo upload
- Primary color
- Change password
- (Optional later) Manage staff

---

## Performance & UX Requirements

- Must work smoothly on mobile devices
- Fast loading lists (paginate or virtualize if needed)
- Large buttons for check-in
- Clear visual status badges
- Avoid deep nested navigation
- Must be usable on slow internet

---

## API & Data Requirements

- All data must be scoped by `studioId`
- Queries must support:
  - Filtering by date
  - Status filtering
  - Count aggregation (guests, media, check-ins)
- Event status must be derived:
  - Draft: not published
  - Published: invitation live
  - Completed: event date passed

---

## MVP Scope Enforcement

For MVP:
- Do NOT implement couple login
- Do NOT implement payments
- Do NOT implement RSVP
- Focus on:
  - Templates
  - Event creation
  - Guest management
  - Check-in
  - Media upload

---

## Future Compatibility

The dashboard architecture must support:
- Wedding planners
- Event companies
- Other event types
- Pan-African expansion
