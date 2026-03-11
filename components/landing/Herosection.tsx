"use client";

import React from "react";
import { CalendarCheck2, MapPin } from "lucide-react";

const CROWN_IMG   = "/images/crowns.png";
const CEREMONY_BG = "/images/ceremony-bg.avif";
const COUPLE_1    = "/images/couple-1.jpg";
const COUPLE_2    = "/images/couple-2.jpg";
const COUPLE_3    = "/images/couple-3.jpg";
const AVATARS     = [COUPLE_1, COUPLE_2, COUPLE_3, COUPLE_1];

export default function HeroSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        #home, #home * { color: #ffffff !important; }

        .hero-h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: clamp(2.4rem, 3.5vw, 4.4rem);
          line-height: 1.06;
          letter-spacing: -0.015em;
          display: block;
          color: #fff;
          white-space: nowrap;
          margin: 0;
        }
        .card-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          line-height: 1.2;
          margin: 0;
          color: #fff;
        }

        @keyframes dropA {
          0%   { opacity:0; transform:translateY(-60px) rotate(-6deg); }
          65%  { opacity:1; transform:translateY(5px)   rotate(-6deg); }
          100% { opacity:1; transform:translateY(0)     rotate(-6deg); }
        }
        @keyframes dropB {
          0%   { opacity:0; transform:translateY(-60px) rotate(0deg); }
          65%  { opacity:1; transform:translateY(5px)   rotate(0deg); }
          100% { opacity:1; transform:translateY(0)     rotate(0deg); }
        }
        @keyframes dropC {
          0%   { opacity:0; transform:translateY(-60px) rotate(6deg); }
          65%  { opacity:1; transform:translateY(5px)   rotate(6deg); }
          100% { opacity:1; transform:translateY(0)     rotate(6deg); }
        }
        @keyframes swingA { 0%{transform:rotate(-7deg);} 100%{transform:rotate(-2deg);} }
        @keyframes swingB { 0%{transform:rotate(-2deg);} 100%{transform:rotate(2deg);}  }
        @keyframes swingC { 0%{transform:rotate(2deg);}  100%{transform:rotate(7deg);}  }

        .card-a {
          animation: dropA .9s .1s both, swingA 5s ease-in-out 1s infinite alternate;
          transform-origin: top center; cursor: pointer;
        }
        .card-b {
          animation: dropB .9s .35s both, swingB 4.5s ease-in-out 1.2s infinite alternate;
          transform-origin: top center; cursor: pointer;
        }
        .card-c {
          animation: dropC .9s .6s both, swingC 5.2s ease-in-out 1.45s infinite alternate;
          transform-origin: top center; cursor: pointer;
        }
        .card-a:hover, .card-b:hover, .card-c:hover {
          animation-play-state: paused, paused;
          transform: rotate(0deg) scale(1.05) !important;
          transition: transform .3s;
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .cards-col { display: none !important; }
          .hero-left { padding: 48px 32px !important; }
          .hero-h1   { white-space: normal !important; }
        }
      `}</style>

      <section
        id="home"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: "680px",
          overflow: "hidden",
          backgroundImage: `url(${CEREMONY_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "linear-gradient(155deg,rgba(35,4,24,0.96) 0%,rgba(85,14,56,0.92) 55%,rgba(100,18,64,0.94) 100%)",
        }} />

        {/* ── grid wrapper — max-w-7xl, centred ── */}
        <div
          className="hero-grid"
          style={{
            position: "relative", zIndex: 10,
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            /* overflow hidden on wrapper clips everything inside */
            overflow: "hidden",
          }}
        >

          {/* ══ LEFT ══ */}
          <div
            className="hero-left"
            style={{
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "64px 48px 64px 64px",
            }}
          >
            <img src={CROWN_IMG} alt="crowns" style={{
              height: "96px", width: "auto", objectFit: "contain",
              alignSelf: "flex-start", marginBottom: "24px",
              filter: "drop-shadow(0 6px 24px rgba(201,168,76,0.55))",
            }} />

            <span className="hero-h1">Orthodox Event Perfected.</span>
            <span className="hero-h1" style={{ marginTop: "4px" }}>One Day, Memories Forever.</span>

            <p style={{
              fontFamily: "Inter,sans-serif", marginTop: "20px",
              fontSize: "16px", lineHeight: 1.75,
              color: "rgba(255,255,255,0.85)", maxWidth: "400px",
            }}>
              Expertly planning every detail of your Orthodox event,
              ensuring each moment becomes a cherished memory.
            </p>

            {/* avatars */}
            <div style={{ marginTop: "36px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {AVATARS.map((src, i) => (
                  <div key={i} style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    border: "2.5px solid rgba(60,10,42,0.9)",
                    marginLeft: i === 0 ? "0" : "-13px",
                    overflow: "hidden", position: "relative",
                    background: "rgba(95,18,63,0.6)", zIndex: 4 - i, flexShrink: 0,
                  }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "40px", fontWeight: 700, lineHeight: 1 }}>1k+</p>
                <div className="flex flex-col gap-1">
                  <p style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginTop: "5px", lineHeight: 1.5 }}>
                    Orthodox Events
                  </p>
                  <p style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginTop: "5px", lineHeight: 1.5 }}>
                    Unforgettable Memories.
                  </p>

                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ marginTop: "32px" }}>
              <a href="#book" style={{
                fontFamily: "Inter,sans-serif",
                display: "inline-flex", alignItems: "center",
                fontSize: "14px", fontWeight: 600, color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.55)", borderRadius: "2px",
                padding: "11px 26px", textDecoration: "none",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >Book Your Event</a>
            </div>
          </div>

          {/* ══ RIGHT — cards ══
            3 equal slots. Each slot = overflow:hidden hard wall.
            Animated card = 78% wide inside slot → swing stays invisible beyond wall.
            Slots use flex-col + justify-end so cards sit from bottom,
            strings grow upward naturally.
            paddingBottom on each slot lifts the cards off the bottom edge.
          ══ */}
          <div
            className="cards-col"
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
              /* NO overflow on this wrapper — the individual slots handle it */
            }}
          >

            {/* —— SLOT A —— */}
            <div style={{
              flex: 1,
              height: "100%",
              overflow: "hidden",         /* ← hard wall, clips swing */
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: "150px",
            }}>
              <div className="card-a" style={{ width: "88%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "1px", height: "80px", background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
                <div style={{ width: "100%", borderRadius: "14px", overflow: "hidden", background: "#1c0914", boxShadow: "0 16px 48px rgba(0,0,0,0.65)" }}>
                  <div style={{ position: "relative", height: "260px", background: "#2e0820", overflow: "hidden" }}>
                    <img src={COUPLE_1} alt="Sara & Mikael" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55px", background: "linear-gradient(to top,#1c0914,transparent)", zIndex: 2 }} />
                  </div>
                  <div style={{ padding: "13px 14px 15px" }}>
                    <p className="card-title" style={{ fontSize: "18px" }}>Sara &amp; Mikael</p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "7px", fontSize: "11px", color: "#C9A84C", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CalendarCheck2 style={{ width: "10px", height: "10px", flexShrink: 0, color: "#C9A84C" }} /> Nov 2024
                    </p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "4px", fontSize: "11px", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin style={{ width: "10px", height: "10px", flexShrink: 0, color: "rgba(255,255,255,0.45)" }} /> Addis Ababa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* —— SLOT B — featured, longer string ——  */}
            <div style={{
              flex: 1,
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: "150px",
            }}>
              <div className="card-b" style={{ width: "90%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "1px", height: "160px", background: "rgba(255,255,255,0.38)", flexShrink: 0 }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.65)", flexShrink: 0 }} />
                <div style={{ width: "100%", borderRadius: "14px", overflow: "hidden", background: "#1c0914", boxShadow: "0 24px 64px rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ position: "relative", height: "295px", background: "#2e0820", overflow: "hidden" }}>
                    <img src={COUPLE_2} alt="Hiwot & Dawit" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "64px", background: "linear-gradient(to top,#1c0914,transparent)", zIndex: 2 }} />
                  </div>
                  <div style={{ padding: "14px 15px 16px" }}>
                    <p className="card-title" style={{ fontSize: "20px" }}>Hiwot &amp; Dawit</p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "7px", fontSize: "11px", color: "#C9A84C", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CalendarCheck2 style={{ width: "10px", height: "10px", flexShrink: 0, color: "#C9A84C" }} /> Oct 2024
                    </p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "4px", fontSize: "11px", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin style={{ width: "10px", height: "10px", flexShrink: 0, color: "rgba(255,255,255,0.45)" }} /> Bahir Dar
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* —— SLOT C —— */}
            <div style={{
              flex: 1,
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: "150px"
            }}>
              <div className="card-c" style={{ width: "88%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "1px", height: "115px", background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
                <div style={{ width: "100%", borderRadius: "14px", overflow: "hidden", background: "#1c0914", boxShadow: "0 16px 48px rgba(0,0,0,0.65)" }}>
                  <div style={{ position: "relative", height: "260px", background: "#2e0820", overflow: "hidden" }}>
                    <img src={COUPLE_3} alt="Marta & Yonas" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55px", background: "linear-gradient(to top,#1c0914,transparent)", zIndex: 2 }} />
                  </div>
                  <div style={{ padding: "13px 14px 15px" }}>
                    <p className="card-title" style={{ fontSize: "18px" }}>Marta &amp; Yonas</p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "7px", fontSize: "11px", color: "#C9A84C", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CalendarCheck2 style={{ width: "10px", height: "10px", flexShrink: 0, color: "#C9A84C" }} /> Aug 2024
                    </p>
                    <p style={{ fontFamily: "Inter,sans-serif", marginTop: "4px", fontSize: "11px", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin style={{ width: "10px", height: "10px", flexShrink: 0, color: "rgba(255,255,255,0.45)" }} /> Gondar
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          {/* end right col */}

        </div>
      </section>
    </>
  );
}