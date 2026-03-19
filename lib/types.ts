// lib/types.ts

export type Religion = "orthodox" | "muslim" | "protestant" | "catholic";
export type Culture  = "habesha"  | "oromo"  | "tigrai"     | "somali" | "afar" | "diaspora";

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
  venueMapUrl?: string;   // Google Maps embed src (iframe)
  venueMapLink?: string;  // Google Maps open link

  // ── Media ────────────────────────────────────────────────────────────────
  couplePhotoUrl: string;
  audioUrl?: string;

  // ── Gallery & Telegram ───────────────────────────────────────────────────
  galleryImages?: string[];        // array of photo URLs shown on invite page
  telegramChannel?: string;        // "https://t.me/fikerab_fenan_wedding"
  telegramChannelName?: string;    // "@fikerab_fenan_wedding"

  // ── Content ──────────────────────────────────────────────────────────────
  greetingTitle: string;
  greetingTitleAm?: string;
  messageBody: string;
  messageBodyAm?: string;
  scripture?: string;
  scriptureRef?: string;

  // ── Programme ────────────────────────────────────────────────────────────
  program?: ProgramItem[];

  // ── Classification ───────────────────────────────────────────────────────
  religion: Religion;
  culture: Culture;

  // ── Routing ──────────────────────────────────────────────────────────────
  slug: string;
};