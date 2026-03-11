"use client";

import React, { useState, useEffect } from "react";

/**
 * Header — universal, works on every page.
 *
 * HOW TO USE:
 * ─────────────────────────────────────────────────────────────
 * 1. Open  src/app/layout.tsx
 * 2. Import this component:
 *      import Header from "@/components/Header";
 * 3. Place it inside <body>, ABOVE {children}:
 *
 *      <body>
 *        <Header />
 *        {children}
 *      </body>
 *
 * 4. On the HOME page the header starts fully transparent so it
 *    floats over the hero background. On every other page (or
 *    once the user scrolls) it becomes the solid brand colour.
 *
 * 5. Delete the old Navbar.tsx — it is no longer needed.
 * ─────────────────────────────────────────────────────────────
 */

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Services", href: "/services" },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/contact" },
];

const BRAND_SOLID   = "rgba(75, 14, 50, 0.98)";
const BRAND_TRANS   = "rgba(10, 0, 8, 0.15)";   /* nearly invisible over dark hero */
const BRAND_MOBILE  = "rgba(60, 10, 42, 0.99)";  /* mobile menu panel */

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [activePath,  setActivePath]  = useState("/");

  /* ── track scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── track active path ── */
  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  /* ── lock body scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isHome      = activePath === "/";
  const showSolid   = scrolled || !isHome || menuOpen;

  /* ─────────────── STYLES ─────────────── */
  const headerStyle: React.CSSProperties = {
    position:       "fixed",
    top:            0,
    left:           0,
    right:          0,
    zIndex:         200,
    height:         "68px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "0 32px",
    background:     showSolid ? BRAND_SOLID : BRAND_TRANS,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom:   showSolid
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid transparent",
    transition:     "background 0.35s ease, border-color 0.35s ease",
  };

  const logoTextStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontWeight: 700,
    fontSize:   "20px",
    color:      "#fff",
    letterSpacing: "-0.01em",
  };

  const linkBase: React.CSSProperties = {
    fontFamily:    "Inter, sans-serif",
    fontSize:      "14px",
    color:         "rgba(255,255,255,0.78)",
    textDecoration: "none",
    paddingBottom: "2px",
    borderBottom:  "1.5px solid transparent",
    transition:    "color 0.15s, border-color 0.15s",
    whiteSpace:    "nowrap",
  };

  const linkActive: React.CSSProperties = {
    ...linkBase,
    fontWeight:   600,
    color:        "#fff",
    borderBottom: "1.5px solid rgba(255,255,255,0.55)",
  };

  const ctaStyle: React.CSSProperties = {
    fontFamily:    "Inter, sans-serif",
    fontSize:      "13px",
    fontWeight:    600,
    color:         "#fff",
    border:        "1.5px solid rgba(255,255,255,0.5)",
    borderRadius:  "2px",
    padding:       "8px 20px",
    textDecoration: "none",
    whiteSpace:    "nowrap",
    transition:    "background 0.15s",
  };

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@400;500;600&display=swap');

        /* crown icon path */
        .kk-header-crown { filter: drop-shadow(0 2px 6px rgba(201,168,76,0.5)); }

        /* hamburger lines */
        .kk-burger span {
          display: block;
          width: 22px; height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: transform 0.28s ease, opacity 0.2s ease;
        }
        .kk-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .kk-burger.open span:nth-child(2) { opacity: 0; }
        .kk-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* mobile drawer */
        .kk-drawer {
          position: fixed;
          top: 68px; left: 0; right: 0; bottom: 0;
          background: ${BRAND_MOBILE};
          z-index: 199;
          display: flex;
          flex-direction: column;
          padding: 32px 32px 48px;
          gap: 0;
          transform: translateX(100%);
          transition: transform 0.32s cubic-bezier(.4,0,.2,1);
        }
        .kk-drawer.open { transform: translateX(0); }

        .kk-drawer-link {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 2rem;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          transition: color 0.15s;
        }
        .kk-drawer-link:last-of-type { border-bottom: none; }
        .kk-drawer-link:hover, .kk-drawer-link.active { color: #fff; }

        /* hide desktop nav on small screens */
        @media (max-width: 768px) {
          .kk-desktop-nav { display: none !important; }
          .kk-burger-btn  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .kk-burger-btn { display: none !important; }
          .kk-drawer     { display: none !important; }
        }
        /* tighter padding on very small screens */
        @media (max-width: 480px) {
          .kk-header-inner { padding: 0 20px !important; }
        }
      `}</style>

      {/* ══════════════ HEADER BAR ══════════════ */}
      <header style={headerStyle} className="kk-header-inner">

        {/* ── Logo ── */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
          onClick={() => setMenuOpen(false)}>
          {/* Crown SVG icon */}
          <svg className="kk-header-crown" viewBox="0 0 36 28" style={{ width: "34px", height: "26px" }} fill="none">
            <path d="M2 24 L8 8 L18 18 L28 4 L34 16 L34 24 Z"
              fill="rgba(201,168,76,0.25)" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
            <circle cx="8"  cy="8"  r="2" fill="#C9A84C"/>
            <circle cx="18" cy="18" r="2" fill="#C9A84C"/>
            <circle cx="28" cy="4"  r="2" fill="#C9A84C"/>
            <rect x="2" y="23" width="32" height="3" rx="1" fill="#C9A84C" opacity="0.6"/>
          </svg>
          <span style={logoTextStyle}>Kebkab Events</span>
        </a>

        {/* ── Desktop nav ── */}
        <nav className="kk-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activePath === href;
            return (
              <a
                key={href} href={href}
                style={isActive ? linkActive : linkBase}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.78)"; } }}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* ── Desktop CTA ── */}
        <a
          href="/contact"
          className="kk-desktop-nav"
          style={ctaStyle}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          Book Your Event
        </a>

        {/* ── Hamburger (mobile only) ── */}
        <button
          className={`kk-burger-btn kk-burger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display:        "none", /* shown via media query */
            flexDirection:  "column",
            gap:            "5px",
            background:     "none",
            border:         "none",
            cursor:         "pointer",
            padding:        "6px",
          }}
        >
          <span />
          <span />
          <span />
        </button>

      </header>

      {/* ══════════════ MOBILE DRAWER ══════════════ */}
      <nav className={`kk-drawer${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className={`kk-drawer-link${activePath === href ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}

        {/* Mobile CTA */}
        <a
          href="/contact"
          onClick={() => setMenuOpen(false)}
          style={{
            marginTop:     "32px",
            fontFamily:    "Inter, sans-serif",
            fontSize:      "15px",
            fontWeight:    600,
            color:         "#fff",
            border:        "1.5px solid rgba(255,255,255,0.45)",
            borderRadius:  "2px",
            padding:       "14px 28px",
            textDecoration: "none",
            textAlign:     "center",
          }}
        >
          Book Your Event
        </a>
      </nav>
    </>
  );
}