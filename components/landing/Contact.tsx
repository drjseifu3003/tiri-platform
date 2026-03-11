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
    <section className="pt-32 md:pt-36 lg:pt-40 pb-16 md:pb-20 px-6 md:px-12 lg:px-16 text-center text-white" style={{
      background: `linear-gradient(155deg, rgba(35,4,24,0.97) 0%, rgba(85,14,56,0.93) 55%, rgba(100,18,64,0.95) 100%), url(${IMG_CONTACT_HERO}) center/cover no-repeat`,
    }}>
      <p className="kk-label text-white/60">Contact Us</p>
      <h1 className="hero-h1 mt-3 md:mt-4 text-white">
        Let's plan your perfect day together
      </h1>
      <p className="font-sans text-base md:text-lg text-white/70 mt-4 max-w-2xl mx-auto leading-relaxed">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* LEFT — info */}
          <div>
            <p className="kk-label">Get In Touch</p>
            <h2 className="kk-section-title">Handling the stress so your event is a success</h2>
            <p className="kk-body mt-4 md:mt-5">
              We'd love to hear about your vision. Whether you're just beginning to plan or already have a date in mind, our team is ready to help.
            </p>

            <div className="mt-8 md:mt-10 space-y-6 md:space-y-8">
              {[
                { label: "Address", value: "Oxford Ave. Cary, NC 27511" },
                { label: "Phone", value: "+322 683–5910" },
                { label: "Email", value: "hello@kebkabevents.com" },
                { label: "Hours", value: "Sun–Mon: 10am – 10pm" },
              ].map(item => (
                <div key={item.label} className="kk-contact-info-item pb-6 md:pb-8 border-b border-[var(--border)]">
                  <p className="kk-contact-info-label text-xs md:text-sm">{item.label}</p>
                  <p className="kk-contact-info-value mt-2 text-lg md:text-xl">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-8 md:mt-10 h-40 md:h-48 rounded-xl bg-[var(--primary-lighter)] flex items-center justify-center border border-[var(--border)]">
              <p className="font-sans text-xs md:text-sm text-[var(--text-3)]">[ Map embed — Google Maps iframe ]</p>
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="bg-[var(--surface-muted)] rounded-3xl p-8 md:p-10 border border-[var(--border)]">
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
              <>
                <p className="kk-label">Send Us a Message</p>
                <h3 className="font-serif font-semibold text-2xl md:text-3xl text-[var(--text)] mt-2">
                  Tell us about your event
                </h3>
                <form onSubmit={handleSubmit} className="mt-7 md:mt-8 flex flex-col gap-4 md:gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="font-sans text-xs md:text-sm font-medium text-[var(--text-2)] block mb-2">Full Name *</label>
                    <input required className="kk-input" placeholder="Sara Tekle"
                      value={form.name} onChange={e => upd("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="font-sans text-xs md:text-sm font-medium text-[var(--text-2)] block mb-2">Email *</label>
                    <input required type="email" className="kk-input" placeholder="sara@email.com"
                      value={form.email} onChange={e => upd("email", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="font-sans text-xs md:text-sm font-medium text-[var(--text-2)] block mb-2">Phone</label>
                    <input className="kk-input" placeholder="+1 (555) 000-0000"
                      value={form.phone} onChange={e => upd("phone", e.target.value)} />
                  </div>
                  <div>
                    <label className="font-sans text-xs md:text-sm font-medium text-[var(--text-2)] block mb-2">Event Date</label>
                    <input type="date" className="kk-input"
                      value={form.date} onChange={e => upd("date", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs md:text-sm font-medium text-[var(--text-2)] block mb-2">Service Interested In</label>
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
                  <label className="font-sans text-xs md:text-sm font-medium text-[var(--text-2)] block mb-2">Message *</label>
                  <textarea required className="kk-input kk-textarea" placeholder="Tell us about your vision, estimated guest count, venue preferences..."
                    value={form.message} onChange={e => upd("message", e.target.value)} />
                </div>
                <button type="submit" className="kk-btn kk-btn-primary justify-center py-3 md:py-4 px-6 md:px-8 mt-2">
                  Send Message
                </button>
              </form>
              </>
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
        <div className="text-center mb-12 md:mb-14">
          <p className="kk-label">Social</p>
          <h2 className="kk-section-title text-center mt-2">Follow Us on Instagram</h2>
          <p className="kk-body text-center mt-3 md:mt-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[var(--primary)] no-underline hover:underline">@kebkabevents</a>
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
          {IMG_INSTAGRAM.map((src, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[var(--primary-lighter)] cursor-pointer group relative">
              <img src={src} alt={`Instagram post ${i+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }}/>
              <div className="absolute inset-0 bg-[var(--primary)]/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
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
