"use client";
import React, { useState } from "react";

const IMG_GALLERY = [
  "/images/couple-1.jpg",
  "/images/couple-2.jpg",
  "/images/couple-3.jpg",
  "/images/couple-2.jpg",
  "/images/couple-1.jpg",
  "/images/couple-3.jpg",
];

const PlusIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, fill: "none", stroke: "white", strokeWidth: 2 }}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function GallerySection() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section className="kk-section" style={{ background: "var(--surface)" }}>
      <div className="kk-container">
        <div className="text-center mb-10 md:mb-12 lg:mb-14">
          <p className="kk-label">Portfolio</p>
          <h2 className="kk-section-title text-center">Our passion is your perfect event</h2>
        </div>

        <div className="hidden lg:block kk-gallery-grid">
          {/* Left col top */}
          <div style={{ gridColumn: "1", gridRow: "1", borderRadius: "4px", overflow: "hidden" }}>
            <div className="kk-gallery-cell" onClick={() => setLightbox(0)}>
              <img src={IMG_GALLERY[0]} alt="Gallery 1" />
              <div className="kk-gallery-overlay">
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlusIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Center col — tall */}
          <div style={{ gridColumn: "2", gridRow: "1/3", borderRadius: "4px", overflow: "hidden" }}>
            <div className="kk-gallery-cell" style={{ height: "100%" }} onClick={() => setLightbox(1)}>
              <img src={IMG_GALLERY[1]} alt="Gallery 2" style={{ height: "100%" }} />
              <div className="kk-gallery-overlay">
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlusIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Right col top */}
          <div style={{ gridColumn: "3", gridRow: "1", borderRadius: "4px", overflow: "hidden" }}>
            <div className="kk-gallery-cell" onClick={() => setLightbox(2)}>
              <img src={IMG_GALLERY[2]} alt="Gallery 3" />
              <div className="kk-gallery-overlay">
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlusIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Left col bottom */}
          <div style={{ gridColumn: "1", gridRow: "2", borderRadius: "4px", overflow: "hidden" }}>
            <div className="kk-gallery-cell" onClick={() => setLightbox(3)}>
              <img src={IMG_GALLERY[3]} alt="Gallery 4" />
              <div className="kk-gallery-overlay">
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlusIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Right col bottom — split 2 */}
          <div style={{ gridColumn: "3", gridRow: "2", display: "grid", gridTemplateRows: "1fr 1fr", gap: "6px" }}>
            {[4, 5].map(i => (
              <div key={i} style={{ borderRadius: "4px", overflow: "hidden" }}>
                <div className="kk-gallery-cell" style={{ height: "100%" }} onClick={() => setLightbox(i)}>
                  <img src={IMG_GALLERY[i]} alt={`Gallery ${i + 1}`} style={{ height: "100%" }} />
                  <div className="kk-gallery-overlay">
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PlusIcon size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile gallery — responsive grid */}
        <div className="lg:hidden grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {IMG_GALLERY.map((src, i) => (
            <div key={i} className="rounded overflow-hidden bg-[var(--primary-lighter)] cursor-pointer group relative aspect-square">
              <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
              <div className="absolute inset-0 bg-[var(--primary)]/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-1.5 border-white/70 flex items-center justify-center">
                  <PlusIcon size={20} />
                </div>
              </div>
              <button onClick={() => setLightbox(i)} className="sr-only">View</button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="kk-lightbox" onClick={() => setLightbox(null)}>
          <img
            src={IMG_GALLERY[lightbox]}
            alt="Gallery"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "4px", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}
          />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: "24px", right: "28px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: "32px" }}>×</button>
        </div>
      )}
    </section>
  );
}
