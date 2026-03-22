// lib/types.ts
// ─── Updated to support all 10 templates from the PDF ────────────────────────

export type Religion = "orthodox" | "muslim" | "protestant" | "catholic";
export type Culture  = "habesha" | "oromo" | "tigrai" | "somali" | "afar" | "diaspora";

// All 10 template keys from the PDF
export type TemplateKey =
  | "habesha-classic"      // 1. Habesha Classic   — paid
  | "habesha-royal"        // 2. Habesha Royal      — premium
  | "eth-celebration"      // 3. Ethiopian Celebration — paid
  | "orthodox-holy"        // 4. Orthodox Holy Union — premium
  | "orthodox-minimal"     // 5. Orthodox Minimal   — paid
  | "nikah-elegant"        // 6. Nikah Elegant      — premium
  | "nikah-minimal"        // 7. Nikah Minimal      — free
  | "diaspora-luxury"      // 8. Diaspora Luxury    — premium
  | "story-photo"          // 9. Story / Photo      — paid
  | "elegant-universal";   // 10. Elegant Universal — free

export type TemplateTier = "free" | "paid" | "premium";

export type ProgramItem = {
  time: string;
  timeEn?: string;
  timeAm?: string;
  timeAr?: string;
  title: string;
  titleAm?: string;
  titleAr?: string;
  desc: string;
};

export type InviteData = {
  // ── Couple ──────────────────────────────────────────────────────────────
  groomName: string;
  brideName: string;
  groomNameAm?: string;
  brideNameAm?: string;
  groomNameAr?: string;
  brideNameAr?: string;

  // ── Event ────────────────────────────────────────────────────────────────
  date: string;         // ISO "2026-01-22"
  timeEn: string;       // "09:00 AM"
  timeAm?: string;      // "3:00 ጠዋት"
  timeAr?: string;      // "الظهر"

  // ── Venue ────────────────────────────────────────────────────────────────
  venue: string;
  venueAddress: string;
  venueMapUrl?: string;    // Google Maps iframe embed src
  venueMapLink?: string;   // Google Maps open link

  // ── Media ────────────────────────────────────────────────────────────────
  couplePhotoUrl: string;
  audioUrl?: string;

  // ── Gallery & Telegram ───────────────────────────────────────────────────
  galleryImages?: string[];
  telegramChannel?: string;       // "https://t.me/fikerab_fenan_wedding"
  telegramChannelName?: string;   // "@fikerab_fenan_wedding"

  // ── Content ──────────────────────────────────────────────────────────────
  greetingTitle: string;
  greetingTitleAm?: string;
  messageBody: string;
  messageBodyAm?: string;
  scripture?: string;
  scriptureRef?: string;

  // ── Programme ────────────────────────────────────────────────────────────
  program?: ProgramItem[];

  // ── Classification (kept for backward compatibility) ──────────────────
  religion: Religion;
  culture: Culture;

  // ── Template selection ───────────────────────────────────────────────────
  // templateKey picks one of the 10 specific templates.
  // Falls back to religion/culture-based routing if not set.
  templateKey?: TemplateKey;

  // ── Routing ──────────────────────────────────────────────────────────────
  slug: string;
};