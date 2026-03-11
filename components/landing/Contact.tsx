"use client";
import React, { useState } from "react";

const IMG_CONTACT_HERO = "/images/contact-hero.jpg";
const IMG_INSTAGRAM = [
  "/images/instagram/i1.jpg", "/images/instagram/i2.jpg",
  "/images/instagram/i3.jpg", "/images/instagram/i4.jpg",
];

/* ════════════════════════════════════════════════════════════
   PAGE HERO
════════════════════════════════════════════════════════════ */
function PageHero() {
  return (
    <section style={{
      paddingTop: "148px", paddingBottom: "80px", paddingLeft: "80px", paddingRight: "80px",
      background: `linear-gradient(155deg, rgba(35,4,24,0.97) 0%, rgba(85,14,56,0.93) 55%, rgba(100,18,64,0.95) 100%), url(${IMG_CONTACT_HERO}) center/cover no-repeat`,
      color: "#fff", textAlign: "center",
    }}>
      <p className="kk-label" style={{ color: "rgba(255,255,255,0.6)" }}>Contact Us</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, fontSize: "clamp(2rem,3.5vw,3.6rem)", color: "#fff", marginTop: "12px", lineHeight: 1.1 }}>
        Let's plan your perfect day together
      </h1>
      <p style={{ fontFamily: "Inter,sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.7)", marginTop: "16px", maxWidth: "520px", margin: "16px auto 0", lineHeight: 1.7 }}>
        Reach out and our team will respond within 24 hours with a personalised quote and consultation time.
      </p>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   CONTACT SPLIT — info left, form right
════════════════════════════════════════════════════════════ */
type ContactForm = {
  name: string; email: string; phone: string;
  date: string; message: string; service: string;
};

function ContactSection() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", phone: "", date: "", message: "", service: "" });
  const [sent, setSent] = useState(false);

  const upd = (k: keyof ContactForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="kk-section" style={{ background: "var(--surface)" }}>
      <div className="kk-container">
        <div className="kk-contact-grid">

          {/* LEFT — info */}
          <div>
            <p className="kk-label">Get In Touch</p>
            <h2 className="kk-section-title">Handling the stress so your event is a success</h2>
            <p className="kk-body" style={{ marginTop: "16px" }}>
              We'd love to hear about your vision. Whether you're just beginning to plan or already have a date in mind, our team is ready to help.
            </p>

            <div style={{ marginTop: "32px" }}>
              {[
                { label: "Address", value: "Oxford Ave. Cary, NC 27511" },
                { label: "Phone", value: "+322 683–5910" },
                { label: "Email", value: "hello@kebkabevents.com" },
                { label: "Hours", value: "Sun–Mon: 10am – 10pm" },
              ].map(item => (
                <div key={item.label} className="kk-contact-info-item">
                  <p className="kk-contact-info-label">{item.label}</p>
                  <p className="kk-contact-info-value">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div style={{ marginTop: "32px", height: "180px", borderRadius: "12px", background: "var(--primary-lighter)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
              <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: "var(--text-3)" }}>[ Map embed — Google Maps iframe ]</p>
            </div>
          </div>

          {/* RIGHT — form */}
          <div style={{ background: "var(--surface-muted)", borderRadius: "20px", padding: "40px", border: "1px solid var(--border)" }}>
            <p className="kk-label">Send Us a Message</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, fontSize: "24px", color: "var(--text)", marginTop: "8px" }}>
              Tell us about your event
            </h3>

            {sent ? (
              <div style={{ marginTop: "32px", textAlign: "center", padding: "48px 24px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--primary-lighter)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "24px", fill: "none", stroke: "var(--primary)", strokeWidth: 2.5 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, fontSize: "22px", color: "var(--text)" }}>Message Sent!</p>
                <p className="kk-body" style={{ marginTop: "8px" }}>We'll be in touch within 24 hours.</p>
                <button onClick={() => setSent(false)} className="kk-btn kk-btn-primary" style={{ marginTop: "24px" }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Full Name *</label>
                    <input required className="kk-input" placeholder="Sara Tekle"
                      value={form.name} onChange={e => upd("name", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Email *</label>
                    <input required type="email" className="kk-input" placeholder="sara@email.com"
                      value={form.email} onChange={e => upd("email", e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Phone</label>
                    <input className="kk-input" placeholder="+1 (555) 000-0000"
                      value={form.phone} onChange={e => upd("phone", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Event Date</label>
                    <input type="date" className="kk-input"
                      value={form.date} onChange={e => upd("date", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Service Interested In</label>
                  <select className="kk-input" value={form.service} onChange={e => upd("service", e.target.value)}>
                    <option value="">Select a service...</option>
                    <option>Full Wedding Planning</option>
                    <option>Day-of Coordination</option>
                    <option>Photography & Video</option>
                    <option>Floral Design</option>
                    <option>Catering & Cake</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Message *</label>
                  <textarea required className="kk-input kk-textarea" placeholder="Tell us about your vision, estimated guest count, venue preferences..."
                    value={form.message} onChange={e => upd("message", e.target.value)} />
                </div>
                <button type="submit" className="kk-btn kk-btn-primary" style={{ justifyContent: "center", padding: "13px 28px" }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   INSTAGRAM FEED
════════════════════════════════════════════════════════════ */
function InstagramSection() {
  return (
    <section className="kk-section" style={{ background: "var(--surface-muted)" }}>
      <div className="kk-container">
        <div className="kk-section-header-center">
          <p className="kk-label">Social</p>
          <h2 className="kk-section-title" style={{ textAlign: "center" }}>Follow Us on Instagram</h2>
          <p className="kk-body" style={{ textAlign: "center", marginTop: "10px" }}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>@kebkabevents</a>
          </p>
        </div>
        <div className="kk-instagram-grid">
          {IMG_INSTAGRAM.map((src, i) => (
            <div key={i} className="kk-instagram-cell">
              <img src={src} alt={`Instagram post ${i+1}`} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }}/>
              <div className="kk-gallery-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "24px", height: "24px" }}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="kk-btn kk-btn-outline-dark">
            View on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   CONTACT PAGE EXPORT
════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <PageHero />
      <ContactSection />
      <InstagramSection />
    </main>
  );
}