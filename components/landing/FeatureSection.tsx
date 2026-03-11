"use client";
import React from "react";

const IMG_FEATURE = "/images/couple-2.jpg";

export default function FeatureSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          {/* Image */}
          <div style={{ borderRadius: "16px", overflow: "hidden", height: "420px", background: "var(--primary-lighter)" }}>
            <img src={IMG_FEATURE} alt="We keep quality"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
            />
          </div>
          {/* Text */}
          <div>
            <p className="kk-label">Our Promise</p>
            <h2 className="kk-section-title">We keep in mind the quality of service</h2>
            <p className="kk-body" style={{ marginTop: "18px" }}>
              Every Orthodox celebration deserves perfection. From the Koumbaros ceremony to the wedding banquet, our planners handle every detail with reverence and precision, so you can be fully present in every sacred moment.
            </p>
            <ul style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Ceremony coordination & church liaison", "Catering & floral design", "Music & entertainment", "Photography & videography"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Inter,sans-serif", fontSize: "14px", color: "var(--text-2)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", flexShrink: 0, display: "inline-block" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "32px" }}>
              <a href="/about" className="kk-btn kk-btn-outline-dark">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
