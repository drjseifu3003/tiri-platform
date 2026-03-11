"use client";
import React from "react";

export default function ContactCTASection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container" style={{ maxWidth: "640px", textAlign: "center" }}>
        <p className="kk-label">Get In Touch</p>
        <h2 className="kk-section-title" style={{ textAlign: "center" }}>
          Looking for Something Best, Contact us
        </h2>
        <p className="kk-body" style={{ marginTop: "16px" }}>
          Whether you're planning a grand celebration or an intimate ceremony, we'd love to hear from you. Let's create something extraordinary together.
        </p>
        <div style={{ marginTop: "32px", display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/contact" className="kk-btn kk-btn-primary">Start Planning</a>
          <a href="tel:+3226835910" className="kk-btn kk-btn-outline-dark">Call Us Now</a>
        </div>
      </div>
    </section>
  );
}
