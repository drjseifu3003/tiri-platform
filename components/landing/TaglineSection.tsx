"use client";
import React from "react";

export default function TaglineSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container max-w-2xl text-center mx-auto px-6 md:px-4">
        <p className="kk-label kk-fade-up">Welcome</p>
        <h2 className="kk-section-title kk-fade-up-1 text-center">
          The finest wedding moments made possible
        </h2>
        <p className="kk-body kk-fade-up-2 mt-4 md:mt-5">
          We bring decades of Orthodox ceremony experience together with modern planning tools, ensuring your wedding day unfolds exactly as you've imagined. Serene, sacred, and unforgettable.
        </p>
        <div className="mt-8 md:mt-10 kk-fade-up-3">
          <a href="/services" className="kk-btn kk-btn-primary">Explore Services</a>
        </div>
      </div>
    </section>
  );
}
