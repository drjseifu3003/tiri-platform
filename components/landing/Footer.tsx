"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="kk-footer">
      <div className="kk-footer-grid">

        {/* LEFT — Address & Hours */}
        <div>
          <p className="kk-footer-label">Address</p>
          <p className="kk-footer-value">Oxford Ave. Cary, NC 27511</p>
          <p className="kk-footer-label" style={{ marginTop: "28px" }}>Opening hours</p>
          <p className="kk-footer-value">Sun–Mon: 10am – 10pm</p>
        </div>

        {/* CENTER — Logo + tagline + social */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" style={{ width: "15px", fill: "none", stroke: "#fff", strokeWidth: 1.5 }}>
                <path d="M12 3C7.5 3 4 6.5 4 11c0 3.2 1.8 6 4.5 7.5V21h7v-2.5C18.2 17 20 14.2 20 11c0-4.5-3.5-8-8-8z"/>
                <path d="M9 11c0-1.7 1.3-3 3-3s3 1.3 3 3" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, fontSize: "22px", color: "#fff" }}>
              Kebkab Events
            </span>
          </div>

          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "300px" }}>
            Expertly planning every detail of your Orthodox event, making each moment a cherished memory.
          </p>

          {/* Social icons */}
          <div style={{ display: "flex", gap: "12px" }}>
            {[
              <svg key="fb" viewBox="0 0 24 24" fill="white" style={{ width: "17px", height: "17px" }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
              <svg key="ig" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "17px", height: "17px" }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>,
              <svg key="x" viewBox="0 0 24 24" fill="white" style={{ width: "17px", height: "17px" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
              <svg key="yt" viewBox="0 0 24 24" fill="white" style={{ width: "17px", height: "17px" }}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>,
            ].map((icon, i) => (
              <a key={i} href="#" className="kk-social-btn">{icon}</a>
            ))}
          </div>
        </div>

        {/* RIGHT — Phone & Email */}
        <div style={{ textAlign: "right" }}>
          <p className="kk-footer-label">Phone</p>
          <p className="kk-footer-value">+322 683–5910</p>
          <p className="kk-footer-label" style={{ marginTop: "28px" }}>Email</p>
          <p className="kk-footer-value">hello@kebkabevents.com</p>
        </div>

      </div>

      <div className="kk-footer-divider" />
      <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
        © Copyright Kebkab Events 2024. Orthodox wedding planning platform.
      </p>
    </footer>
  );
}