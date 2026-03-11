"use client";
import React, { useState } from "react";

const IMG_SERVICE_HERO = "/images/services-hero.jpg";

/* ════════════════════════════════════════════════════════════
   PAGE HERO (inner pages)
════════════════════════════════════════════════════════════ */
function PageHero({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  return (
    <section style={{
      paddingTop: "148px", paddingBottom: "80px", paddingLeft: "80px", paddingRight: "80px",
      background: `linear-gradient(155deg, rgba(35,4,24,0.96) 0%, rgba(85,14,56,0.92) 55%, rgba(100,18,64,0.94) 100%), url(${IMG_SERVICE_HERO}) center/cover no-repeat`,
      color: "#fff",
      textAlign: "center",
    }}>
      <p className="kk-label" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, fontSize: "clamp(2.2rem,4vw,4rem)", color: "#fff", marginTop: "12px", lineHeight: 1.1 }}>
        {title}
      </h1>
      <p style={{ fontFamily: "Inter,sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.72)", marginTop: "18px", maxWidth: "560px", margin: "18px auto 0", lineHeight: 1.7 }}>
        {subtitle}
      </p>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   DETAILED SERVICES — 6 cards
════════════════════════════════════════════════════════════ */
const SERVICES_DETAIL = [
  { icon: "📸", title: "Camera & Video",      desc: "Our professional photographers and videographers capture every sacred moment — from the church procession to the last dance. Packages include same-day edits, drone coverage, and heirloom albums.", tag: "Most Popular" },
  { icon: "🎂", title: "Wedding Cake",        desc: "Custom multi-tier cakes inspired by Ethiopian and Eritrean traditions, crafted by award-winning pastry chefs. Tastings available by appointment.", tag: "" },
  { icon: "💐", title: "Floral Design",       desc: "Lush, fragrant arrangements that honour Orthodox ceremony aesthetics — from altar flowers to reception centrepieces and bridal bouquets.", tag: "" },
  { icon: "📋", title: "Stunning Invitations",desc: "Bilingual Amharic and English invitations, printed on premium stock with hand-finishing. Digital versions available for international guests.", tag: "" },
  { icon: "🎵", title: "Music & Party",       desc: "Live orchestras performing traditional liturgical chants, cultural habesha music, and modern reception entertainment all in one seamless evening.", tag: "" },
  { icon: "👗", title: "Wedding Dress",       desc: "We partner with curated bridal ateliers to offer exclusive gown selections, traditional netela styling, and custom alterations for your perfect look.", tag: "" },
];

function ServicesDetailSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container">
        <div className="kk-section-header-center">
          <p className="kk-label">Our Services</p>
          <h2 className="kk-section-title" style={{ textAlign: "center" }}>The finest wedding moments made possible</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
          {SERVICES_DETAIL.map(s => (
            <div key={s.title} className="kk-service-card" style={{ position: "relative" }}>
              {s.tag && (
                <span style={{ position: "absolute", top: "16px", right: "16px", background: "var(--primary)", color: "#fff", fontSize: "10px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", fontFamily: "Inter,sans-serif", letterSpacing: "0.05em" }}>
                  {s.tag}
                </span>
              )}
              <div className="kk-service-icon"><span style={{ fontSize: "22px" }}>{s.icon}</span></div>
              <p className="kk-service-title">{s.title}</p>
              <p className="kk-service-desc">{s.desc}</p>
              <a href="/contact" style={{ display: "inline-block", marginTop: "16px", fontSize: "12px", fontWeight: 600, color: "var(--primary)", fontFamily: "Inter,sans-serif", textDecoration: "none", borderBottom: "1px solid var(--primary-lighter)" }}>
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   PRICING PLANS
════════════════════════════════════════════════════════════ */
const PLANS = [
  {
    name: "Standard", price: "$2,400", period: "/ event",
    desc: "Perfect for intimate Orthodox ceremonies.",
    features: ["Ceremony coordination", "Basic floral arrangements", "Photo coverage (4 hrs)", "Wedding cake consultation", "Day-of coordinator"],
    featured: false,
  },
  {
    name: "Premium", price: "$4,800", period: "/ event",
    desc: "Our most popular full-service package.",
    features: ["Everything in Standard", "Video + photo (8 hrs)", "Custom floral design", "Music & entertainment", "Invitations design", "Honeymoon planning"],
    featured: true,
  },
  {
    name: "Luxury", price: "$8,500", period: "/ event",
    desc: "For grand celebrations with no compromise.",
    features: ["Everything in Premium", "Drone footage", "Bridal styling session", "Full venue decoration", "3-day coordination", "Exclusive vendor network"],
    featured: false,
  },
];

function PricingSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface)" }}>
      <div className="kk-container">
        <div className="kk-section-header-center">
          <p className="kk-label">Pricing</p>
          <h2 className="kk-section-title" style={{ textAlign: "center" }}>Pricing Plan</h2>
          <p className="kk-body" style={{ textAlign: "center", marginTop: "12px" }}>Choose the package that fits your celebration. All plans include a dedicated event coordinator.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", alignItems: "stretch" }}>
          {PLANS.map(p => (
            <div key={p.name} className={`kk-pricing-card${p.featured ? " kk-pricing-card-featured" : ""}`}>
              <div>
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: p.featured ? "rgba(255,255,255,0.6)" : "var(--text-3)" }}>
                  {p.name}
                </p>
                <p className={`kk-pricing-price${p.featured ? " kk-pricing-price-white" : ""}`} style={{ marginTop: "12px" }}>
                  {p.price}
                  <span style={{ fontSize: "1rem", fontWeight: 400, opacity: 0.6 }}>{p.period}</span>
                </p>
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: p.featured ? "rgba(255,255,255,0.7)" : "var(--text-2)", marginTop: "10px" }}>{p.desc}</p>
              </div>
              <div style={{ marginTop: "24px", flexGrow: 1 }}>
                {p.features.map(f => (
                  <div key={f} className={`kk-pricing-feature${p.featured ? " kk-pricing-feature-white" : ""}`}>
                    <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", flexShrink: 0, fill: "none", stroke: p.featured ? "rgba(255,255,255,0.6)" : "var(--primary)", strokeWidth: 2.5 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "28px" }}>
                <a href="/contact" className={`kk-btn ${p.featured ? "kk-btn-outline" : "kk-btn-primary"}`} style={{ width: "100%", justifyContent: "center" }}>
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   CTA BANNER
════════════════════════════════════════════════════════════ */
function CTABanner() {
  return (
    <section className="kk-cta-banner">
      <p className="kk-label" style={{ color: "rgba(255,255,255,0.55)" }}>Let's Begin</p>
      <h2 className="kk-section-title-white" style={{ textAlign: "center" }}>
        Enjoy wedding, hire professionals to make it a success
      </h2>
      <div style={{ marginTop: "32px" }}>
        <a href="/contact" className="kk-btn" style={{ background: "#fff", color: "var(--primary)", fontWeight: 700 }}>
          Contact Us Today
        </a>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   PARTNERS ROW
════════════════════════════════════════════════════════════ */
const PARTNERS = ["Marriott", "Habesha Flowers", "Zara Couture", "Lalibela Films", "Atlas Catering"];

function PartnersSection() {
  return (
    <div className="kk-partners-row">
      {PARTNERS.map(p => <span key={p} className="kk-partner-logo">{p}</span>)}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SERVICES PAGE EXPORT
════════════════════════════════════════════════════════════ */
export default function Services() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <PageHero
        label="Services"
        title="The finest wedding moments made possible"
        subtitle="From intimate church ceremonies to grand receptions, we offer every service you need for a perfect Orthodox celebration."
      />
      <ServicesDetailSection />
      <PricingSection />
      <CTABanner />
      <PartnersSection />
    </main>
  );
}