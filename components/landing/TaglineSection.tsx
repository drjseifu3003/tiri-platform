"use client";
import React from "react";

export default function TaglineSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container" style={{ textAlign: "center", maxWidth: "680px" }}>
        <p className="kk-label kk-fade-up">Welcome</p>
        <h2 className="kk-section-title kk-fade-up-1" style={{ textAlign: "center" }}>
          The finest wedding moments made possible
        </h2>
        <p className="kk-body kk-fade-up-2" style={{ marginTop: "20px" }}>
          We bring decades of Orthodox ceremony experience together with modern planning tools, ensuring your wedding day unfolds exactly as you've imagined. Serene, sacred, and unforgettable.
        </p>
        <div style={{ marginTop: "32px" }} className="kk-fade-up-3">
          <a href="/services" className="kk-btn kk-btn-primary">Explore Services</a>
        </div>
      </div>
    </section>
  );
}
