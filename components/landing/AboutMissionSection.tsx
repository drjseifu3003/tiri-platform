"use client";
import React from "react";

const IMG_ABOUT = "/images/couple-1.jpg";

export default function AboutMissionSection() {
  return (
    <section style={{ background: "var(--surface)", padding: "160px 0 96px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>

          {/* Image */}
          <div style={{ position: "relative" }}>
            <div style={{
              height: "520px", overflow: "hidden",
              background: "var(--primary-lighter)",
            }}>
              <img src={IMG_ABOUT} alt="Kebkab Events"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            {/* Floating stat */}
            <div style={{
              position: "absolute", bottom: "-24px", right: "-24px",
              background: "var(--primary)",
              padding: "28px 32px",
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "42px", fontWeight: 600,
                color: "#fff", margin: 0, lineHeight: 1,
              }}>860+</p>
              <p style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px", fontWeight: 600,
                letterSpacing: "0.15em", textTransform: "uppercase" as const,
                color: "rgba(255,255,255,0.55)", marginTop: "6px",
              }}>Couples Celebrated</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "1px", background: "var(--primary)" }} />
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase" as const,
                color: "var(--primary)",
              }}>About Us</span>
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 600, lineHeight: 1.12,
              color: "var(--text)", margin: 0,
            }}>
              Planning every wedding<br />
              <em style={{ fontStyle: "italic", color: "var(--primary)" }}>to perfection</em>
            </h1>

            <p style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px", lineHeight: 1.8,
              color: "var(--text-2)", marginTop: "24px",
            }}>
              We are a team of Orthodox wedding specialists who believe your ceremony deserves the same reverence as the vows themselves. Every detail, every tradition, every sacred moment — handled with care and deep cultural knowledge.
            </p>

            <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                "Comprehensive vendor management",
                "Church & civil ceremony coordination",
                "Real-time day-of communication",
                "Post-event memory curation",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: "13px", height: "13px", flexShrink: 0 }}>
                    <polyline points="2 8 6 12 14 4"
                      stroke="var(--primary)" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px", color: "var(--text-2)",
                  }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "40px" }}>
              <a href="/contact" style={{
                display: "inline-flex", alignItems: "center",
                fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600,
                color: "#fff", background: "var(--primary)",
                borderRadius: "2px", padding: "12px 28px",
                textDecoration: "none", transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >Work With Us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
