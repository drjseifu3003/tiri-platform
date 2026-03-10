"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarCheck2,
  Camera,
  Church,
  ClipboardList,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

const CROWN_IMG   = "/images/crowns.png";
const CEREMONY_BG = "/images/ceremony-bg.avif";
const COUPLE_1    = "/images/couple-1.jpg";
const COUPLE_2    = "/images/couple-2.jpg";
const COUPLE_3    = "/images/couple-3.jpg";
const AVATARS     = [COUPLE_1, COUPLE_2, COUPLE_3, COUPLE_1];

function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isValidDate(d: Date) { return !isNaN(d.getTime()); }

type BookingForm = {
  fullName: string; phone: string; eventDate: string;
  eventTime: string; location: string; guestCount: string;
};

export default function HeroSection() {
  const [form, setForm] = useState<BookingForm>({
    fullName: "", phone: "", eventDate: "", eventTime: "18:00", location: "", guestCount: "",
  });

  const minDate = toDateInputValue(new Date());
  const dt = form.eventDate && form.eventTime ? new Date(`${form.eventDate}T${form.eventTime}`) : null;
  const dtPreview = dt && isValidDate(dt)
    ? new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(dt)
    : null;

  const msg = useMemo(() => [
    "Hello Kebkab Events, I want to book my wedding.",
    `Name: ${form.fullName || "-"}`,
    `Phone: ${form.phone || "-"}`,
    `Wedding date: ${dtPreview ?? "Not set"}`,
    `Location: ${form.location || "-"}`,
    `Estimated guests: ${form.guestCount || "-"}`,
  ].join("\n"), [form, dtPreview]);

  const waHref = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  const services: Array<{ title: string; desc: string; icon: React.ElementType }> = [
    { title: "Full Wedding Planning",  desc: "End-to-end planning from concept, budget, and timeline to final day delivery.", icon: ClipboardList },
    { title: "Venue and Decor Design", desc: "Theme direction, floral styling, stage build, and detailed event atmosphere.",  icon: Church },
    { title: "Guest Management",       desc: "Invitation flow, RSVP tracking, guest list cleanup, and check-in coordination.", icon: Users },
    { title: "Photo and Video",        desc: "Organized image and video delivery so couples can revisit memories anytime.",    icon: Camera },
    { title: "Vendor Coordination",    desc: "One team managing trusted makeup, decor, media, and venue partners.",           icon: Phone },
    { title: "Day-Of Operations",      desc: "On-site team to run schedule, ceremony flow, and guest experience seamlessly.", icon: CalendarCheck2 },
  ];

  return (
    <>
      {/* ── ALL STYLES LIVE HERE — no dependency on globals.css loading ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        /* Force white text on dark sections — overrides global body color */
        #home, #home * { color: #ffffff !important; }
        #book, #book * { color: #ffffff !important; }

        /* Hero heading — big, serif, no wrap */
        .kk-h1 {
          font-family: 'Cormorant Garamond', Georgia, serif !important;
          font-weight: 600 !important;
          font-size: clamp(2.6rem, 4.5vw, 4.8rem) !important;
          line-height: 1.06 !important;
          letter-spacing: -0.015em !important;
          color: #ffffff !important;
          white-space: nowrap !important;
          margin: 0 !important;
          display: block !important;
        }

        /* Card name serif */
        .kk-card-name {
          font-family: 'Cormorant Garamond', Georgia, serif !important;
          font-weight: 600 !important;
          font-size: 18px !important;
          color: #ffffff !important;
          line-height: 1 !important;
          margin: 0 !important;
        }

        /* ── Card drop-in + pendulum swing ── */
        @keyframes kk-dropA {
          0%   { opacity: 0; transform: translateY(-60px) rotate(-6deg); }
          65%  { opacity: 1; transform: translateY(5px)   rotate(-6deg); }
          100% { opacity: 1; transform: translateY(0)     rotate(-6deg); }
        }
        @keyframes kk-dropB {
          0%   { opacity: 0; transform: translateY(-60px) rotate(0deg); }
          65%  { opacity: 1; transform: translateY(5px)   rotate(0deg); }
          100% { opacity: 1; transform: translateY(0)     rotate(0deg); }
        }
        @keyframes kk-dropC {
          0%   { opacity: 0; transform: translateY(-60px) rotate(6deg); }
          65%  { opacity: 1; transform: translateY(5px)   rotate(6deg); }
          100% { opacity: 1; transform: translateY(0)     rotate(6deg); }
        }
        @keyframes kk-swingA {
          0%   { transform: rotate(-8deg); }
          100% { transform: rotate(-3deg); }
        }
        @keyframes kk-swingB {
          0%   { transform: rotate(-2deg); }
          100% { transform: rotate(2deg);  }
        }
        @keyframes kk-swingC {
          0%   { transform: rotate(3deg);  }
          100% { transform: rotate(8deg);  }
        }

        .kk-card-a {
          animation:
            kk-dropA 0.85s cubic-bezier(.22,.68,0,1.2) 0.1s  both,
            kk-swingA 5s  ease-in-out                  1.0s  infinite alternate;
          transform-origin: top center;
          cursor: pointer;
        }
        .kk-card-b {
          animation:
            kk-dropB 0.85s cubic-bezier(.22,.68,0,1.2) 0.35s both,
            kk-swingB 4.5s ease-in-out                 1.2s  infinite alternate;
          transform-origin: top center;
          cursor: pointer;
        }
        .kk-card-c {
          animation:
            kk-dropC 0.85s cubic-bezier(.22,.68,0,1.2) 0.6s  both,
            kk-swingC 5.2s ease-in-out                 1.45s infinite alternate;
          transform-origin: top center;
          cursor: pointer;
        }
        .kk-card-a:hover,
        .kk-card-b:hover,
        .kk-card-c:hover {
          animation-play-state: paused, paused;
          z-index: 30 !important;
          transform: rotate(0deg) scale(1.08) !important;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2);
        }

        /* Dark form inputs */
        .kk-fi {
          width: 100%;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(8px);
          padding: 10px 14px;
          font-size: 14px;
          color: #ffffff !important;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .kk-fi::placeholder { color: rgba(255,255,255,0.5) !important; }
        .kk-fi:focus {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.17);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.07);
        }
        .kk-fi::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }

        /* White divider */
        .kk-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 35%, rgba(255,255,255,0.3) 65%, transparent);
        }
      `}</style>

      <main style={{ width: "100%", overflowX: "hidden" }}>

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section
          id="home"
          style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            minHeight: "680px",
            maxHeight: "100vh",
            overflow: "hidden",
            backgroundImage: `url(${CEREMONY_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Dark primary overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: "linear-gradient(155deg, rgba(35,4,24,0.96) 0%, rgba(85,14,56,0.92) 55%, rgba(100,18,64,0.94) 100%)",
          }} />

          {/* ── HEADER ── */}
          <header style={{
            position: "relative", zIndex: 20, flexShrink: 0,
            width: "100%", height: "68px", padding: "0 64px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(15, 2, 10, 0.6)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg viewBox="0 0 24 24" style={{ width: "14px", fill: "white" }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                </svg>
              </div>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
                Kebkab Events
              </span>
            </div>

            {/* Nav */}
            <nav style={{ display: "flex", alignItems: "center", gap: "40px" }}>
              {["Home", "Services", "About Us", "Contact Us"].map((item) => (
                <a key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 400, color: "rgba(255,255,255,0.82)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.82)")}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* CTA */}
            <a href="#book" style={{
              fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: "2px",
              padding: "8px 20px", textDecoration: "none",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Book Your Event
            </a>
          </header>

          {/* ── HERO BODY ── */}
          <div style={{
            position: "relative", zIndex: 10,
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 460px",
            gap: "0",
            alignItems: "stretch",
            maxWidth: "1280px", width: "100%", margin: "0 auto",
            overflow: "hidden",
          }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 48px 48px 64px" }}>

              {/* Crown */}
              <img src={CROWN_IMG} alt="Orthodox wedding crowns"
                style={{
                  height: "100px", width: "auto", objectFit: "contain",
                  alignSelf: "flex-start", marginBottom: "22px",
                  filter: "drop-shadow(0 6px 24px rgba(201,168,76,0.5))",
                }}
              />

              {/* Headline */}
              <span className="kk-h1">Orthodox Event Perfected.</span>
              <span className="kk-h1" style={{ marginTop: "2px" }}>One Day, Memories Forever.</span>

              {/* Subtext */}
              <p style={{
                fontFamily: "Inter, sans-serif",
                marginTop: "22px", fontSize: "16px", lineHeight: "1.7",
                color: "rgba(255,255,255,0.88)", maxWidth: "420px",
              }}>
                Expertly planning every detail of your Orthodox event,
                ensuring each moment becomes a cherished memory.
              </p>

              {/* Avatars + 1k+ */}
              <div style={{ marginTop: "36px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {AVATARS.map((src, i) => (
                    <div key={i} style={{
                      width: "50px", height: "50px", borderRadius: "50%",
                      border: "2.5px solid rgba(60,10,42,0.9)",
                      marginLeft: i === 0 ? "0" : "-14px",
                      overflow: "hidden", position: "relative",
                      background: "rgba(95,18,63,0.6)",
                      zIndex: 4 - i, flexShrink: 0,
                    }}>
                      <img src={src} alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(95,18,63,0.55)",
                      }}>
                        <svg viewBox="0 0 24 24" style={{ width: "20px", opacity: 0.6 }} fill="white">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>1k+</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.68)", marginTop: "4px", lineHeight: 1.5 }}>
                    Orthodox Events,<br />Unforgettable Memories.
                  </p>
                </div>
              </div>

              {/* Book button */}
              <div style={{ marginTop: "32px" }}>
                <a href="#book" style={{
                  fontFamily: "Inter, sans-serif",
                  display: "inline-flex", alignItems: "center",
                  fontSize: "14px", fontWeight: 600, color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  borderRadius: "2px", padding: "11px 26px",
                  textDecoration: "none",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Book Your Event
                </a>
              </div>
            </div>

            {/* RIGHT — full-height card panel, strings hang from very top */}
            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.15)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              paddingBottom: "32px",
            }}>

              {/* Horizontal string rail across the very top */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "1px",
                background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.18) 20%, rgba(255,255,255,0.18) 80%, transparent 95%)",
              }} />

              {/* ── Card A — left, leans left ── */}
              <div className="kk-card-a" style={{ position: "relative", width: "138px", flexShrink: 0 }}>
                {/* String from top of section */}
                <div style={{
                  position: "absolute",
                  bottom: "100%", left: "50%", transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  height: "calc(50vh - 34px - 120px)", /* fills from top rail to card */
                  minHeight: "60px",
                }}>
                  <div style={{ flex: 1, width: "1px", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.45)", flexShrink: 0 }} />
                </div>
                <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 32px rgba(0,0,0,0.65)", background: "#1c0914" }}>
                  <div style={{ position: "relative", height: "148px", overflow: "hidden", background: "#2e0820" }}>
                    <img src={COUPLE_1} alt="Sara & Mikael"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44px", background: "linear-gradient(to top,#1c0914,transparent)", zIndex: 2 }} />
                  </div>
                  <div style={{ padding: "10px 11px 12px" }}>
                    <p className="kk-card-name" style={{ fontSize: "13px" } as React.CSSProperties}>Sara &amp; Mikael</p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "5px", fontSize: "10px", color: "#C9A84C", display: "flex", alignItems: "center", gap: "3px" }}>
                      <CalendarCheck2 style={{ width: "9px", height: "9px", color: "#C9A84C" }} /> Nov 2024
                    </p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "3px", fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin style={{ width: "9px", height: "9px", color: "rgba(255,255,255,0.4)" }} /> Addis Ababa
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Card B — center, upright, larger, 40px lower ── */}
              <div className="kk-card-b" style={{ position: "relative", width: "155px", flexShrink: 0, marginTop: "64px" }}>
                {/* String from top of section */}
                <div style={{
                  position: "absolute",
                  bottom: "100%", left: "50%", transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  height: "calc(50vh - 34px - 120px + 64px)",
                  minHeight: "80px",
                }}>
                  <div style={{ flex: 1, width: "1px", background: "rgba(255,255,255,0.32)" }} />
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
                </div>
                <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 18px 48px rgba(0,0,0,0.75)", background: "#1c0914", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ position: "relative", height: "178px", overflow: "hidden", background: "#2e0820" }}>
                    <img src={COUPLE_2} alt="Hiwot & Dawit"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "52px", background: "linear-gradient(to top,#1c0914,transparent)", zIndex: 2 }} />
                  </div>
                  <div style={{ padding: "11px 13px 13px" }}>
                    <p className="kk-card-name">Hiwot &amp; Dawit</p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "5px", fontSize: "10px", color: "#C9A84C", display: "flex", alignItems: "center", gap: "3px" }}>
                      <CalendarCheck2 style={{ width: "9px", height: "9px", color: "#C9A84C" }} /> Oct 2024
                    </p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "3px", fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin style={{ width: "9px", height: "9px", color: "rgba(255,255,255,0.4)" }} /> Bahir Dar
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Card C — right, leans right ── */}
              <div className="kk-card-c" style={{ position: "relative", width: "138px", flexShrink: 0 }}>
                {/* String from top of section */}
                <div style={{
                  position: "absolute",
                  bottom: "100%", left: "50%", transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  height: "calc(50vh - 34px - 120px)",
                  minHeight: "60px",
                }}>
                  <div style={{ flex: 1, width: "1px", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.45)", flexShrink: 0 }} />
                </div>
                <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 32px rgba(0,0,0,0.65)", background: "#1c0914" }}>
                  <div style={{ position: "relative", height: "148px", overflow: "hidden", background: "#2e0820" }}>
                    <img src={COUPLE_3} alt="Marta & Yonas"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44px", background: "linear-gradient(to top,#1c0914,transparent)", zIndex: 2 }} />
                  </div>
                  <div style={{ padding: "10px 11px 12px" }}>
                    <p className="kk-card-name" style={{ fontSize: "13px" } as React.CSSProperties}>Marta &amp; Yonas</p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "5px", fontSize: "10px", color: "#C9A84C", display: "flex", alignItems: "center", gap: "3px" }}>
                      <CalendarCheck2 style={{ width: "9px", height: "9px", color: "#C9A84C" }} /> Aug 2024
                    </p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "3px", fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin style={{ width: "9px", height: "9px", color: "rgba(255,255,255,0.4)" }} /> Gondar
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            BOOK YOUR EVENT
        ══════════════════════════════════════════════════ */}
        <section id="book" style={{
          position: "relative", width: "100%", overflow: "hidden",
          padding: "80px 64px", color: "#fff",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${CEREMONY_BG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(35,4,24,0.96) 0%, rgba(85,14,56,0.92) 55%, rgba(100,18,64,0.94) 100%)" }} />
          <div style={{ position: "relative", zIndex: 10, maxWidth: "560px", margin: "0 auto" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
              Book Your Event
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: "clamp(1.9rem,3vw,2.6rem)", color: "#fff", marginTop: "8px" }}>
              Start your journey with us
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", marginTop: "8px", fontSize: "15px", color: "rgba(255,255,255,0.78)" }}>
              Share your details and we'll reach out to plan your perfect day.
            </p>
            <div className="kk-rule" style={{ marginTop: "24px", marginBottom: "24px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input value={form.fullName} onChange={e => setForm(c => ({ ...c, fullName: e.target.value }))} placeholder="Full name" className="kk-fi" />
              <input value={form.phone} onChange={e => setForm(c => ({ ...c, phone: e.target.value }))} placeholder="Phone number" className="kk-fi" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input type="date" value={form.eventDate} min={minDate} onChange={e => setForm(c => ({ ...c, eventDate: e.target.value }))} className="kk-fi" />
                <input type="time" value={form.eventTime} onChange={e => setForm(c => ({ ...c, eventTime: e.target.value }))} className="kk-fi" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input value={form.guestCount} onChange={e => setForm(c => ({ ...c, guestCount: e.target.value }))} placeholder="Estimated guests" className="kk-fi" />
                <input value={form.location} onChange={e => setForm(c => ({ ...c, location: e.target.value }))} placeholder="Wedding location" className="kk-fi" />
              </div>
              <a href={waHref} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "100%", padding: "13px",
                borderRadius: "8px", fontFamily: "Inter, sans-serif",
                fontSize: "14px", fontWeight: 600, color: "#3d0b28",
                background: "#C9A84C", textDecoration: "none",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Send via WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SERVICES
        ══════════════════════════════════════════════════ */}
        <section id="services" style={{ background: "var(--surface-muted, #fbf6f8)", padding: "80px 64px" }}>
          <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary, #5f123f)" }}>Services</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--text-primary, #2e1a24)", marginTop: "8px" }}>
              Everything you need for your wedding
            </h2>
            <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
              {services.map(({ title, desc, icon: Icon }) => (
                <div key={title} style={{
                  borderRadius: "14px", border: "1px solid var(--border-subtle, #e9d8e2)",
                  background: "var(--surface, #fff)", padding: "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,.04)", transition: "box-shadow .2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.09)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)")}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--primary-lighter, #f3e3eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: "20px", height: "20px", color: "var(--primary, #5f123f)" }} />
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: "19px", color: "var(--text-primary, #2e1a24)", marginTop: "16px" }}>{title}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.7, color: "var(--text-secondary, #6f4a5d)", marginTop: "8px" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PROCESS
        ══════════════════════════════════════════════════ */}
        <section id="process" style={{ background: "var(--surface, #fff)", padding: "80px 64px" }}>
          <div style={{ maxWidth: "896px", margin: "0 auto" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary, #5f123f)" }}>How It Works</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--text-primary, #2e1a24)", marginTop: "8px" }}>
              Simple four-step process
            </h2>
            <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {[
                { step: "01", title: "Consultation", desc: "We align your vision, priorities, and budget." },
                { step: "02", title: "Planning",     desc: "We prepare timeline, ceremony flow, and vendors." },
                { step: "03", title: "Execution",    desc: "We run the full event on your wedding day." },
                { step: "04", title: "Memories",     desc: "Access photos and videos with your phone number." },
              ].map(item => (
                <div key={item.step} style={{ borderRadius: "14px", border: "1px solid var(--border-subtle, #e9d8e2)", background: "var(--surface-muted, #fbf6f8)", padding: "24px" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "2.2rem", color: "var(--primary, #5f123f)", opacity: .22 }}>{item.step}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: "19px", color: "var(--text-primary, #2e1a24)", marginTop: "8px" }}>{item.title}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--text-secondary, #6f4a5d)", marginTop: "6px" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════ */}
        <footer style={{
          background: "#5f123f",
          color: "#ffffff",
          padding: "64px 80px 32px",
          fontFamily: "Inter, sans-serif",
        }}>
          {/* Top row — 3 columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "40px",
            alignItems: "start",
          }}>

            {/* LEFT — Address & Hours */}
            <div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "10px" }}>Address</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "22px", color: "#ffffff", lineHeight: 1.3 }}>
                Oxford Ave. Cary, NC 27511
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "28px", marginBottom: "10px" }}>Opening hours</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "22px", color: "#ffffff" }}>
                Sun–Mon: 10am – 10pm
              </p>
            </div>

            {/* CENTER — Logo, tagline, social */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px" }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg viewBox="0 0 32 32" style={{ width: "28px", height: "28px" }} fill="none">
                  <path d="M16 4C10 4 6 8.5 6 14c0 4 2.5 7.5 6 9.5V26h8v-2.5c3.5-2 6-5.5 6-9.5 0-5.5-4-10-10-10z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M12 14c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "24px", color: "#ffffff" }}>
                  Kebkab Events
                </span>
              </div>

              {/* Tagline */}
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: "320px" }}>
                Expertly planning every detail of your Orthodox event, ensuring each moment becomes a cherished memory.
              </p>

              {/* Social icons */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
                {[
                  /* Facebook */
                  <svg key="fb" viewBox="0 0 24 24" fill="white" style={{ width: "20px", height: "20px" }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                  /* Instagram */
                  <svg key="ig" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>,
                  /* X / Twitter */
                  <svg key="x" viewBox="0 0 24 24" fill="white" style={{ width: "20px", height: "20px" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                  /* YouTube */
                  <svg key="yt" viewBox="0 0 24 24" fill="white" style={{ width: "20px", height: "20px" }}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>,
                ].map((icon, i) => (
                  <a key={i} href="#" style={{
                    width: "38px", height: "38px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none", transition: "background 0.2s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* RIGHT — Phone & Email */}
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "10px" }}>Phone</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "22px", color: "#ffffff" }}>
                +322 683–5910
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "28px", marginBottom: "10px" }}>Email</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "22px", color: "#ffffff" }}>
                hello@kebkabevents.com
              </p>
            </div>

          </div>

          {/* Divider */}
          <div style={{
            margin: "48px 0 24px",
            height: "1px",
            background: "rgba(255,255,255,0.12)",
          }} />

          {/* Bottom copyright */}
          <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            © Copyright Kebkab Events 2024. Orthodox wedding planning platform.
          </p>

        </footer>

      </main>
    </>
  );
}