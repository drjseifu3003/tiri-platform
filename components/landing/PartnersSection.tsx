"use client";
import React from "react";

const PARTNERS = [
  { name: "Marriott Hotels",  category: "Venue" },
  { name: "Habesha Flowers",  category: "Floristry" },
  { name: "Zara Couture",     category: "Bridal Atelier" },
  { name: "Lalibela Films",   category: "Photography" },
  { name: "Atlas Catering",   category: "Cuisine" },
  { name: "Addis Sound",      category: "Music" },
];

export default function PartnersSection() {
  return (
    <section style={{ background: "var(--primary)", padding: "48px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "8px 0",
        }}>
          {PARTNERS.map((p, i) => (
            <React.Fragment key={p.name}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0 36px",
              }}>
                <span style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase" as const,
                  color: "#C9A84C",
                  marginBottom: "5px",
                }}>{p.category}</span>
                <span style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}>{p.name}</span>
              </div>

              {/* Dot separator — not after last */}
              {i < PARTNERS.length - 1 && (
                <div style={{
                  width: "3px", height: "3px",
                  borderRadius: "50%",
                  background: "rgba(201,168,76,0.4)",
                  flexShrink: 0,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
}