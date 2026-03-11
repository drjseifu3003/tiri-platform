"use client";
import React from "react";

const IMG_SERVICE_HERO = "/images/ceremony-bg.avif";

export default function ServicesHero() {
  return (
    <section style={{
      position: "relative",
      paddingTop: "180px",
      paddingBottom: "96px",
      background: `linear-gradient(155deg, rgba(25,3,17,0.97) 0%, rgba(75,14,50,0.93) 60%, rgba(95,18,63,0.95) 100%), url(${IMG_SERVICE_HERO}) center/cover no-repeat`,
      overflow: "hidden",
    }}>

      {/* Subtle bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "120px",
        background: "linear-gradient(to bottom, transparent, rgba(20,3,14,0.4))",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 64px",
        position: "relative", zIndex: 1,
      }}>

        {/* Gold rule + label */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
          <div style={{ width: "32px", height: "1px", background: "#C9A84C" }} />
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.18em", textTransform: "uppercase" as const,
            color: "#C9A84C",
          }}>Our Services</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(2.8rem, 5vw, 5rem)",
          fontWeight: 600,
          color: "#fff",
          lineHeight: 1.08,
          margin: 0,
          maxWidth: "720px",
          letterSpacing: "-0.01em",
        }}>
          Every detail of your<br />
          <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.8)" }}>sacred celebration</em>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px", lineHeight: 1.75,
          color: "rgba(255,255,255,0.6)",
          marginTop: "24px",
          maxWidth: "480px",
        }}>
          From the Teklil crowning to the final dance — we provide every service an Orthodox wedding deserves, with reverence and precision.
        </p>

        {/* CTA */}
        <div style={{ marginTop: "40px" }}>
          <a href="/contact" style={{
            display: "inline-flex", alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px", fontWeight: 600,
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.55)",
            borderRadius: "2px",
            padding: "11px 28px",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Book a Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
