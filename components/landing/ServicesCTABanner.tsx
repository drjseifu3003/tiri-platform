"use client";
import React from "react";

export default function ServicesCTABanner() {
  return (
    <section style={{
      background: "#1a0612",
      padding: "96px 0",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Radial glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(95,18,63,0.45) 0%, transparent 70%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: "1280px", margin: "0 auto", padding: "0 64px",
        textAlign: "center",
      }}>

        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "24px" }}>
          <div style={{ width: "32px", height: "1px", background: "#C9A84C" }} />
          <span style={{
            fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.18em", textTransform: "uppercase" as const,
            color: "#C9A84C",
          }}>Let's Begin</span>
          <div style={{ width: "32px", height: "1px", background: "#C9A84C" }} />
        </div>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
          fontWeight: 600, lineHeight: 1.12,
          color: "#fff", margin: "0 auto",
          maxWidth: "640px",
        }}>
          Ready to begin planning your <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>perfect day?</em>
        </h2>

        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px", lineHeight: 1.7,
          color: "rgba(255,255,255,0.5)",
          marginTop: "20px", maxWidth: "440px", margin: "20px auto 0",
        }}>
          Our team is ready to walk with you from the first consultation to the last blessing.
        </p>

        <div style={{ marginTop: "40px", display: "flex", gap: "14px", justifyContent: "center" }}>
          <a href="/contact" style={{
            display: "inline-flex", alignItems: "center",
            fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600,
            color: "var(--primary)", background: "#fff",
            borderRadius: "2px", padding: "12px 32px",
            textDecoration: "none", transition: "opacity 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Contact Us Today
          </a>
          <a href="/about" style={{
            display: "inline-flex", alignItems: "center",
            fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600,
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.3)",
            borderRadius: "2px", padding: "12px 32px",
            textDecoration: "none", transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
          >
            Our Story
          </a>
        </div>

      </div>
    </section>
  );
}
