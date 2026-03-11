"use client";
import React, { useState, useEffect, useCallback } from "react";

const TESTIMONIALS = [
  {
    quote: "Kebkab Events transformed our wedding into something beyond our wildest dreams. Every Orthodox tradition was handled with such care and reverence. Our guests are still talking about it months later.",
    author: "Sara & Mikael",
    date: "November 2024",
    location: "Addis Ababa",
    avatar: "/images/couple-1.jpg",
  },
  {
    quote: "From the habesha kemis to the crown ceremony, every detail was perfect. The team understood our culture deeply and made us feel like royalty on our special day.",
    author: "Hiwot & Dawit",
    date: "October 2024",
    location: "Bahir Dar",
    avatar: "/images/couple-2.jpg",
  },
  {
    quote: "Planning a diaspora wedding from abroad felt impossible until we found Kebkab Events. They coordinated everything between two continents without a single hiccup. Absolutely flawless.",
    author: "Marta & Yonas",
    date: "August 2024",
    location: "Gondar",
    avatar: "/images/couple-3.jpg",
  },
  {
    quote: "The floral arrangements were breathtaking and the church decorations honoured every tradition beautifully. We received so many compliments from our elders that meant everything to us.",
    author: "Tigist & Samuel",
    date: "July 2024",
    location: "Dire Dawa",
    avatar: "/images/couple-1.jpg",
  },
  {
    quote: "I was sceptical at first but Kebkab Events exceeded every expectation. The photography, the music, the catering — all world-class. Our families still call it the best wedding they have ever attended.",
    author: "Bethlehem & Robel",
    date: "May 2024",
    location: "Axum",
    avatar: "/images/couple-2.jpg",
  },
  {
    quote: "We had over 400 guests and not a single moment felt chaotic. The team was calm, professional and deeply respectful of our Orthodox customs. We could not have asked for more.",
    author: "Selamawit & Henok",
    date: "March 2024",
    location: "Lalibela",
    avatar: "/images/couple-3.jpg",
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const total = TESTIMONIALS.length;

  const goTo = useCallback((idx: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(((idx % total) + total) % total);
      setVisible(true);
    }, 380);
  }, [total]);

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), 6000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const t = TESTIMONIALS[current];

  return (
    <section style={{
      background: "#1a0612",
      padding: "72px 0",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Radial glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(95,18,63,0.4) 0%, transparent 70%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 64px",
      }}>

        {/* Label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.18em", textTransform: "uppercase" as const,
            color: "#C9A84C",
          }}>What Our Couples Say</span>
          <div style={{ width: "32px", height: "1px", background: "#C9A84C", marginTop: "10px" }} />
        </div>

        {/* Quote block */}
        <div style={{
          maxWidth: "720px",
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}>

          {/* Opening mark */}
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "72px", lineHeight: 0.7,
            color: "#C9A84C", opacity: 0.55,
            marginBottom: "16px",
            userSelect: "none" as const,
            textAlign: "center",
          }}>"</div>

          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)",
            fontWeight: 400, fontStyle: "italic",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.88)",
            margin: 0,
          }}>
            {t.quote}
          </p>

          {/* Byline + arrows */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: "28px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "40px", height: "40px",
                borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                border: "1.5px solid rgba(201,168,76,0.35)",
              }}>
                <img src={t.avatar} alt={t.author}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "16px", fontWeight: 600,
                  color: "#fff", margin: 0,
                }}>{t.author}</p>
                <p style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px", fontWeight: 500,
                  letterSpacing: "0.12em", textTransform: "uppercase" as const,
                  color: "rgba(255,255,255,0.3)", marginTop: "3px",
                }}>{t.location} · {t.date}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {([["←", -1], ["→", 1]] as const).map(([arrow, dir]) => (
                <button key={arrow} onClick={() => goTo(current + dir)} style={{
                  width: "38px", height: "38px",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "14px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C9A84C"; (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; }}
                >{arrow}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}