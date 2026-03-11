"use client";
import React, { useState } from "react";

const FAQS = [
  {
    q: "How far in advance should we book?",
    a: "We recommend booking at least 12 months in advance for peak season (May–October). We do accommodate shorter timelines — contact us to discuss availability.",
  },
  {
    q: "Do you work with diaspora Orthodox communities?",
    a: "Absolutely. We have coordinated weddings for Ethiopian, Eritrean, Greek, Coptic, and Armenian Orthodox communities across North America, Europe, and East Africa.",
  },
  {
    q: "What is included in your coordination packages?",
    a: "All packages include a dedicated coordinator, vendor management, a day-of timeline, and post-event support. Premium packages add photography, floral design, and honeymoon planning.",
  },
  {
    q: "Can you coordinate both the Teklil and the reception?",
    a: "Yes. We handle the complete journey — from church liaison and the crowning ceremony through to the final song at your reception, wherever in the world it takes place.",
  },
];

export default function AboutFAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section style={{ background: "var(--surface)", padding: "96px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "80px", alignItems: "start" }}>

          {/* Left */}
          <div style={{ position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "1px", background: "var(--primary)" }} />
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase" as const,
                color: "var(--primary)",
              }}>FAQ</span>
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.15,
            }}>Questions we hear most</h2>
            <p style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px", lineHeight: 1.75,
              color: "var(--text-2)", marginTop: "18px",
            }}>
              Still have questions? We're happy to walk you through everything in a free 30-minute consultation.
            </p>
            <div style={{ marginTop: "28px" }}>
              <a href="/contact" style={{
                display: "inline-flex", alignItems: "center",
                fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600,
                color: "#fff", background: "var(--primary)",
                borderRadius: "2px", padding: "11px 24px",
                textDecoration: "none", transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >Book a Consultation</a>
            </div>
          </div>

          {/* Right — accordion */}
          <div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                borderTop: "1px solid var(--border)",
                ...(i === FAQS.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}),
              }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "24px 0",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "19px", fontWeight: 600,
                    color: "var(--text)", lineHeight: 1.3,
                  }}>{faq.q}</span>
                  <svg viewBox="0 0 24 24" fill="none" style={{
                    width: "16px", height: "16px", flexShrink: 0,
                    stroke: "var(--primary)", strokeWidth: 2,
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                  }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {open === i && (
                  <p style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px", lineHeight: 1.8,
                    color: "var(--text-2)",
                    margin: "0 0 24px",
                  }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
