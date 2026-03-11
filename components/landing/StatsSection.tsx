"use client";
import React from "react";

const STATS = [
  { num: "2500+", label: "Events Planned" },
  { num: "860+",  label: "Happy Couples" },
  { num: "1800+", label: "Guests Hosted" },
  { num: "2k+",   label: "Vendors Network" },
];

export default function StatsSection() {
  return (
    <section className="kk-section-sm border-b border-[var(--border)]" style={{ background: "var(--surface)" }}>
      <div className="kk-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {STATS.map((s) => (
            <div key={s.num} className="text-center py-3 md:py-4">
              <p className="kk-stat-number">{s.num}</p>
              <p className="kk-stat-label mt-2 md:mt-3">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
