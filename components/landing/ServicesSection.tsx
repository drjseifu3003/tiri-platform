"use client";
import React from "react";

/* ─── Orthodox-specific SVG icons ─────────────────────────────────────────
   Each icon is drawn from real Ethiopian Orthodox wedding symbolism:
   1. Stefana (wedding crowns)  — Photography & Film
   2. Tuaf (lit candle)         — Ceremony Coordination
   3. Ethiopian Cross           — Church Liaison
   4. Common Cup (chalice)      — Catering & Reception
   5. Joined Hands              — Wedding Attire (union / togetherness)
   6. Incense Thurible          — Floral Design (fragrance / adornment)
──────────────────────────────────────────────────────────────────────── */

const CrownIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Crown base band */}
    <path d="M8 32 h28" />
    <path d="M8 36 h28" />
    {/* Crown peaks — three points */}
    <path d="M8 32 L8 20 L16 28 L22 14 L28 28 L36 20 L36 32" />
    {/* Small cross on centre peak */}
    <line x1="22" y1="10" x2="22" y2="6" />
    <line x1="20" y1="8" x2="24" y2="8" />
    {/* Ribbon connecting crowns — two dots */}
    <circle cx="15" cy="34" r="1" fill="currentColor" stroke="none" />
    <circle cx="29" cy="34" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const CandleIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Two candles side by side — bride & groom */}
    {/* Left candle */}
    <rect x="11" y="22" width="8" height="16" rx="1" />
    <line x1="15" y1="22" x2="15" y2="19" />
    {/* Left flame */}
    <path d="M15 19 C13 17 13 14 15 13 C17 14 17 17 15 19Z" />
    {/* Right candle */}
    <rect x="25" y="18" width="8" height="20" rx="1" />
    <line x1="29" y1="18" x2="29" y2="15" />
    {/* Right flame */}
    <path d="M29 15 C27 13 27 10 29 9 C31 10 31 13 29 15Z" />
    {/* Wax drips */}
    <path d="M13 26 Q11 27 12 29" />
    <path d="M31 22 Q33 23 32 25" />
  </svg>
);

const EthiopianCrossIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Ethiopian cross — open lattice cross with flared arms */}
    {/* Vertical arm */}
    <line x1="22" y1="6" x2="22" y2="38" />
    {/* Horizontal arm */}
    <line x1="6" y1="18" x2="38" y2="18" />
    {/* Flared arm ends — top */}
    <path d="M19 6 h6" />
    {/* Bottom */}
    <path d="M19 38 h6" />
    {/* Left */}
    <path d="M6 15 v6" />
    {/* Right */}
    <path d="M38 15 v6" />
    {/* Inner lattice diamonds */}
    <rect x="18" y="14" width="8" height="8" transform="rotate(45 22 18)" />
    {/* Small decorative dots at arm tips */}
    <circle cx="22" cy="6"  r="1.2" fill="currentColor" stroke="none" />
    <circle cx="22" cy="38" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="6"  cy="18" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="38" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const ChaliceIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Chalice bowl */}
    <path d="M13 10 Q12 22 22 26 Q32 22 31 10 Z" />
    {/* Stem */}
    <line x1="22" y1="26" x2="22" y2="34" />
    {/* Base */}
    <path d="M14 34 Q14 37 22 37 Q30 37 30 34 Z" />
    {/* Wine line inside cup */}
    <path d="M15 18 Q18 20 22 20 Q26 20 29 18" strokeDasharray="1.5 1.5" />
    {/* Small cross above cup */}
    <line x1="22" y1="7" x2="22" y2="4" />
    <line x1="20.5" y1="5.5" x2="23.5" y2="5.5" />
  </svg>
);

const JoinedHandsIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Two hands joining at centre — right hands clasped */}
    {/* Left hand reaching right */}
    <path d="M6 28 C6 28 8 24 10 22 L18 22 C20 22 20 24 18 24 L16 24" />
    <path d="M10 22 L10 18 C10 17 11 16 12 17 L12 22" />
    <path d="M12 17 L12 15 C12 14 13 13 14 14 L14 22" />
    <path d="M14 14 L14 13 C14 12 16 12 16 14 L16 22" />
    {/* Right hand reaching left */}
    <path d="M38 28 C38 28 36 24 34 22 L26 22 C24 22 24 24 26 24 L28 24" />
    <path d="M34 22 L34 18 C34 17 33 16 32 17 L32 22" />
    <path d="M32 17 L32 15 C32 14 31 13 30 14 L30 22" />
    <path d="M30 14 L30 13 C30 12 28 12 28 14 L28 22" />
    {/* Ring on left hand */}
    <circle cx="10" cy="30" r="2" />
    {/* Ring on right hand */}
    <circle cx="34" cy="30" r="2" />
  </svg>
);

const ThuribleIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Chain from top */}
    <line x1="22" y1="4" x2="22" y2="12" strokeDasharray="2 1.5" />
    {/* Thurible lid */}
    <path d="M15 16 Q15 12 22 12 Q29 12 29 16 Z" />
    {/* Thurible body */}
    <path d="M13 16 Q11 24 14 30 Q17 34 22 34 Q27 34 30 30 Q33 24 31 16 Z" />
    {/* Perforations / holes */}
    <circle cx="22" cy="20" r="1"  fill="currentColor" stroke="none" />
    <circle cx="18" cy="23" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="26" cy="23" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="22" cy="27" r="0.8" fill="currentColor" stroke="none" />
    {/* Smoke wisps */}
    <path d="M19 11 C18 9 20 7 19 5" />
    <path d="M22 10 C21 8 23 6 22 4" opacity="0.5"/>
    <path d="M25 11 C24 9 26 7 25 5" />
    {/* Base ring */}
    <path d="M17 34 Q17 37 22 37 Q27 37 27 34" />
  </svg>
);

const SERVICES = [
  {
    title: "Photography & Film",
    desc: "Every sacred glance and tear of joy, captured with artistry and preserved for generations.",
    Icon: CrownIcon,
  },
  {
    title: "Ceremony Coordination",
    desc: "From candle lighting to the crowning ceremony, every ritual conducted with reverence and precision.",
    Icon: CandleIcon,
  },
  {
    title: "Church Liaison",
    desc: "We work directly with the kes and deacons to honour every Orthodox rite of the Teklil ceremony.",
    Icon: EthiopianCrossIcon,
  },
  {
    title: "Catering & Reception",
    desc: "Ethiopian and international menus crafted to celebrate your union and honour your guests.",
    Icon: ChaliceIcon,
  },
  {
    title: "Bridal Attire",
    desc: "Netela, habesha kemis, and gold-trimmed kaba, curated with deep respect for your heritage.",
    Icon: JoinedHandsIcon,
  },
  {
    title: "Floral & Décor",
    desc: "Adey abeba and ceremonial arrangements that fill every sacred space with fragrance and grace.",
    Icon: ThuribleIcon,
  },
];

export default function ServicesSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface)" }}>
      <div className="kk-container">

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p className="kk-label">What We Offer</p>
          <h2 className="kk-section-title" style={{ textAlign: "center", marginTop: "8px" }}>
            Every detail, beautifully considered
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--border)]">
          {SERVICES.map(({ title, desc, Icon }) => (
            <div key={title} className="p-8 md:p-10 lg:p-10 border-r border-b border-[var(--border)] flex flex-col gap-4 transition-colors hover:bg-[var(--primary-lighter)]"
            >
              {/* Icon */}
              <div className="w-9 text-[var(--primary)] opacity-80">
                <Icon />
              </div>

              {/* Title */}
              <p className="font-serif text-lg md:text-xl font-semibold text-[var(--text)] m-0 tracking-wide">{title}</p>

              {/* Desc */}
              <p className="font-sans text-sm leading-relaxed text-[var(--text-2)] m-0">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <a href="/services" className="kk-btn kk-btn-primary">View All Services</a>
        </div>

      </div>
    </section>
  );
}
