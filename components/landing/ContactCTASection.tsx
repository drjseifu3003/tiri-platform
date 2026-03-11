"use client";
import React from "react";

export default function ContactCTASection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container max-w-2xl text-center mx-auto px-6 md:px-4">
        <p className="kk-label">Get In Touch</p>
        <h2 className="kk-section-title text-center">
          Looking for Something Best, Contact us
        </h2>
        <p className="kk-body mt-4 md:mt-5">
          Whether you're planning a grand celebration or an intimate ceremony, we'd love to hear from you. Let's create something extraordinary together.
        </p>
        <div className="mt-8 md:mt-10 flex gap-3 md:gap-4 justify-center flex-wrap">
          <a href="/contact" className="kk-btn kk-btn-primary">Start Planning</a>
          <a href="tel:+3226835910" className="kk-btn kk-btn-outline-dark">Call Us Now</a>
        </div>
      </div>
    </section>
  );
}
