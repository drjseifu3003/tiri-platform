"use client";
import React from "react";

const IMG_FEATURE = "/images/couple-3.jpg";

export default function QuoteBlock() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-2xl overflow-hidden h-72 md:h-80 lg:h-80 bg-[var(--primary-lighter)]">
            <img src={IMG_FEATURE} alt="Quote background"
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
            />
          </div>
          <div>
            <p className="kk-label">Our Philosophy</p>
            <blockquote className="font-serif italic font-normal text-2xl md:text-3xl lg:text-4xl text-[var(--text)] leading-relaxed mt-4">
              "We believe every Orthodox celebration deserves to be planned with the same reverence and care as the ceremony itself."
            </blockquote>
            <p className="font-sans text-sm font-semibold text-[var(--primary)] mt-5 md:mt-6">
              Founder, Kebkab Events
            </p>
            <div className="mt-8 md:mt-10">
              <a href="/about" className="kk-btn kk-btn-outline-dark">Our Story</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
