"use client";
import React, { useState } from "react";

type Form = {
  name: string; email: string; phone: string;
  date: string; service: string; message: string;
};

const INFO = [
  { label: "Address",  value: "Oxford Ave. Cary, NC 27511" },
  { label: "Phone",    value: "+322 683–5910" },
  { label: "Email",    value: "hello@kebkabevents.com" },
  { label: "Hours",    value: "Sun–Mon: 10am – 10pm" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "Inter, sans-serif",
  fontSize: "13.5px",
  color: "var(--text)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  padding: "11px 14px",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--text-3)",
  display: "block",
  marginBottom: "7px",
};

export default function ContactFormSection() {
  const [form, setForm] = useState<Form>({ name: "", email: "", phone: "", date: "", service: "", message: "" });
  const [sent, setSent] = useState(false);
  const upd = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <section style={{ background: "var(--surface-muted)", padding: "160px 0 96px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "96px", alignItems: "start" }}>

          {/* ── LEFT: info ── */}
          <div style={{ position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "1px", background: "var(--primary)" }} />
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase" as const,
                color: "var(--primary)",
              }}>Contact</span>
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 600, lineHeight: 1.12,
              color: "var(--text)", margin: 0,
            }}>
              Let's plan your<br />
              <em style={{ fontStyle: "italic", color: "var(--primary)" }}>perfect day</em>
            </h1>

            <p style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px", lineHeight: 1.8,
              color: "var(--text-2)", marginTop: "20px",
            }}>
              Whether you're just beginning to plan or already have a date in mind, our team will respond within 24 hours with a personalised consultation.
            </p>

            {/* Contact details */}
            <div style={{ marginTop: "40px", display: "flex", flexDirection: "column" }}>
              {INFO.map((item, i) => (
                <div key={item.label} style={{
                  display: "grid",
                  gridTemplateColumns: "88px 1fr",
                  gap: "16px",
                  padding: "16px 0",
                  borderTop: i === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px", fontWeight: 600,
                    letterSpacing: "0.14em", textTransform: "uppercase" as const,
                    color: "var(--text-3)",
                    paddingTop: "2px",
                  }}>{item.label}</span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "17px", fontWeight: 500,
                    color: "var(--text)",
                  }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: form ── */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "48px",
          }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "64px 24px" }}>
                <div style={{
                  width: "52px", height: "52px",
                  border: "1.5px solid var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: "20px" }}>
                    <polyline points="20 6 9 17 4 12"
                      stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "26px", fontWeight: 600, color: "var(--text)", margin: 0,
                }}>Message received</p>
                <p style={{
                  fontFamily: "Inter, sans-serif", fontSize: "13.5px",
                  color: "var(--text-2)", marginTop: "10px", lineHeight: 1.7,
                }}>We'll be in touch within 24 hours with next steps.</p>
                <button onClick={() => setSent(false)} style={{
                  marginTop: "28px",
                  fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600,
                  color: "var(--primary)", background: "none",
                  border: "1.5px solid var(--primary)", borderRadius: "2px",
                  padding: "10px 24px", cursor: "pointer",
                }}>Send another</button>
              </div>
            ) : (
              <>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "22px", fontWeight: 600,
                  color: "var(--text)", margin: "0 0 32px",
                }}>Tell us about your celebration</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input required style={inputStyle} placeholder="Sara Tekle"
                        value={form.name} onChange={e => upd("name", e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input required type="email" style={inputStyle} placeholder="sara@email.com"
                        value={form.email} onChange={e => upd("email", e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input style={inputStyle} placeholder="+1 (555) 000-0000"
                        value={form.phone} onChange={e => upd("phone", e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Event Date</label>
                      <input type="date" style={inputStyle}
                        value={form.date} onChange={e => upd("date", e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Service</label>
                    <select style={inputStyle} value={form.service} onChange={e => upd("service", e.target.value)}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                      <option value="">Select a service...</option>
                      <option>Full Wedding Planning</option>
                      <option>Day-of Coordination</option>
                      <option>Photography & Film</option>
                      <option>Floral Design</option>
                      <option>Catering & Reception</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea required style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                      placeholder="Tell us about your vision, estimated guest count, venue preferences..."
                      value={form.message} onChange={e => upd("message", e.target.value)}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                  </div>

                  <button
                    onClick={e => { e.preventDefault(); setSent(true); }}
                    style={{
                      fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600,
                      color: "#fff", background: "var(--primary)",
                      border: "none", borderRadius: "2px",
                      padding: "13px 32px", cursor: "pointer",
                      transition: "opacity 0.2s", alignSelf: "flex-start",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >Send Message</button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
