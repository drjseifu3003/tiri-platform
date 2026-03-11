"use client";
import React from "react";

const PLANS = [
  {
    name: "Essentials",
    price: "2,400",
    desc: "For intimate Orthodox ceremonies where every ritual is honoured.",
    features: [
      "Ceremony coordination",
      "Basic floral arrangements",
      "Photography — 4 hours",
      "Wedding cake consultation",
      "Day-of coordinator",
    ],
    featured: false,
  },
  {
    name: "Signature",
    price: "4,800",
    desc: "Our most complete service — from the Teklil to the last dance.",
    features: [
      "Everything in Essentials",
      "Photography & film — 8 hours",
      "Custom floral & church décor",
      "Live music & entertainment",
      "Bilingual invitation design",
      "Honeymoon planning",
    ],
    featured: true,
  },
  {
    name: "Grand",
    price: "8,500",
    desc: "For a celebration of the highest order — no detail left unconsidered.",
    features: [
      "Everything in Signature",
      "Drone & aerial footage",
      "Bridal styling session",
      "Full venue transformation",
      "Three-day coordination",
      "Exclusive vendor access",
    ],
    featured: false,
  },
];

const CheckIcon = ({ light }: { light?: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" style={{ width: "13px", height: "13px", flexShrink: 0 }}>
    <polyline points="2 8 6 12 14 4"
      stroke={light ? "rgba(255,255,255,0.55)" : "var(--primary)"}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ServicesPricingSection() {
  return (
    <section style={{ background: "var(--surface)", padding: "96px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "1px", background: "var(--primary)" }} />
            <span style={{
              fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase" as const,
              color: "var(--primary)",
            }}>Packages</span>
            <div style={{ width: "32px", height: "1px", background: "var(--primary)" }} />
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2rem, 3.5vw, 3rem)",
            fontWeight: 600, color: "var(--text)", margin: 0,
          }}>Choose your celebration</h2>
          <p style={{
            fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: 1.7,
            color: "var(--text-2)", marginTop: "14px",
          }}>All packages include a dedicated event coordinator and full consultation.</p>
        </div>

        {/* Plans */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0",
          borderTop: "1px solid var(--border)",
          borderLeft: "1px solid var(--border)",
        }}>
          {PLANS.map(p => (
            <div key={p.name} style={{
              borderRight: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              background: p.featured ? "var(--primary)" : "transparent",
              display: "flex", flexDirection: "column",
              padding: "48px 40px",
              position: "relative",
            }}>

              {/* Plan name */}
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600,
                letterSpacing: "0.2em", textTransform: "uppercase" as const,
                color: p.featured ? "rgba(255,255,255,0.5)" : "var(--text-3)",
              }}>{p.name}</span>

              {/* Price */}
              <div style={{ marginTop: "20px", display: "flex", alignItems: "flex-start", gap: "4px" }}>
                <span style={{
                  fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500,
                  color: p.featured ? "rgba(255,255,255,0.6)" : "var(--text-2)",
                  marginTop: "6px",
                }}>$</span>
                <span style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                  fontWeight: 600, lineHeight: 1,
                  color: p.featured ? "#fff" : "var(--text)",
                }}>{p.price}</span>
                <span style={{
                  fontFamily: "Inter, sans-serif", fontSize: "12px",
                  color: p.featured ? "rgba(255,255,255,0.4)" : "var(--text-3)",
                  alignSelf: "flex-end", marginBottom: "6px",
                }}>/ event</span>
              </div>

              {/* Desc */}
              <p style={{
                fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.65,
                color: p.featured ? "rgba(255,255,255,0.65)" : "var(--text-2)",
                marginTop: "12px",
              }}>{p.desc}</p>

              {/* Divider */}
              <div style={{
                height: "1px",
                background: p.featured ? "rgba(255,255,255,0.1)" : "var(--border)",
                margin: "28px 0",
              }} />

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "13px", flexGrow: 1 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CheckIcon light={p.featured} />
                    <span style={{
                      fontFamily: "Inter, sans-serif", fontSize: "13px",
                      color: p.featured ? "rgba(255,255,255,0.75)" : "var(--text-2)",
                    }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a href="/contact" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: "36px",
                fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600,
                textDecoration: "none",
                padding: "12px 24px",
                border: p.featured ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid var(--primary)",
                color: p.featured ? "#fff" : "var(--primary)",
                borderRadius: "2px",
                transition: "background 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = p.featured ? "rgba(255,255,255,0.1)" : "var(--primary-lighter)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Begin Planning
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
