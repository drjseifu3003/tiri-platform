"use client";
import React from "react";

const IMG_FEATURE = "/images/couple-3.jpg";

export default function QuoteBlock() {
  return (
    <section style={{ background: "var(--surface-muted)", padding: "80px 80px", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "64px", alignItems: "center" }}>
      <div style={{ borderRadius: "16px", overflow: "hidden", height: "320px", background: "var(--primary-lighter)" }}>
        <img src={IMG_FEATURE} alt="Quote background"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
      </div>
      <div>
        <p className="kk-label">Our Philosophy</p>
        <blockquote style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.5rem,2.5vw,2.2rem)", color: "var(--text)", lineHeight: 1.5, marginTop: "16px" }}>
          "We believe every Orthodox celebration deserves to be planned with the same reverence and care as the ceremony itself."
        </blockquote>
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 600, color: "var(--primary)", marginTop: "20px" }}>
          Founder, Kebkab Events
        </p>
        <div style={{ marginTop: "28px" }}>
          <a href="/about" className="kk-btn kk-btn-outline-dark">Our Story</a>
        </div>
      </div>
    </section>
  );
}
