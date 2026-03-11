"use client";
import React from "react";

const PARTNERS = [
  { name: "Marriott Hotels",  category: "Venue" },
  { name: "Habesha Flowers",  category: "Floristry" },
  { name: "Zara Couture",     category: "Bridal Atelier" },
  { name: "Lalibela Films",   category: "Photography" },
  { name: "Atlas Catering",   category: "Cuisine" },
  { name: "Addis Sound",      category: "Music" },
];

export default function PartnersSection() {
  return (
    <section style={{ background: "var(--primary)", padding: "48px 0" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">

        <div className="flex items-center justify-center flex-wrap gap-4 md:gap-8 lg:gap-12">
          {PARTNERS.map((p, i) => (
            <React.Fragment key={p.name}>
              <div className="flex flex-col items-center">
                <span className="font-sans text-xs font-semibold tracking-widest uppercase text-[#C9A84C] mb-2">
                  {p.category}
                </span>
                <span className="font-serif text-base md:text-lg font-medium text-white/85 tracking-wide whitespace-nowrap">
                  {p.name}
                </span>
              </div>

              {/* Dot separator — not after last */}
              {i < PARTNERS.length - 1 && (
                <div className="w-1 h-1 rounded-full bg-[#C9A84C]/40 flex-shrink-0 hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
}
