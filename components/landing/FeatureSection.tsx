"use client";
import React from "react";

const IMG_FEATURE = "/images/couple-2.jpg";

export default function FeatureSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden h-80 md:h-96 lg:h-[420px] bg-[var(--primary-lighter)] order-2 lg:order-1">
            <img src={IMG_FEATURE} alt="We keep quality"
              className="w-full h-full object-cover block"
              onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
            />
          </div>
          {/* Text */}
          <div className="order-1 lg:order-2">
            <p className="kk-label">Our Promise</p>
            <h2 className="kk-section-title">We keep in mind the quality of service</h2>
            <p className="kk-body mt-4 md:mt-5">
              Every Orthodox celebration deserves perfection. From the Koumbaros ceremony to the wedding banquet, our planners handle every detail with reverence and precision, so you can be fully present in every sacred moment.
            </p>
            <ul className="mt-6 md:mt-8 flex flex-col gap-3 md:gap-4">
              {["Ceremony coordination & church liaison", "Catering & floral design", "Music & entertainment", "Photography & videography"].map(item => (
                <li key={item} className="flex items-center gap-2 font-sans text-sm md:text-base text-[var(--text-2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0 inline-block" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 md:mt-10">
              <a href="/about" className="kk-btn kk-btn-outline-dark">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
