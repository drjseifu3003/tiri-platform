"use client";
import React, { useState, useEffect, useCallback } from "react";

// ─── WeddingGallery ───────────────────────────────────────────────────────────
// Reusable across ALL religion & culture templates.
// Features:
//   • 3-col photo grid with hover zoom
//   • Full-screen lightbox with ← → keyboard navigation
//   • "Join Telegram Channel" CTA to get more photos/videos
//   • "Share Invitation" button to share the invite link on Telegram
// NO share-single-photo button — guests join the channel to get images.
//
// Usage in any template (before RSVP block):
//
//   import WeddingGallery from "@/components/wedding-templates/shared/WeddingGallery";
//
//   {(data.galleryImages?.length ?? 0) > 0 && (
//     <WeddingGallery
//       images={data.galleryImages!}
//       telegramChannel={data.telegramChannel}
//       telegramName={data.telegramChannelName}
//       coupleNames={`${data.groomName} & ${data.brideName}`}
//       accentColor="#C9942A"
//       bgColor="#2B0812"
//       textColor="#F4ECD8"
//     />
//   )}

type Props = {
  images: string[];
  telegramChannel?: string;   // "https://t.me/fikerab_fenan_wedding"
  telegramName?: string;      // "@fikerab_fenan_wedding"
  coupleNames: string;
  accentColor?: string;
  bgColor?: string;
  textColor?: string;
};

export default function WeddingGallery({
  images,
  telegramChannel,
  telegramName,
  coupleNames,
  accentColor = "#C9942A",
  bgColor     = "#1a0a00",
  textColor   = "#F5EDD6",
}: Props) {
  const [lb, setLb] = useState<number | null>(null);

  // keyboard nav
  const onKey = useCallback((e: KeyboardEvent) => {
    if (lb === null) return;
    if (e.key === "ArrowRight") setLb(i => i !== null ? Math.min(i + 1, images.length - 1) : null);
    if (e.key === "ArrowLeft")  setLb(i => i !== null ? Math.max(i - 1, 0) : null);
    if (e.key === "Escape")     setLb(null);
  }, [lb, images.length]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lb !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lb]);

  // share the invitation page on Telegram
  const shareInvite = () => {
    const text = encodeURIComponent(`You're invited to ${coupleNames}'s Wedding! 💍\n`);
    const url  = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  if (!images.length) return null;

  const TG = (size = 20) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#29B6F6" style={{flexShrink:0}}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.367l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.192z"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .wg { background:${bgColor}; }
        .wg * { box-sizing:border-box; }

        /* ── header ── */
        .wg-hd { display:flex; align-items:flex-end; justify-content:space-between; padding:28px 22px 16px; }
        .wg-hd-eye { font-size:8px; letter-spacing:.22em; text-transform:uppercase; color:${accentColor}; opacity:.72; margin-bottom:5px; }
        .wg-hd-title { font-size:1.3rem; color:${textColor}; }
        .wg-hd-count { font-size:11px; color:rgba(255,255,255,.28); }

        /* ── grid ── */
        .wg-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
        .wg-cell { position:relative; aspect-ratio:1; overflow:hidden; cursor:zoom-in; background:rgba(255,255,255,.05); }
        .wg-cell img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .45s ease; }
        .wg-cell:hover img { transform:scale(1.07); }
        .wg-cell-ov { position:absolute; inset:0; background:rgba(0,0,0,0); display:flex; align-items:center; justify-content:center; transition:background .22s; }
        .wg-cell:hover .wg-cell-ov { background:rgba(0,0,0,.35); }
        .wg-zoom { opacity:0; transition:opacity .22s; }
        .wg-cell:hover .wg-zoom { opacity:1; }

        /* ── telegram CTA ── */
        .wg-tg { margin:12px 22px 0; }

        /* Join channel — full-width prominent button */
        .wg-tg-join {
          display:flex; align-items:center; gap:12px;
          padding:15px 18px; width:100%;
          background:rgba(41,182,246,.12);
          border:1px solid rgba(41,182,246,.28);
          text-decoration:none; transition:background .2s;
          margin-bottom:8px;
        }
        .wg-tg-join:hover { background:rgba(41,182,246,.2); }
        .wg-tg-join-icon { width:40px; height:40px; border-radius:50%; background:rgba(41,182,246,.18); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .wg-tg-join-text {}
        .wg-tg-join-main { font-size:13px; font-weight:700; color:#29B6F6; line-height:1.3; }
        .wg-tg-join-sub { font-size:10px; color:rgba(41,182,246,.55); margin-top:2px; }

        /* Share invite — secondary */
        .wg-tg-share {
          display:flex; align-items:center; gap:12px;
          padding:12px 18px; width:100%;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.1);
          cursor:pointer; transition:background .2s;
        }
        .wg-tg-share:hover { background:rgba(255,255,255,.08); }
        .wg-tg-share-main { font-size:12px; font-weight:600; color:${textColor}; opacity:.75; line-height:1.25; }
        .wg-tg-share-sub { font-size:10px; color:rgba(255,255,255,.28); margin-top:1px; }

        .wg-tg-note { text-align:center; padding:12px 22px 24px; font-size:10.5px; color:rgba(255,255,255,.25); line-height:1.6; }
        .wg-tg-note a { color:#29B6F6; text-decoration:none; font-weight:600; }

        /* ── lightbox ── */
        .wg-lb { position:fixed; inset:0; background:rgba(0,0,0,.95); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; }
        .wg-lb-img { max-width:100%; max-height:72vh; object-fit:contain; display:block; border-radius:2px; }
        .wg-lb-close { position:absolute; top:16px; right:16px; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18); color:#fff; font-size:17px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .wg-lb-close:hover { background:rgba(255,255,255,.22); }
        .wg-lb-caption { font-size:11px; color:rgba(255,255,255,.28); margin-top:10px; }
        .wg-lb-nav { display:flex; align-items:center; gap:10px; margin-top:12px; }
        .wg-lb-arr { width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.16); color:#fff; font-size:16px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s; }
        .wg-lb-arr:hover { background:rgba(255,255,255,.2); }
        .wg-lb-arr:disabled { opacity:.25; cursor:not-allowed; }
        .wg-lb-ctr { font-size:12px; color:rgba(255,255,255,.35); min-width:48px; text-align:center; }
        /* Join channel inside lightbox */
        .wg-lb-join { display:flex; align-items:center; gap:8px; padding:9px 16px; background:rgba(41,182,246,.14); border:1px solid rgba(41,182,246,.3); color:#29B6F6; font-size:11.5px; font-weight:700; text-decoration:none; transition:background .2s; }
        .wg-lb-join:hover { background:rgba(41,182,246,.24); }
      `}</style>

      <div className="wg">

        {/* Header */}
        <div className="wg-hd">
          <div>
            <p className="wg-hd-eye">Wedding Gallery</p>
            <p className="wg-hd-title">Our Photos</p>
          </div>
          <p className="wg-hd-count">{images.length} photos</p>
        </div>

        {/* Grid */}
        <div className="wg-grid">
          {images.map((src, i) => (
            <div key={i} className="wg-cell" onClick={() => setLb(i)}>
              <img src={src} alt={`Photo ${i + 1}`} loading="lazy" />
              <div className="wg-cell-ov">
                <svg className="wg-zoom" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2">
                  <circle cx="11" cy="11" r="6.5"/>
                  <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Telegram CTA */}
        <div className="wg-tg">

          {/* Join channel */}
          {telegramChannel && (
            <a href={telegramChannel} target="_blank" rel="noreferrer" className="wg-tg-join">
              <div className="wg-tg-join-icon">{TG(22)}</div>
              <div className="wg-tg-join-text">
                <p className="wg-tg-join-main">
                  {telegramName ? `Join ${telegramName}` : "Join our Telegram Channel"}
                </p>
                <p className="wg-tg-join-sub">Get all photos &amp; videos from the wedding</p>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#29B6F6" strokeWidth="2" style={{marginLeft:"auto",flexShrink:0,opacity:.6}}>
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}

          {/* Share invite */}
          <button className="wg-tg-share" onClick={shareInvite}>
            {TG(18)}
            <div>
              <p className="wg-tg-share-main">Share this Invitation on Telegram</p>
              <p className="wg-tg-share-sub">Send to family &amp; friends</p>
            </div>
          </button>

        </div>

        {telegramChannel && (
          <p className="wg-tg-note">
            All wedding photos &amp; videos are on our{" "}
            <a href={telegramChannel} target="_blank" rel="noreferrer">Telegram channel →</a>
          </p>
        )}

        {/* Lightbox */}
        {lb !== null && (
          <div className="wg-lb" onClick={() => setLb(null)}>
            <button className="wg-lb-close" onClick={() => setLb(null)}>✕</button>

            <img
              className="wg-lb-img"
              src={images[lb]}
              alt={`Photo ${lb + 1}`}
              onClick={e => e.stopPropagation()}
            />

            <p className="wg-lb-caption">{coupleNames} · {lb + 1} of {images.length}</p>

            <div className="wg-lb-nav" onClick={e => e.stopPropagation()}>
              <button className="wg-lb-arr" disabled={lb === 0}
                onClick={() => setLb(i => i !== null ? i - 1 : null)}>←</button>
              <span className="wg-lb-ctr">{lb + 1} / {images.length}</span>
              <button className="wg-lb-arr" disabled={lb === images.length - 1}
                onClick={() => setLb(i => i !== null ? i + 1 : null)}>→</button>

              {/* Join channel from lightbox */}
              {telegramChannel && (
                <a href={telegramChannel} target="_blank" rel="noreferrer"
                  className="wg-lb-join" onClick={e => e.stopPropagation()}>
                  {TG(14)}
                  Get all photos
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
