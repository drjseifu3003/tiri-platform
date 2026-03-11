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
    <section className="kk-section-sm" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="kk-container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px" }}>
          {STATS.map((s) => (
            <div key={s.num} style={{ textAlign: "center", padding: "12px 0" }}>
              <p className="kk-stat-number">{s.num}</p>
              <p className="kk-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
