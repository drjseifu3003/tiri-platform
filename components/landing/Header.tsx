"use client";

import React, { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Services", href: "/services" },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/contact" },
];

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

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      {/* ══════════════ HEADER BAR ══════════════ */}
      <header className={`kk-header ${showSolid ? "kk-header-solid" : "kk-header-trans"}`}>

        {/* ── Logo ── */}
        <a href="/" className="kk-header-logo"
          onClick={() => setMenuOpen(false)}>
          {/* Crown SVG icon */}
          <svg className="kk-header-crown" viewBox="0 0 36 28" fill="none">
            <path d="M2 24 L8 8 L18 18 L28 4 L34 16 L34 24 Z"
              fill="rgba(201,168,76,0.25)" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
            <circle cx="8"  cy="8"  r="2" fill="#C9A84C"/>
            <circle cx="18" cy="18" r="2" fill="#C9A84C"/>
            <circle cx="28" cy="4"  r="2" fill="#C9A84C"/>
            <rect x="2" y="23" width="32" height="3" rx="1" fill="#C9A84C" opacity="0.6"/>
          </svg>
          <span className="kk-header-brand-text">Kebkab Events</span>
        </a>

        {/* ── Desktop nav ── */}
        <nav className="kk-header-nav">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activePath === href;
            return (
              <a
                key={href} href={href}
                className={`kk-header-link ${isActive ? "kk-header-link-active" : ""}`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* ── Desktop CTA ── */}
        <a
          href="/contact"
          className="kk-header-cta"
        >
          Book Your Event
        </a>

        {/* ── Hamburger (mobile only) ── */}
        <button
          className={`kk-header-burger${menuOpen ? " kk-header-burger-open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

      </header>

      {/* ══════════════ MOBILE DRAWER ══════════════ */}
      <nav className={`kk-header-drawer${menuOpen ? " kk-header-drawer-open" : ""}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className={`kk-header-drawer-link${activePath === href ? " kk-header-drawer-link-active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}

        {/* Mobile CTA */}
        <a
          href="/contact"
          className="kk-header-drawer-cta"
          onClick={() => setMenuOpen(false)}
        >
          Book Your Event
        </a>
      </nav>
    </>
  );
}
