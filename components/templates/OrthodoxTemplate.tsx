"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useCountdown, useRSVP, useLang, getEthiopianDate, getCalendarDays } from "@/lib/hooks";

// ─────────────────────────────────────────────────────────────────────────────
//  ORTHODOX HOLY UNION — ቅዱስ ጋብቻ
//
//  Design language from real Ethiopian Orthodox cards + church art:
//  • Deep crimson #1C0508 hero — same as liturgical vestments
//  • Ethiopian filigree cross SVG — real interlocking lattice cross geometry
//  • Wedding rings intertwined SVG — appears in most Orthodox cards  
//  • Adey Abeba yellow flowers — Ethiopia's national flower, 4 corners
//  • Teklil crown PNG floating above the cross
//  • Cream/gold text only — perfect contrast, never invisible
//  • Debre Berhan-inspired border motif around hero section
//  • Photo section comes BELOW the symbolic hero — clean separation
//  • Tilet woven stripe borders fixed on sides
//  • No arch frame — clean, readable, elegant
// ─────────────────────────────────────────────────────────────────────────────

export default function OrthodoxHolyUnion({ data }: { data: any }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug ?? "ort");
  const { lang, toggle } = useLang();
  const gc   = new Date(data.date);
  const eth  = getEthiopianDate(data.date);
  const cal  = getCalendarDays(data.date);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    [60,300,700,1100,1500,2000].forEach((ms, i) =>
      setTimeout(() => setPhase(p => Math.max(p, i + 1)), ms)
    );
  }, []);

  const cells: (number|null)[] = [];
  for (let i = 0; i < cal.firstDay; i++) cells.push(null);
  for (let d = 1; d <= cal.daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (muted) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let v = 0;
      const f = setInterval(() => {
        v = Math.min(v + 0.04, 0.6);
        if (audioRef.current) audioRef.current.volume = v;
        if (v >= 0.6) clearInterval(f);
      }, 100);
      setMuted(false);
    } else {
      audioRef.current.pause();
      setMuted(true);
    }
  }, [muted]);

  const programme = (data.program?.length > 0) ? data.program : [
    { time:"8:00 AM",  timeAm:"2:00 ጠዋት",  title:"Divine Liturgy",     titleAm:"ቅዳሴ",    desc:"Holy mass at the church" },
    { time:"9:30 AM",  timeAm:"3:30 ጠዋት",  title:"Teklil Ceremony",    titleAm:"ተክሊል",   desc:"Sacred crowning of the couple" },
    { time:"11:00 AM", timeAm:"5:00 ጠዋት",  title:"Zefed · Procession", titleAm:"ዘፈድ",    desc:"Wedding march & celebration" },
    { time:"1:00 PM",  timeAm:"7:00 ቀን",   title:"Reception & Feast",  titleAm:"ግብዣ",    desc:"Traditional injera banquet" },
    { time:"3:00 PM",  timeAm:"9:00 ቀን",   title:"Gursha Ceremony",    titleAm:"ጉርሻ",    desc:"Unity feeding ritual" },
    { time:"5:00 PM",  timeAm:"11:00 ቀን",  title:"Eskista & Music",    titleAm:"እስኪስታ", desc:"Traditional dance & celebration" },
  ];

  const groom = lang==="am" && data.groomNameAm ? data.groomNameAm : data.groomName;
  const bride = lang==="am" && data.brideNameAm ? data.brideNameAm : data.brideName;

  // ────────────────────────────────────────────────────────────────────────
  // Ethiopian Filigree Cross SVG
  // Based on real Gondar/Axum processional cross geometry:
  // broad arms, triangular filigree cutouts, outer decorative points
  // ────────────────────────────────────────────────────────────────────────
  const EthCross = ({ size = 120, gold = "#C8901A", dark = "#1C0508" }: { size?: number; gold?: string; dark?: string }) => (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: "block" }}>
      {/* Outer glow ring */}
      <circle cx="100" cy="100" r="72" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.25"/>
      <circle cx="100" cy="100" r="68" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.18"/>

      {/* Main cross body — broad arms */}
      <rect x="84" y="14" width="32" height="172" rx="4" fill={gold}/>
      <rect x="14" y="84" width="172" height="32" rx="4" fill={gold}/>

      {/* Arm filigree cutouts — triangular voids in each arm */}
      {/* Top arm */}
      <polygon points="100,22 90,50 110,50" fill={dark}/>
      <polygon points="100,30 93,52 107,52" fill={gold} opacity="0.3"/>
      {/* Bottom arm */}
      <polygon points="100,178 90,150 110,150" fill={dark}/>
      <polygon points="100,170 93,148 107,148" fill={gold} opacity="0.3"/>
      {/* Left arm */}
      <polygon points="22,100 50,90 50,110" fill={dark}/>
      <polygon points="30,100 52,93 52,107" fill={gold} opacity="0.3"/>
      {/* Right arm */}
      <polygon points="178,100 150,90 150,110" fill={dark}/>
      <polygon points="170,100 148,93 148,107" fill={gold} opacity="0.3"/>

      {/* Outer decorative tips on each arm end */}
      {/* Top */}
      <polygon points="100,6 94,18 106,18" fill={gold}/>
      <polygon points="88,12 84,20 96,20" fill={gold} opacity="0.6"/>
      <polygon points="112,12 104,20 116,20" fill={gold} opacity="0.6"/>
      {/* Bottom */}
      <polygon points="100,194 94,182 106,182" fill={gold}/>
      <polygon points="88,188 84,180 96,180" fill={gold} opacity="0.6"/>
      <polygon points="112,188 104,180 116,180" fill={gold} opacity="0.6"/>
      {/* Left */}
      <polygon points="6,100 18,94 18,106" fill={gold}/>
      <polygon points="12,88 20,84 20,96" fill={gold} opacity="0.6"/>
      <polygon points="12,112 20,104 20,116" fill={gold} opacity="0.6"/>
      {/* Right */}
      <polygon points="194,100 182,94 182,106" fill={gold}/>
      <polygon points="188,88 180,84 180,96" fill={gold} opacity="0.6"/>
      <polygon points="188,112 180,104 180,116" fill={gold} opacity="0.6"/>

      {/* Center medallion — circle with inner cross */}
      <circle cx="100" cy="100" r="20" fill={dark} stroke={gold} strokeWidth="2"/>
      <circle cx="100" cy="100" r="14" fill={gold}/>
      <rect x="97" y="88" width="6" height="24" fill={dark}/>
      <rect x="88" y="97" width="24" height="6" fill={dark}/>
      <circle cx="100" cy="100" r="4" fill={gold}/>

      {/* Filigree lattice lines in arm body */}
      <line x1="84" y1="60" x2="116" y2="60" stroke={dark} strokeWidth="1.5" opacity="0.6"/>
      <line x1="84" y1="140" x2="116" y2="140" stroke={dark} strokeWidth="1.5" opacity="0.6"/>
      <line x1="60" y1="84" x2="60" y2="116" stroke={dark} strokeWidth="1.5" opacity="0.6"/>
      <line x1="140" y1="84" x2="140" y2="116" stroke={dark} strokeWidth="1.5" opacity="0.6"/>

      {/* Diagonal filigree details */}
      <line x1="88" y1="56" x2="84" y2="60" stroke={gold} strokeWidth="1" opacity="0.5"/>
      <line x1="112" y1="56" x2="116" y2="60" stroke={gold} strokeWidth="1" opacity="0.5"/>
      <line x1="88" y1="144" x2="84" y2="140" stroke={gold} strokeWidth="1" opacity="0.5"/>
      <line x1="112" y1="144" x2="116" y2="140" stroke={gold} strokeWidth="1" opacity="0.5"/>
      <line x1="56" y1="88" x2="60" y2="84" stroke={gold} strokeWidth="1" opacity="0.5"/>
      <line x1="56" y1="112" x2="60" y2="116" stroke={gold} strokeWidth="1" opacity="0.5"/>
      <line x1="144" y1="88" x2="140" y2="84" stroke={gold} strokeWidth="1" opacity="0.5"/>
      <line x1="144" y1="112" x2="140" y2="116" stroke={gold} strokeWidth="1" opacity="0.5"/>
    </svg>
  );

  // ────────────────────────────────────────────────────────────────────────
  // Wedding Rings SVG — interlocked, like real Orthodox card illustrations
  // ────────────────────────────────────────────────────────────────────────
  const WeddingRings = ({ size = 70 }: { size?: number }) => (
    <svg viewBox="0 0 140 70" width={size} height={size/2} style={{ display: "block" }}>
      {/* Left ring */}
      <circle cx="50" cy="35" r="28" fill="none" stroke="#C8901A" strokeWidth="7"/>
      <circle cx="50" cy="35" r="28" fill="none" stroke="#E8C060" strokeWidth="3.5" strokeDasharray="2 4"/>
      {/* Right ring — overlaps */}
      <circle cx="90" cy="35" r="28" fill="none" stroke="#C8901A" strokeWidth="7"/>
      <circle cx="90" cy="35" r="28" fill="none" stroke="#E8C060" strokeWidth="3.5" strokeDasharray="2 4"/>
      {/* Overlap mask — right ring front where they cross */}
      <path d="M70 10 Q82 22 82 35 Q82 48 70 60 Q78 48 78 35 Q78 22 70 10Z" fill="#1C0508"/>
      <path d="M70 10 Q82 22 82 35 Q82 48 70 60 Q78 48 78 35 Q78 22 70 10Z" fill="none" stroke="#C8901A" strokeWidth="7"/>
      <path d="M70 10 Q82 22 82 35 Q82 48 70 60 Q78 48 78 35 Q78 22 70 10Z" fill="none" stroke="#E8C060" strokeWidth="3.5" strokeDasharray="2 4"/>
    </svg>
  );

  // ────────────────────────────────────────────────────────────────────────
  // Adey Abeba — Ethiopia's national flower (yellow daisy-like)
  // ────────────────────────────────────────────────────────────────────────
  const AdeyAbeba = ({ size = 52, opacity = 0.9 }: { size?: number; opacity?: number }) => (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }} opacity={opacity}>
      {[0,40,80,120,160,200,240,280,320].map(a => (
        <ellipse key={a} cx="50" cy="21" rx="7" ry="17"
          fill="#D4A017" transform={`rotate(${a} 50 50)`} opacity="0.92"/>
      ))}
      {[0,40,80,120,160,200,240,280,320].map(a => (
        <ellipse key={`h${a}`} cx="50" cy="19" rx="3.5" ry="9"
          fill="#F0C840" transform={`rotate(${a} 50 50)`} opacity="0.55"/>
      ))}
      <circle cx="50" cy="50" r="13" fill="#7B3500"/>
      <circle cx="50" cy="50" r="9"  fill="#A04800"/>
      <circle cx="50" cy="50" r="5"  fill="#D4A017"/>
      {/* Pollen dots */}
      {[0,60,120,180,240,300].map(a => (
        <circle key={`p${a}`} cx="50" cy="42" r="1.5"
          fill="#F5D060" transform={`rotate(${a} 50 50)`} opacity="0.8"/>
      ))}
    </svg>
  );

  // ────────────────────────────────────────────────────────────────────────
  // Debre-Berhan border motif — repeating unit from church ceiling pattern
  // Simple alternating diamond-and-dot
  // ────────────────────────────────────────────────────────────────────────
  const BorderStripe = ({ width = 390 }: { width?: number }) => (
    <svg viewBox={`0 0 ${width} 20`} width="100%" height="20" style={{ display: "block" }}>
      {Array.from({ length: Math.ceil(width / 20) }).map((_, i) => (
        <g key={i} transform={`translate(${i * 20}, 0)`}>
          <polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="#C8901A" strokeWidth="1" opacity="0.55"/>
          <circle cx="10" cy="10" r="2.5" fill="#C8901A" opacity="0.5"/>
        </g>
      ))}
    </svg>
  );

  // Section divider with small cross
  const Divider = ({ my = 28 }: { my?: number }) => (
    <div style={{ display:"flex", alignItems:"center", padding:"0 24px", margin:`${my}px 0`, gap:10 }}>
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(200,144,26,.4),transparent)" }}/>
      <EthCross size={20} gold="#C8901A" dark="#1C0508"/>
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(200,144,26,.4),transparent)" }}/>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;500;600;700&family=Noto+Serif+Ethiopic:wght@300;400;500;600;700&display=swap');

        .ort{background:#1C0508;color:#F4EAD0;font-family:'Cinzel',Georgia,serif;max-width:430px;margin:0 auto;overflow-x:hidden;position:relative;}
        .ort *{box-sizing:border-box;margin:0;padding:0;}

        /* Velvet grain */
        .ort-grain{position:fixed;inset:0;max-width:430px;left:50%;transform:translateX(-50%);pointer-events:none;z-index:9999;opacity:0.038;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");background-size:180px;}

        /* Tilet side borders */
        .ort-tb{position:fixed;top:0;bottom:0;width:7px;pointer-events:none;z-index:9998;opacity:0.6;background-image:repeating-linear-gradient(-58deg,#8B1414 0px,#8B1414 3px,#C8901A 3px,#C8901A 5px,#1C0508 5px,#1C0508 8px);background-size:8px 8px;}
        .ort-tb.l{left:0;}.ort-tb.r{right:0;}

        /* Entrance phases */
        .ph1{opacity:0;transform:translateY(-40px) scale(0.85);transition:opacity 1s cubic-bezier(.15,.9,.3,1),transform 1s cubic-bezier(.15,.9,.3,1);}
        .ph1.on{opacity:1;transform:none;}
        .ph2{opacity:0;transition:opacity 0.9s ease;}
        .ph2.on{opacity:1;}
        .ph3{opacity:0;transform:translateY(16px);transition:opacity 0.8s ease,transform 0.8s ease;}
        .ph3.on{opacity:1;transform:none;}
        .ph4{opacity:0;transform:translateY(12px);transition:opacity 0.75s ease;}
        .ph4.on{opacity:1;transform:none;}

        /* ── HERO SECTION — crimson velvet with cultural symbols ── */
        .ort-hero{
          background:#1C0508;
          padding:0 0 36px;
          text-align:center;
          position:relative;
          overflow:hidden;
        }

        /* Radial gold glow from center — like candlelight */
        .ort-hero::before{
          content:'';position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(ellipse 80% 70% at 50% 52%,rgba(200,144,26,0.14) 0%,transparent 65%);
        }

        /* Crown */
        .ort-crown-wrap{
          margin:0 auto;
          padding-top:24px;
          width:180px;
          position:relative;
        }
        .ort-crown-img{
          width:100%;display:block;
          filter:drop-shadow(0 0 22px rgba(200,144,26,0.6)) drop-shadow(0 6px 18px rgba(0,0,0,0.8));
          animation:ort-float 5s ease-in-out infinite;
        }
        @keyframes ort-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        .ort-crown-aura{
          position:absolute;top:60%;left:50%;transform:translate(-50%,-48%);
          width:160px;height:60px;border-radius:50%;
          background:radial-gradient(ellipse,rgba(200,144,26,0.25) 0%,transparent 70%);
          animation:ort-aura 4.5s ease-in-out infinite;
          pointer-events:none;
        }
        @keyframes ort-aura{0%,100%{opacity:0.5;transform:translate(-50%,-48%) scale(1);}50%{opacity:1;transform:translate(-50%,-48%) scale(1.2);}}

        /* Eyebrow */
        .ort-eyebrow{
          font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.42em;
          text-transform:uppercase;color:rgba(200,144,26,0.68);
          display:block;margin:18px 0 10px;
        }

        /* Main cross */
        .ort-cross-wrap{
          margin:0 auto 10px;
          position:relative;
          width:fit-content;
        }
        .ort-cross-glow{
          position:absolute;inset:-20px;
          background:radial-gradient(ellipse,rgba(200,144,26,0.22) 0%,transparent 65%);
          animation:ort-glow-pulse 3s ease-in-out infinite;
          pointer-events:none;
        }
        @keyframes ort-glow-pulse{0%,100%{opacity:0.6;}50%{opacity:1;}}

        /* Scripture above names */
        .ort-scrip{
          font-family:'Noto Serif Ethiopic',serif;
          font-size:11.5px;color:rgba(244,234,208,0.72);
          line-height:1.85;padding:0 36px 14px;
          font-style:italic;
        }
        .ort-scrip-ref{
          font-size:9px;letter-spacing:0.18em;
          color:rgba(200,144,26,0.6);display:block;margin-top:5px;
        }

        /* Hair divider line */
        .ort-hl{display:flex;align-items:center;gap:8px;padding:0 28px;margin:10px 0;}
        .ort-hl-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(200,144,26,.5),transparent);}

        /* Names — large, legible, cultural */
        .ort-name{
          font-family:'Noto Serif Ethiopic',serif;
          font-size:clamp(2.2rem,10vw,3.2rem);
          font-weight:700;line-height:1.15;
          color:#F4EAD0;display:block;
          text-shadow:0 2px 20px rgba(200,144,26,0.4);
          animation:ort-name-pulse 4s ease-in-out infinite;
        }
        @keyframes ort-name-pulse{
          0%,100%{text-shadow:0 2px 20px rgba(200,144,26,0.4);}
          50%{text-shadow:0 2px 36px rgba(200,144,26,0.75),0 0 70px rgba(200,144,26,0.25);}
        }
        .ort-name-en{
          font-family:'Cinzel Decorative',serif;
          font-size:clamp(.9rem,3.5vw,1.2rem);
          font-weight:400;color:rgba(244,234,208,0.75);
          letter-spacing:0.06em;display:block;margin-top:6px;
        }
        .ort-and{
          font-family:'Cinzel',serif;font-size:1rem;
          color:rgba(200,144,26,0.75);letter-spacing:0.2em;
          display:block;margin:8px 0;
        }

        /* Rings + tagline */
        .ort-rings{margin:14px auto 0;width:fit-content;}
        .ort-tag{
          font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.26em;
          text-transform:uppercase;color:rgba(244,234,208,0.32);
          display:block;margin-top:10px;
        }

        /* Adey Abeba flowers — absolute positioned in hero corners */
        .ort-fl{position:absolute;pointer-events:none;}
        .ort-fl.tl{top:18px;left:16px;}
        .ort-fl.tr{top:18px;right:16px;transform:scaleX(-1);}
        .ort-fl.bl{bottom:26px;left:16px;transform:scaleY(-1);}
        .ort-fl.br{bottom:26px;right:16px;transform:scale(-1,-1);}

        /* ── PHOTO SECTION ── */
        .ort-photo-section{position:relative;}
        .ort-photo-img{
          width:100%;display:block;
          max-height:62vh;object-fit:cover;object-position:center 20%;
        }
        .ort-photo-ov{
          position:absolute;inset:0;
          background:linear-gradient(180deg,rgba(28,5,8,0.5) 0%,rgba(28,5,8,0.0) 30%,rgba(28,5,8,0.0) 65%,rgba(28,5,8,0.7) 100%);
        }

        /* ── DATE BAND ── */
        .ort-dates{
          display:grid;grid-template-columns:1fr 1px 1fr;
          background:rgba(0,0,0,0.5);
          border-top:1px solid rgba(200,144,26,0.22);
          border-bottom:1px solid rgba(200,144,26,0.22);
        }
        .ort-dc{padding:20px 10px;text-align:center;}
        .ort-dl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(200,144,26,0.65);margin-bottom:8px;display:block;}
        .ort-dn{font-family:'Cinzel',serif;font-size:3rem;font-weight:700;color:#F4EAD0;line-height:1;display:block;}
        .ort-ds{font-family:'Cinzel',serif;font-size:11px;color:rgba(244,234,208,0.5);display:block;margin-top:4px;letter-spacing:0.05em;}
        .ort-de{font-family:'Noto Serif Ethiopic',serif;font-size:11px;color:#C8901A;opacity:0.8;display:block;margin-top:3px;}
        .ort-dvsep{background:rgba(200,144,26,0.2);margin:14px 0;}

        /* ── TIME STRIP ── */
        .ort-ts{
          background:rgba(0,0,0,0.45);border-bottom:1px solid rgba(200,144,26,0.12);
          padding:14px 20px;display:flex;align-items:center;justify-content:center;gap:14px;
        }
        .ort-ts-sep{width:1px;height:30px;background:rgba(200,144,26,0.2);flex-shrink:0;}

        /* ── COUNTDOWN ── */
        .ort-cd{display:grid;grid-template-columns:repeat(4,1fr);background:rgba(0,0,0,0.55);}
        .ort-cdc{text-align:center;padding:18px 4px;border-right:1px solid rgba(200,144,26,0.1);}
        .ort-cdc:last-child{border-right:none;}
        .ort-cdn{font-family:'Cinzel',serif;font-size:2.5rem;font-weight:700;color:#C8901A;line-height:1;display:block;}
        .ort-cdl{font-size:7px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(244,234,208,0.24);margin-top:6px;display:block;}

        /* ── SECTION HEADERS ── */
        .ort-sh{text-align:center;padding:0 20px 16px;}
        .ort-sh-t{font-family:'Cinzel Decorative',serif;font-size:1.15rem;color:#F4EAD0;letter-spacing:0.04em;display:block;}
        .ort-sh-am{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:#C8901A;opacity:0.68;margin-top:5px;display:block;}

        /* ── GREETING ── */
        .ort-greet{padding:20px 28px 0;text-align:center;}
        .ort-ge{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:0.26em;text-transform:uppercase;color:rgba(200,144,26,0.68);margin-bottom:10px;display:block;}
        .ort-gt{font-family:'Cinzel Decorative',serif;font-size:clamp(1rem,4vw,1.35rem);color:#F4EAD0;line-height:1.35;margin-bottom:14px;display:block;}
        .ort-gb{font-family:'Cinzel',serif;font-size:13.5px;font-weight:400;line-height:1.95;color:rgba(244,234,208,0.72);}
        .ort-gam{font-family:'Noto Serif Ethiopic',serif;font-size:13px;color:rgba(244,234,208,0.5);line-height:2;margin-top:16px;padding-top:16px;border-top:1px solid rgba(200,144,26,0.12);display:block;}

        /* ── DETAILS ── */
        .ort-dets{background:rgba(0,0,0,0.3);border-top:1px solid rgba(200,144,26,0.18);border-bottom:1px solid rgba(200,144,26,0.18);}
        .ort-det{display:grid;grid-template-columns:54px 1fr;border-bottom:1px solid rgba(200,144,26,0.08);}
        .ort-det:last-child{border-bottom:none;}
        .ort-det-ic{display:flex;align-items:center;justify-content:center;font-size:19px;border-right:1px solid rgba(200,144,26,0.08);}
        .ort-det-b{padding:13px 16px;}
        .ort-det-k{font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:0.24em;text-transform:uppercase;color:#C8901A;opacity:0.75;margin-bottom:4px;display:block;}
        .ort-det-v{font-family:'Cinzel',serif;font-size:14px;color:#F4EAD0;line-height:1.4;}
        .ort-det-am{font-family:'Noto Serif Ethiopic',serif;font-size:11.5px;color:rgba(244,234,208,0.42);margin-top:3px;display:block;}

        /* ── CALENDAR ── */
        .ort-cal{padding:20px 18px 24px;background:rgba(0,0,0,0.2);}
        .ort-cal-hd{text-align:center;margin-bottom:16px;}
        .ort-cal-mo{font-family:'Cinzel Decorative',serif;font-size:1.45rem;color:#F4EAD0;letter-spacing:0.03em;display:block;}
        .ort-cal-eth{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:#C8901A;opacity:0.65;margin-top:5px;display:block;}
        .ort-cal-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px;}
        .ort-cal-d{text-align:center;font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:0.08em;color:rgba(244,234,208,0.28);padding:4px 0;}
        .ort-cal-g{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
        .ort-cal-c{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:12.5px;color:rgba(244,234,208,0.44);}
        .ort-cal-c.wed{background:radial-gradient(circle,rgba(200,144,26,0.42) 0%,rgba(200,144,26,0.1) 100%);border:1.5px solid #C8901A;color:#E8B84A;font-weight:700;border-radius:50%;animation:ort-cal-pulse 3s ease-in-out infinite;}
        @keyframes ort-cal-pulse{0%,100%{box-shadow:0 0 12px rgba(200,144,26,0.35);}50%{box-shadow:0 0 24px rgba(200,144,26,0.65);}}

        /* ── PROGRAMME ── */
        .ort-prog{padding:0 20px 24px;}
        .ort-pi{display:grid;grid-template-columns:78px 1fr;}
        .ort-pt{padding:13px 13px 13px 0;text-align:right;border-right:1.5px solid rgba(200,144,26,0.22);position:relative;}
        .ort-pn{position:absolute;right:-6px;top:50%;transform:translateY(-50%);width:11px;height:11px;background:#1C0508;border:2px solid #C8901A;border-radius:50%;box-shadow:0 0 8px rgba(200,144,26,0.55);}
        .ort-pt-am{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:#C8901A;display:block;}
        .ort-pt-en{font-size:9px;font-family:'Cinzel',serif;color:rgba(244,234,208,0.3);margin-top:2px;display:block;}
        .ort-pb{padding:13px 0 13px 16px;}
        .ort-pb-t{font-family:'Cinzel',serif;font-size:13.5px;font-weight:600;color:#F4EAD0;letter-spacing:0.04em;display:block;}
        .ort-pb-am{font-family:'Noto Serif Ethiopic',serif;font-size:11.5px;color:#C8901A;opacity:0.72;margin-top:2px;display:block;}
        .ort-pb-d{font-family:'Cinzel',serif;font-size:11px;color:rgba(244,234,208,0.35);margin-top:3px;display:block;}

        /* ── MAP ── */
        .ort-map{display:flex;align-items:center;justify-content:center;gap:9px;margin:0 20px 24px;padding:13px;border:1px solid rgba(200,144,26,0.32);color:#C8901A;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;position:relative;overflow:hidden;transition:border-color .2s;}
        .ort-map:hover{border-color:rgba(200,144,26,0.65);}
        .ort-map::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(200,144,26,0.08),transparent);transform:translateX(-120%);transition:transform 0.7s;}
        .ort-map:hover::after{transform:translateX(120%);}

        /* ── RSVP ── */
        .ort-rsvp{margin:0 16px 34px;padding:26px 22px;background:linear-gradient(135deg,rgba(200,144,26,0.08) 0%,transparent 55%),rgba(0,0,0,0.35);border:1px solid rgba(200,144,26,0.3);box-shadow:inset 0 1px 0 rgba(200,144,26,0.24),0 6px 36px rgba(0,0,0,0.5);position:relative;}
        .ort-rsvp::before{content:'✦';position:absolute;top:9px;left:12px;font-size:8px;color:#C8901A;opacity:.5;}
        .ort-rsvp::after{content:'✦';position:absolute;bottom:9px;right:12px;font-size:8px;color:#C8901A;opacity:.5;}
        .ort-rt{font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#C8901A;text-align:center;margin-bottom:4px;}
        .ort-ram{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:rgba(244,234,208,0.38);text-align:center;margin-bottom:20px;}
        .ort-lbl{font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(244,234,208,0.4);display:block;margin-bottom:5px;}
        .ort-field{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(200,144,26,0.22);color:#F4EAD0;padding:11px 13px;font-family:'Cinzel',serif;font-size:13.5px;outline:none;margin-bottom:13px;transition:border-color .15s,background .15s;}
        .ort-field:focus{border-color:#C8901A;background:rgba(200,144,26,0.05);}
        .ort-field::placeholder{color:rgba(244,234,208,0.15);}
        .ort-field option{background:#1C0508;color:#F4EAD0;}
        .ort-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:13px;}
        .ort-att-btn{padding:10px 4px;border:1px solid rgba(200,144,26,0.22);background:transparent;color:rgba(244,234,208,0.4);font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all .15s;}
        .ort-att-btn.on{border-color:#C8901A;color:#C8901A;background:rgba(200,144,26,0.1);}
        .ort-submit{width:100%;padding:14px;background:#C8901A;color:#1C0508;font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity .2s;}
        .ort-submit:hover{opacity:.88;}.ort-submit:disabled{opacity:.32;cursor:not-allowed;}

        /* ── FOOTER ── */
        .ort-footer{background:rgba(0,0,0,0.55);border-top:1px solid rgba(200,144,26,0.18);padding:26px 20px;text-align:center;}
        .ort-fc{margin:0 auto 14px;width:72px;opacity:0.4;filter:drop-shadow(0 2px 8px rgba(200,144,26,0.35));display:block;}
        .ort-fn{font-family:'Noto Serif Ethiopic',serif;font-size:1rem;color:#C8901A;opacity:0.68;display:block;}
        .ort-fv{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(244,234,208,0.22);margin-top:6px;display:block;}

        /* ── CONTROLS ── */
        .ort-ctrl{position:fixed;top:14px;right:14px;z-index:9000;display:flex;gap:8px;}
        .ort-btn{background:rgba(28,5,8,0.9);border:1px solid rgba(200,144,26,0.42);color:#C8901A;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.1em;padding:7px 12px;cursor:pointer;backdrop-filter:blur(8px);transition:border-color .15s;}
        .ort-btn:hover{border-color:#C8901A;}
      `}</style>

      {/* Fixed UI */}
      <div className="ort-grain" aria-hidden="true"/>
      <div className="ort-tb l" aria-hidden="true"/>
      <div className="ort-tb r" aria-hidden="true"/>

      <div className="ort-ctrl">
        {data.audioUrl && <button className="ort-btn" onClick={toggleAudio}>{muted ? "♪ Play" : "♪ Mute"}</button>}
        <button className="ort-btn" onClick={toggle}>{lang === "en" ? "አማ" : "EN"}</button>
      </div>
      {data.audioUrl && <audio ref={audioRef} src={data.audioUrl} loop/>}

      <div className="ort">

        {/* ══════════════════════════════════════════════════
            HERO — crimson velvet with cultural symbols
            1. Crown at top
            2. Adey Abeba in all 4 corners
            3. Ethiopian cross centered, glowing
            4. Scripture above names
            5. Large Amharic names — cream on crimson
            6. Intertwined rings below
            ══════════════════════════════════════════════════ */}
        <div className="ort-hero">
          {/* Adey Abeba flower corners */}
          <div className={`ort-fl tl ph2${phase>=2?" on":""}`}><AdeyAbeba size={50} opacity={0.82}/></div>
          <div className={`ort-fl tr ph2${phase>=2?" on":""}`}><AdeyAbeba size={50} opacity={0.82}/></div>
          <div className={`ort-fl bl ph2${phase>=2?" on":""}`}><AdeyAbeba size={44} opacity={0.65}/></div>
          <div className={`ort-fl br ph2${phase>=2?" on":""}`}><AdeyAbeba size={44} opacity={0.65}/></div>

          {/* Crown */}
          <div className={`ort-crown-wrap ph1${phase>=1?" on":""}`}>
            <div className="ort-crown-aura"/>
            <img className="ort-crown-img" src="/images/crown.png" alt="Teklil Crowns"
              onError={e => { (e.target as HTMLImageElement).style.display="none"; }}/>
          </div>

          {/* Eyebrow */}
          <span className={`ort-eyebrow ph2${phase>=2?" on":""}`}>ቅዱስ ጋብቻ · Holy Matrimony · ተክሊል</span>

          {/* Debre-Berhan border top */}
          <div className={`ph2${phase>=2?" on":""}`}>
            <BorderStripe/>
          </div>

          {/* Ethiopian cross — the centerpiece cultural symbol */}
          <div className={`ort-cross-wrap ph2${phase>=2?" on":""}`} style={{padding:"16px 0 8px"}}>
            <div className="ort-cross-glow"/>
            <EthCross size={118} gold="#C8901A" dark="#1C0508"/>
          </div>

          {/* Scripture */}
          {data.scripture && (
            <div className={`ph3${phase>=3?" on":""}`}>
              <p className="ort-scrip">
                {data.scripture}
                {data.scriptureRef && <span className="ort-scrip-ref">{data.scriptureRef}</span>}
              </p>
            </div>
          )}

          {/* Hair divider */}
          <div className={`ort-hl ph3${phase>=3?" on":""}`}>
            <div className="ort-hl-line"/>
            <svg viewBox="0 0 16 16" width="10" height="10" fill="rgba(200,144,26,0.58)" style={{flexShrink:0}}>
              <polygon points="8,0 10,5.5 16,6 11.5,10 13,16 8,13 3,16 4.5,10 0,6 6,5.5"/>
            </svg>
            <div className="ort-hl-line"/>
          </div>

          {/* Names */}
          <div className={`ph4${phase>=4?" on":""}`} style={{padding:"0 20px"}}>
            <span className="ort-name">{groom}</span>
            <span className="ort-and">— &amp; —</span>
            <span className="ort-name">{bride}</span>
            <span className="ort-name-en">{data.groomName} & {data.brideName}</span>
          </div>

          {/* Wedding rings */}
          <div className={`ort-rings ph4${phase>=4?" on":""}`}>
            <WeddingRings size={76}/>
          </div>
          <span className={`ort-tag ph4${phase>=4?" on":""}`}>joined in holy matrimony</span>

          {/* Debre-Berhan border bottom */}
          <div className={`ph2${phase>=2?" on":""}`} style={{marginTop:24}}>
            <BorderStripe/>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            PHOTO SECTION — couple photo below symbols
            ══════════════════════════════════════════════════ */}
        <div className="ort-photo-section">
          <img className="ort-photo-img"
            src={data.couplePhotoUrl ?? "/images/couple-1.jpg"}
            alt={`${data.groomName} & ${data.brideName}`}/>
          <div className="ort-photo-ov"/>
        </div>

        {/* ══════════════════════════════════════════════════
            BODY CONTENT
            ══════════════════════════════════════════════════ */}

        {/* Dates */}
        <div className="ort-dates">
          <div className="ort-dc">
            <span className="ort-dl">Gregorian</span>
            <span className="ort-dn">{gc.getDate()}</span>
            <span className="ort-ds">{gc.toLocaleString("en-US",{month:"short"}).toUpperCase()} {gc.getFullYear()}</span>
            <span className="ort-ds">{gc.toLocaleString("en-US",{weekday:"long"})}</span>
          </div>
          <div className="ort-dvsep"/>
          <div className="ort-dc">
            <span className="ort-dl">Ethiopian</span>
            <span className="ort-dn">{eth.day}</span>
            <span className="ort-de">{eth.monthAm}</span>
            <span className="ort-ds">{eth.year} ዓ.ም</span>
          </div>
        </div>

        {/* Time */}
        <div className="ort-ts">
          <span style={{fontSize:16,flexShrink:0}}>⏰</span>
          <div>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:15,color:"#F4EAD0",letterSpacing:".06em"}}>{data.timeEn ?? "09:00 AM"}</span>
            {data.timeAm && <span style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:11,color:"#C8901A",opacity:.8,marginTop:2,display:"block"}}>{data.timeAm}</span>}
          </div>
          {data.venue && <>
            <div className="ort-ts-sep"/>
            <div>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#F4EAD0",letterSpacing:".04em",display:"block"}}>{data.venue}</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(244,234,208,.42)",marginTop:2,display:"block"}}>{data.venueAddress}</span>
            </div>
          </>}
        </div>

        {/* Countdown */}
        <div className="ort-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l}) => (
            <div key={l} className="ort-cdc">
              <span className="ort-cdn">{String(n).padStart(2,"0")}</span>
              <span className="ort-cdl">{l}</span>
            </div>
          ))}
        </div>

        {/* Greeting */}
        <Divider/>
        <div className="ort-greet">
          <span className="ort-ge">Invitation · ጥሪ</span>
          <span className="ort-gt">{lang==="am"&&data.greetingTitleAm?data.greetingTitleAm:(data.greetingTitle??"Dear Families & Friends")}</span>
          <p className="ort-gb">{lang==="am"&&data.messageBodyAm?data.messageBodyAm:(data.messageBody??"")}</p>
          {lang==="en"&&data.messageBodyAm&&<span className="ort-gam">{data.messageBodyAm}</span>}
        </div>

        {/* Details */}
        <Divider/>
        <div className="ort-sh"><span className="ort-sh-t">Event Details</span><span className="ort-sh-am">ዝርዝር መረጃ</span></div>
        <div className="ort-dets">
          {[
            {ic:"📅",k:"Date · ቀን",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),am:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {ic:"⏰",k:"Time · ሰዓት",v:data.timeEn??"09:00 AM",am:data.timeAm??""},
            {ic:"⛪",k:"Church · ቤተ ክርስቲያን",v:data.venue??"",am:""},
            {ic:"📍",k:"Location · አድራሻ",v:data.venueAddress??"",am:""},
          ].map(r => (
            <div key={r.k} className="ort-det">
              <div className="ort-det-ic">{r.ic}</div>
              <div className="ort-det-b">
                <span className="ort-det-k">{r.k}</span>
                <span className="ort-det-v">{r.v}</span>
                {r.am && <span className="ort-det-am">{r.am}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <Divider/>
        <div className="ort-cal">
          <div className="ort-cal-hd">
            <span className="ort-cal-mo">{cal.monthName} {cal.year}</span>
            <span className="ort-cal-eth">{eth.monthAm} {eth.year} ዓ.ም</span>
          </div>
          <div className="ort-cal-dow">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="ort-cal-d">{d}</div>)}</div>
          <div className="ort-cal-g">
            {cells.map((day,i) => (
              <div key={i} className={`ort-cal-c${day===cal.weddingDay?" wed":""}`}>
                {day===cal.weddingDay ? "✝" : day!==null ? day : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Programme */}
        <Divider/>
        <div className="ort-sh"><span className="ort-sh-t">Programme</span><span className="ort-sh-am">የዕለቱ ፕሮግራም</span></div>
        <div className="ort-prog">
          {programme.map((item:any,i:number) => (
            <div key={i} className="ort-pi">
              <div className="ort-pt">
                <div className="ort-pn"/>
                <span className="ort-pt-am">{item.timeAm??item.time}</span>
                <span className="ort-pt-en">{item.time}</span>
              </div>
              <div className="ort-pb">
                <span className="ort-pb-t">{item.title}</span>
                {item.titleAm && <span className="ort-pb-am">{item.titleAm}</span>}
                <span className="ort-pb-d">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        {data.venueMapLink && <>
          <Divider/>
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="ort-map">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Open in Google Maps · ካርታ ክፈት
          </a>
        </>}

        {/* RSVP */}
        <Divider/>
        <div className="ort-rsvp">
          {rsvp.submitted ? (
            <div style={{textAlign:"center",padding:"26px 0"}}>
              <EthCross size={48} gold="#C8901A" dark="#1C0508"/>
              <span style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:"1.15rem",color:"#C8901A",display:"block",marginTop:14,marginBottom:6}}>አስቀድሞ እናመሰግናለን!</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(244,234,208,.35)"}}>Your RSVP has been received</span>
            </div>
          ) : (
            <>
              <p className="ort-rt">Confirm Your Attendance</p>
              <p className="ort-ram">እባክዎ ምዝገባዎን ያረጋግጡ</p>
              <label className="ort-lbl">Full Name · ሙሉ ስም *</label>
              <input className="ort-field" placeholder="e.g. Selam Bekele" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="ort-lbl">Phone · ስልክ ቁጥር *</label>
              <input className="ort-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="ort-lbl">Attendance · ተገኝነት</label>
              <div className="ort-att">
                {(["yes","no","maybe"] as const).map(v => (
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`ort-att-btn${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}
                  </button>
                ))}
              </div>
              <label className="ort-lbl">Number of Guests · የጥሪ ሰዎች</label>
              <select className="ort-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="ort-lbl">Message to the Couple · ለሙሽሮቹ</label>
              <textarea className="ort-field" rows={3} style={{resize:"none"}} placeholder="Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="ort-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Sending…":"Confirm RSVP · አረጋግጥ"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="ort-footer">
          <img className="ort-fc" src="/images/crown.png" alt=""
            onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          <span className="ort-fn">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</span>
          <span className="ort-fv">{data.venue??""} · Ethiopia</span>
          <Divider my={20}/>
        </div>

      </div>
    </>
  );
}