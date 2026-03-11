"use client";
import React from "react";

const CrownIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 32 h28" /><path d="M8 36 h28" />
    <path d="M8 32 L8 20 L16 28 L22 14 L28 28 L36 20 L36 32" />
    <line x1="22" y1="10" x2="22" y2="6" /><line x1="20" y1="8" x2="24" y2="8" />
    <circle cx="15" cy="34" r="1" fill="currentColor" stroke="none" />
    <circle cx="29" cy="34" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const CandleIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="11" y="22" width="8" height="16" rx="1" />
    <line x1="15" y1="22" x2="15" y2="19" />
    <path d="M15 19 C13 17 13 14 15 13 C17 14 17 17 15 19Z" />
    <rect x="25" y="18" width="8" height="20" rx="1" />
    <line x1="29" y1="18" x2="29" y2="15" />
    <path d="M29 15 C27 13 27 10 29 9 C31 10 31 13 29 15Z" />
    <path d="M13 26 Q11 27 12 29" /><path d="M31 22 Q33 23 32 25" />
  </svg>
);

const EthiopianCrossIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="6" x2="22" y2="38" /><line x1="6" y1="18" x2="38" y2="18" />
    <path d="M19 6 h6" /><path d="M19 38 h6" />
    <path d="M6 15 v6" /><path d="M38 15 v6" />
    <rect x="18" y="14" width="8" height="8" transform="rotate(45 22 18)" />
    <circle cx="22" cy="6"  r="1.2" fill="currentColor" stroke="none" />
    <circle cx="22" cy="38" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="6"  cy="18" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="38" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const ChaliceIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 10 Q12 22 22 26 Q32 22 31 10 Z" />
    <line x1="22" y1="26" x2="22" y2="34" />
    <path d="M14 34 Q14 37 22 37 Q30 37 30 34 Z" />
    <path d="M15 18 Q18 20 22 20 Q26 20 29 18" strokeDasharray="1.5 1.5" />
    <line x1="22" y1="7" x2="22" y2="4" /><line x1="20.5" y1="5.5" x2="23.5" y2="5.5" />
  </svg>
);

const JoinedHandsIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 28 C6 28 8 24 10 22 L18 22 C20 22 20 24 18 24 L16 24" />
    <path d="M10 22 L10 18 C10 17 11 16 12 17 L12 22" />
    <path d="M12 17 L12 15 C12 14 13 13 14 14 L14 22" />
    <path d="M14 14 L14 13 C14 12 16 12 16 14 L16 22" />
    <path d="M38 28 C38 28 36 24 34 22 L26 22 C24 22 24 24 26 24 L28 24" />
    <path d="M34 22 L34 18 C34 17 33 16 32 17 L32 22" />
    <path d="M32 17 L32 15 C32 14 31 13 30 14 L30 22" />
    <path d="M30 14 L30 13 C30 12 28 12 28 14 L28 22" />
    <circle cx="10" cy="30" r="2" /><circle cx="34" cy="30" r="2" />
  </svg>
);

const ThuribleIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="4" x2="22" y2="12" strokeDasharray="2 1.5" />
    <path d="M15 16 Q15 12 22 12 Q29 12 29 16 Z" />
    <path d="M13 16 Q11 24 14 30 Q17 34 22 34 Q27 34 30 30 Q33 24 31 16 Z" />
    <circle cx="22" cy="20" r="1"   fill="currentColor" stroke="none" />
    <circle cx="18" cy="23" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="26" cy="23" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="22" cy="27" r="0.8" fill="currentColor" stroke="none" />
    <path d="M19 11 C18 9 20 7 19 5" />
    <path d="M25 11 C24 9 26 7 25 5" />
    <path d="M17 34 Q17 37 22 37 Q27 37 27 34" />
  </svg>
);

const SERVICES = [
  {
    Icon: CrownIcon,
    title: "Photography & Film",
    tag: "Most Requested",
    desc: "Every sacred glance, every tear of joy captured with artistry. Packages include same-day edits, drone coverage, and heirloom albums that honour your story for generations.",
  },
  {
    Icon: CandleIcon,
    title: "Ceremony Coordination",
    tag: "",
    desc: "From the candle lighting through the Dance of Isaiah, every ritual is guided with reverence. We liaise directly with the kes so nothing is left to chance.",
  },
  {
    Icon: EthiopianCrossIcon,
    title: "Church Liaison",
    tag: "",
    desc: "We work with Ethiopian Orthodox Tewahedo churches across Ethiopia and the diaspora to coordinate the Teklil crowning, betrothal service, and all sacred arrangements.",
  },
  {
    Icon: ChaliceIcon,
    title: "Catering & Reception",
    tag: "",
    desc: "Exquisite Ethiopian and international menus crafted to honour your union. From injera banquets to formal dining every table reflects the richness of your heritage.",
  },
  {
    Icon: JoinedHandsIcon,
    title: "Bridal Attire",
    tag: "",
    desc: "Habesha kemis, netela, and gold-trimmed kaba curated in partnership with bridal ateliers who understand the weight and beauty of Orthodox wedding dress.",
  },
  {
    Icon: ThuribleIcon,
    title: "Floral & Décor",
    tag: "",
    desc: "Adey abeba and ceremonial arrangements that fill every sacred space with fragrance and grace from altar flowers to reception centrepieces.",
  },
];

export default function ServicesDetailSection() {
  return (
    <section style={{ background: "var(--surface-muted)", padding: "160px 0 96px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}>

        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
            <span style={{
              fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase" as const,
              color: "var(--primary)",
            }}>What We Offer</span>
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2rem, 3.5vw, 3rem)",
            fontWeight: 600, lineHeight: 1.15,
            color: "var(--text)", margin: 0,
          }}>
            Every detail, beautifully considered
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid var(--border)",
          borderLeft: "1px solid var(--border)",
        }}>
          {SERVICES.map(({ Icon, title, tag, desc }) => (
            <div key={title} style={{
              padding: "44px 40px",
              borderRight: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              display: "flex", flexDirection: "column", gap: "16px",
              position: "relative",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              
              {/* Icon */}
              <div style={{ width: "38px", color: "var(--primary)", opacity: 0.75 }}>
                <Icon />
              </div>

              {/* Title */}
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "20px", fontWeight: 600,
                color: "var(--text)", margin: 0, letterSpacing: "0.01em",
              }}>{title}</p>

              {/* Desc */}
              <p style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13.5px", lineHeight: 1.75,
                color: "var(--text-2)", margin: 0,
              }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}