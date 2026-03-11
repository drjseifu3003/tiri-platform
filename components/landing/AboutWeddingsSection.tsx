"use client";
import React from "react";

const WEDDINGS = [
  { name: "Sara & Mikael",  date: "November 2024", location: "Addis Ababa", img: "/images/couple-1.jpg" },
  { name: "Hiwot & Dawit",  date: "October 2024",  location: "Bahir Dar",   img: "/images/couple-2.jpg" },
  { name: "Marta & Yonas",  date: "August 2024",   location: "Gondar",      img: "/images/couple-3.jpg" },
];

export default function AboutWeddingsSection() {
  return (
    <section style={{ background: "var(--surface-muted)", padding: "96px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ width: "32px", height: "1px", background: "var(--primary)" }} />
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase" as const,
                color: "var(--primary)",
              }}>Portfolio</span>
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.15,
            }}>Our latest celebrations</h2>
          </div>
          <a href="/contact" style={{
            fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600,
            color: "var(--primary)", textDecoration: "none",
            borderBottom: "1px solid var(--primary)", paddingBottom: "2px",
            whiteSpace: "nowrap",
          }}>View all →</a>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
          {WEDDINGS.map(w => (
            <div key={w.name} style={{ position: "relative", overflow: "hidden", height: "400px" }}>
              <img src={w.img} alt={w.name} style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transition: "transform 0.5s ease",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(20,3,14,0.75) 0%, transparent 55%)",
                pointerEvents: "none",
              }} />
              {/* Info */}
              <div style={{ position: "absolute", bottom: 0, left: 0, padding: "24px 28px" }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "20px", fontWeight: 600,
                  color: "#fff", margin: 0,
                }}>{w.name}</p>
                <p style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px", fontWeight: 500,
                  letterSpacing: "0.13em", textTransform: "uppercase" as const,
                  color: "rgba(255,255,255,0.5)", marginTop: "5px",
                }}>{w.location} · {w.date}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
