"use client";
import { useState, useRef } from "react";
import TigraiTemplate     from "@/components/templates/TigraiTemplate";
import SomaliTemplate     from "@/components/templates/SomaliTemplate";
import ProtestantTemplate from "@/components/templates/ProtestantTemplate";
import OrthodoxTemplate   from "@/components/templates/OrthodoxTemplate";
import MuslimTemplate     from "@/components/templates/MuslimTemplate";
import HabeshaTemplate    from "@/components/templates/HabeshaTemplate";
import DiasporaTemplate   from "@/components/templates/DiasporaTemplate";
import CatholicTemplate   from "@/components/templates/CatholicTemplate";

// ─── Template registry ────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    key: "orthodox",   name: "Orthodox Tewahedo",  tag: "Religion",
    desc: "Ethiopian cross · Geez calendar · Wine & gold",
    component: OrthodoxTemplate,
    card: { bg: "#2B0812", accent: "#C9942A", nameColor: "#E8C06A", phrase: "ተክሊል", phraseLang: "eth", deco: "cross" },
  },
  {
    key: "muslim",     name: "Muslim Nikah",        tag: "Religion",
    desc: "Bismillah · Hijri calendar · Green & gold",
    component: MuslimTemplate,
    card: { bg: "#0B1F14", accent: "#D4AF37", nameColor: "#EDD87A", phrase: "النكاح", phraseLang: "ar", deco: "crescent" },
  },
  {
    key: "protestant", name: "Protestant",          tag: "Religion",
    desc: "Scripture verse · Cross · Editorial black",
    component: ProtestantTemplate,
    card: { bg: "#111111", accent: "#B91C1C", nameColor: "#EEEEE8", phrase: "Save the Date", phraseLang: "en", deco: "cross" },
  },
  {
    key: "catholic",   name: "Catholic",            tag: "Religion",
    desc: "Latin Missa · Rosary beads · Navy & gold",
    component: CatholicTemplate,
    card: { bg: "#0E1B3A", accent: "#B8963E", nameColor: "#F6F0E4", phrase: "Sanctum Matrimonium", phraseLang: "en", deco: "cross" },
  },
  {
    key: "habesha",    name: "Habesha",             tag: "Culture",
    desc: "Tibeb border · Terracotta · Amharic script",
    component: HabeshaTemplate,
    card: { bg: "#5A2B0C", accent: "#D4891A", nameColor: "#F4E8D0", phrase: "ሠርግ", phraseLang: "eth", deco: "flower" },
  },
  {
    key: "tigrai",     name: "Tigrai",              tag: "Culture",
    desc: "Axum obelisk · Tigrinya · Red & gold",
    component: TigraiTemplate,
    card: { bg: "#3D0E0E", accent: "#C09020", nameColor: "#FBE9B0", phrase: "ሰርሓት", phraseLang: "eth", deco: "obelisk" },
  },
  {
    key: "somali",     name: "Somali",              tag: "Culture",
    desc: "Somali flag · Star motif · Sky blue",
    component: SomaliTemplate,
    card: { bg: "#1A5276", accent: "#4189C7", nameColor: "#F8FAFC", phrase: "Arooska", phraseLang: "en", deco: "star" },
  },
  {
    key: "diaspora",   name: "Diaspora",            tag: "Culture",
    desc: "Bilingual · WhatsApp share · Modern minimal",
    component: DiasporaTemplate,
    card: { bg: "#1C3A28", accent: "#1A7A3C", nameColor: "#F7F5F0", phrase: "Save the Date", phraseLang: "en", deco: "flower" },
  }
];

const NAV = [
  { key: "template",   label: "Template"  },
  { key: "couple",     label: "Couple"    },
  { key: "event",      label: "Event"     },
  { key: "message",    label: "Message"   },
  { key: "programme",  label: "Programme" },
  { key: "gallery",    label: "Gallery"   },
] as const;
type Section = typeof NAV[number]["key"];

// ─── Deco SVG for mini card ───────────────────────────────────────────────────
function Deco({ type, color }: { type: string; color: string }) {
  if (type === "cross") return (
    <svg viewBox="0 0 18 26" width="11" height="16" fill="none" stroke={color} strokeWidth="1.5" opacity=".45">
      <line x1="9" y1="1" x2="9" y2="25"/><line x1="1" y1="9" x2="17" y2="9"/>
    </svg>
  );
  if (type === "crescent") return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill={color} opacity=".4">
      <path d="M15 10A7 7 0 117 3a5 5 0 108 7z"/>
    </svg>
  );
  if (type === "star") return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill={color} opacity=".4">
      <polygon points="10,1 12.5,7 19,7 14,11 16,18 10,14 4,18 6,11 1,7 7.5,7"/>
    </svg>
  );
  if (type === "obelisk") return (
    <svg viewBox="0 0 12 22" width="8" height="15" fill={color} opacity=".35">
      <polygon points="6,0 8,7 7,7 7,20 5,20 5,7 4,7"/>
      <rect x="4" y="20" width="4" height="2"/>
    </svg>
  );
  // flower / default
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" opacity=".42">
      {[0,60,120,180,240,300].map(a=>(
        <ellipse key={a} cx="10" cy="6.5" rx="1.6" ry="3.8" fill={color} transform={`rotate(${a} 10 10)`}/>
      ))}
      <circle cx="10" cy="10" r="1.8" fill={color}/>
    </svg>
  );
}

// ─── Template Card — horizontal layout ───────────────────────────────────────
function TemplateCard({ t, selected, groomName, brideName, date, onClick }: any) {
  const c = t.card;
  const g = groomName || (c.phraseLang === "eth" ? "ፍቅርአብ" : c.phraseLang === "ar" ? "إسماعيل" : "Groom");
  const b = brideName || (c.phraseLang === "eth" ? "ፌናን"   : c.phraseLang === "ar" ? "سارة"     : "Bride");
  const sep = c.phraseLang === "ar" ? "و" : "&";
  const dateStr = date ? new Date(date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "Jan 22, 2026";

  // font families for the mini card text — inline only, no Google Fonts import needed
  // (the main page already imports these via template components)
  const nameFont = c.phraseLang === "eth"
    ? "system-ui, sans-serif"
    : c.phraseLang === "ar"
    ? "system-ui, sans-serif"
    : "Georgia, serif";

  const phraseFont = c.phraseLang === "eth" || c.phraseLang === "ar"
    ? "system-ui, sans-serif"
    : "Georgia, serif";

  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        display: "flex",
        alignItems: "stretch",
        cursor: "pointer",
        borderRadius: 10,
        overflow: "hidden",
        border: selected ? `2px solid ${c.accent}` : "1.5px solid #E5E0D8",
        background: "#fff",
        boxShadow: selected
          ? `0 2px 20px ${c.accent}25`
          : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "all .18s",
      }}
    >
      {/* ── Left: mini invitation visual ── */}
      <div style={{
        width: 88,
        flexShrink: 0,
        background: c.bg,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 8px",
        overflow: "hidden",
        gap: 4,
      }}>
        {/* inner border frame */}
        <div style={{
          position: "absolute", inset: 5,
          border: `1px solid ${c.accent}28`,
          borderRadius: 3, pointerEvents: "none",
        }}/>
        {/* radial light */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 40% 25%, rgba(255,255,255,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}/>
        {/* phrase */}
        <p style={{
          fontFamily: phraseFont,
          fontSize: c.phraseLang === "ar" ? 10 : 8,
          color: `${c.accent}90`,
          textAlign: "center",
          lineHeight: 1.3,
          direction: c.phraseLang === "ar" ? "rtl" : "ltr",
          margin: 0,
        }}>{c.phrase}</p>
        {/* accent line */}
        <div style={{ width: 20, height: 1, background: c.accent, opacity: .55 }}/>
        {/* couple names */}
        <p style={{
          fontFamily: nameFont,
          fontSize: 9,
          fontWeight: 600,
          color: c.nameColor,
          textAlign: "center",
          lineHeight: 1.4,
          direction: c.phraseLang === "ar" ? "rtl" : "ltr",
          margin: 0,
          maxWidth: 72,
        }}>{g} {sep} {b}</p>
        {/* date */}
        <p style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 6.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: `${c.nameColor}70`,
          margin: 0,
        }}>{dateStr}</p>
        {/* deco */}
        <div style={{ position: "absolute", bottom: 7, right: 7 }}>
          <Deco type={c.deco} color={c.accent}/>
        </div>
        {/* selected tick */}
        {selected && (
          <div style={{
            position: "absolute", top: 6, right: 6,
            width: 18, height: 18, borderRadius: "50%",
            background: c.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M1.5 5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Right: info ── */}
      <div style={{
        flex: 1, padding: "13px 14px",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 3,
      }}>
        {/* tag pill */}
        <span style={{
          display: "inline-block",
          fontFamily: "system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: c.accent,
          background: `${c.accent}14`,
          border: `1px solid ${c.accent}28`,
          padding: "1px 7px",
          borderRadius: 3,
          width: "fit-content",
          marginBottom: 2,
        }}>{t.tag}</span>
        {/* name */}
        <p style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: selected ? "#3D2010" : "#1A1410",
          margin: 0, lineHeight: 1.2,
        }}>{t.name}</p>
        {/* desc */}
        <p style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 11.5,
          color: "#999189",
          margin: 0, lineHeight: 1.5,
        }}>{t.desc}</p>
      </div>
    </button>
  );
}

// ─── File Upload Button ───────────────────────────────────────────────────────
function FileUpload({
  label, hint, accept, value, onChange, preview = false,
}: {
  label: string; hint?: string; accept: string;
  value: string; onChange: (url: string, file?: File) => void;
  preview?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url, file);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:500, color:"#6B5E56", marginBottom:5 }}>
        {label}
      </label>
      <div style={{
        border: "1.5px dashed #D5CCC4",
        borderRadius: 8,
        background: "#FAFAF8",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        transition: "border-color .15s",
      }}
        onClick={() => ref.current?.click()}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#A08060")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#D5CCC4")}
      >
        {/* preview thumbnail */}
        {preview && value && (
          <div style={{
            width: 44, height: 44, borderRadius: 6, overflow: "hidden",
            flexShrink: 0, background: "#E8E0D6",
            border: "1px solid #D5CCC4",
          }}>
            <img src={value} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}
              onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          </div>
        )}
        {/* audio icon */}
        {!preview && accept.includes("audio") && (
          <div style={{
            width: 40, height: 40, borderRadius: 6, background: "#EEE8E0",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A08060" strokeWidth="1.8">
              <path d="M9 18V5l12-2v13" strokeLinecap="round"/>
              <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily:"system-ui,sans-serif", fontSize:13, fontWeight:500, color:"#3D2E26", margin:0, lineHeight:1.3 }}>
            {value ? "Change file" : "Upload file"}
          </p>
          {value ? (
            <p style={{ fontFamily:"system-ui,sans-serif", fontSize:10.5, color:"#22A05A", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              ✓ {accept.includes("audio") ? "Audio uploaded" : "Image uploaded"}
            </p>
          ) : (
            <p style={{ fontFamily:"system-ui,sans-serif", fontSize:10.5, color:"#A09890", margin:"2px 0 0" }}>
              {hint ?? `Click to browse — ${accept}`}
            </p>
          )}
        </div>
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#B0A298" strokeWidth="1.8">
          <path d="M10 3v10M6 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" strokeLinecap="round"/>
        </svg>
        <input ref={ref} type="file" accept={accept} style={{ display:"none" }} onChange={handleFile}/>
      </div>
    </div>
  );
}

// ─── Gallery Image Upload ─────────────────────────────────────────────────────
function GalleryImageUpload({ src, index, onChange, onRemove }: {
  src: string; index: number;
  onChange: (i: number, url: string) => void;
  onRemove: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(index, URL.createObjectURL(file));
  };
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"8px 10px", background:"#FAFAF8",
      border:"1px solid #E5DDD6", borderRadius:8, marginBottom:8,
    }}>
      <div
        onClick={() => ref.current?.click()}
        style={{
          width:48, height:48, borderRadius:6,
          overflow:"hidden", flexShrink:0,
          background:"#EDE6DC", border:"1.5px dashed #C8BFB4",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer",
        }}
      >
        {src
          ? <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          : <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="#B0A090" strokeWidth="1.5">
              <rect x="2" y="4" width="16" height="13" rx="1"/>
              <circle cx="7" cy="9" r="1.5"/>
              <path d="M2 14l5-4 3 3 3-2 5 4" strokeLinecap="round"/>
            </svg>
        }
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontFamily:"system-ui,sans-serif", fontSize:12.5, fontWeight:500, color:"#3D2E26", margin:0 }}>
          Photo {index + 1}
        </p>
        <p
          onClick={() => ref.current?.click()}
          style={{ fontFamily:"system-ui,sans-serif", fontSize:11, color: src ? "#22A05A" : "#A09890", margin:"2px 0 0", cursor:"pointer" }}
        >
          {src ? "✓ Uploaded — click to change" : "Click image to upload"}
        </p>
      </div>
      <button
        onClick={() => onRemove(index)}
        style={{
          width:28, height:28, background:"transparent",
          border:"1px solid #E0D6CC", borderRadius:5,
          color:"#B0A090", fontSize:16, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .14s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="#FEE2E2";e.currentTarget.style.color="#DC2626";e.currentTarget.style.borderColor="#FCA5A5";}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#B0A090";e.currentTarget.style.borderColor="#E0D6CC";}}
      >×</button>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function InvitationTab({ event, onSave }: { event: any; onSave: (u: any) => void }) {
  const [selectedKey, setSelectedKey] = useState<string>(event.templateKey ?? "orthodox");
  const [section, setSection]         = useState<Section>("template");
  const [saved, setSaved]             = useState(false);

  const [form, setForm] = useState({
    groomName:           event.groomName            ?? "",
    brideName:           event.brideName            ?? "",
    groomNameAm:         event.groomNameAm          ?? "",
    brideNameAm:         event.brideNameAm          ?? "",
    groomNameAr:         event.groomNameAr          ?? "",
    brideNameAr:         event.brideNameAr          ?? "",
    date:                event.date                 ?? "",
    timeEn:              event.timeEn               ?? "",
    timeAm:              event.timeAm               ?? "",
    venue:               event.venue                ?? "",
    venueAddress:        event.venueAddress         ?? "",
    venueMapLink:        event.venueMapLink         ?? "",
    greetingTitle:       event.greetingTitle        ?? "Dear Families and Friends",
    greetingTitleAm:     event.greetingTitleAm      ?? "",
    messageBody:         event.messageBody          ?? "",
    messageBodyAm:       event.messageBodyAm        ?? "",
    scripture:           event.scripture            ?? "",
    scriptureRef:        event.scriptureRef         ?? "",
    couplePhotoUrl:      event.couplePhotoUrl        ?? "",
    audioUrl:            event.audioUrl             ?? "",
    telegramChannel:     event.telegramChannel      ?? "",
    telegramChannelName: event.telegramChannelName  ?? "",
    galleryImages:       (event.galleryImages       ?? []) as string[],
  });

  const [program, setProgram] = useState<any[]>(
    event.program ?? [{ time:"", timeAm:"", title:"", titleAm:"", desc:"" }]
  );

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const updProg = (i: number, k: string, v: string) =>
    setProgram(p => p.map((x: any, idx: number) => idx === i ? { ...x, [k]: v } : x));
  const addProg = () => setProgram(p => [...p, { time:"", timeAm:"", title:"", titleAm:"", desc:"" }]);
  const rmProg  = (i: number) => setProgram(p => p.filter((_: any, idx: number) => idx !== i));
  const addImg  = () => upd("galleryImages", [...form.galleryImages, ""]);
  const rmImg   = (i: number) => upd("galleryImages", form.galleryImages.filter((_:string,idx:number) => idx !== i));
  const updImg  = (i: number, v: string) => { const a = [...form.galleryImages]; a[i] = v; upd("galleryImages", a); };

  const selected = TEMPLATES.find(t => t.key === selectedKey)!;
  const Comp = selected.component;

  const handleSave = () => {
    onSave({ ...event, templateKey: selectedKey, ...form, program });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── shared styles (system font everywhere) ──
  const S = {
    input: {
      width: "100%",
      border: "1px solid #DDD6CE",
      borderRadius: 7,
      background: "#FAFAF8",
      color: "#1A1410",
      padding: "9px 12px",
      fontSize: 13.5,
      fontFamily: "system-ui, -apple-system, sans-serif",
      outline: "none",
      transition: "border-color .15s",
      marginBottom: 0,
    } as React.CSSProperties,
    textarea: {
      width: "100%",
      border: "1px solid #DDD6CE",
      borderRadius: 7,
      background: "#FAFAF8",
      color: "#1A1410",
      padding: "9px 12px",
      fontSize: 13.5,
      fontFamily: "system-ui, -apple-system, sans-serif",
      outline: "none",
      resize: "vertical" as const,
      lineHeight: 1.65,
      minHeight: 90,
    } as React.CSSProperties,
    label: {
      display: "block",
      fontSize: 11.5,
      fontWeight: 500,
      color: "#6B5E56",
      marginBottom: 5,
      fontFamily: "system-ui, -apple-system, sans-serif",
    } as React.CSSProperties,
    group: { marginBottom: 26 } as React.CSSProperties,
    groupTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: "#3D2E26",
      marginBottom: 14,
      paddingBottom: 9,
      borderBottom: "1px solid #EDE8E1",
      fontFamily: "system-ui, -apple-system, sans-serif",
      letterSpacing: ".01em",
    } as React.CSSProperties,
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 } as React.CSSProperties,
    wrap: { marginBottom: 12 } as React.CSSProperties,
    hint: { fontSize: 11, color: "#B0A898", marginTop: 4, lineHeight: 1.5, fontFamily: "system-ui,sans-serif" } as React.CSSProperties,
  };

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "#A07050";
    e.target.style.background = "#fff";
  };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "#DDD6CE";
    e.target.style.background = "#FAFAF8";
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#F7F4F0", fontFamily:"system-ui,-apple-system,sans-serif", color:"#1A1410" }}>

      {/* ── Header ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", height:58,
        background:"#fff", borderBottom:"1px solid #EDE8E1", flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:15, fontWeight:700, color:"#1A1410" }}>Invitation Designer</span>
          <span style={{
            fontSize:11, fontWeight:600, color:"#8C6040",
            background:"rgba(140,96,64,0.08)", border:"1px solid rgba(140,96,64,0.18)",
            padding:"3px 10px", borderRadius:20,
          }}>{selected.name}</span>
        </div>
        <button
          onClick={handleSave}
          style={{
            display:"flex", alignItems:"center", gap:7,
            padding:"8px 22px", background: saved ? "#2D7A4A" : "#8C6040",
            color:"#fff", fontSize:13, fontWeight:600, border:"none",
            borderRadius:7, cursor:"pointer", transition:"background .2s",
          }}
        >
          {saved ? "✓ Saved" : "Save Invitation"}
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* ── LEFT: edit ── */}
        <div style={{ flex:1, background:"#fff", borderRight:"1px solid #EDE8E1", display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #EDE8E1", flexShrink:0, overflowX:"auto" }}>
            {NAV.map(s => (
              <button key={s.key} onClick={() => setSection(s.key as Section)}
                style={{
                  flexShrink:0, padding:"12px 18px",
                  fontSize:12.5, fontWeight: section === s.key ? 600 : 400,
                  color: section === s.key ? "#8C6040" : "#9A8D84",
                  background:"transparent", border:"none",
                  borderBottom: section === s.key ? "2.5px solid #8C6040" : "2.5px solid transparent",
                  cursor:"pointer", transition:"all .14s",
                  fontFamily:"system-ui,sans-serif",
                }}
              >{s.label}</button>
            ))}
          </div>

          {/* scrollable panel */}
          <div style={{ flex:1, overflowY:"auto", padding:"22px 24px 48px" }}>

            {/* ══ TEMPLATE ══ */}
            {section === "template" && (
              <div>
                <p style={{ fontSize:12, color:"#A09890", marginBottom:16, lineHeight:1.6 }}>
                  Choose a template. Each is designed for a specific Ethiopian religious or cultural tradition.
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {TEMPLATES.map(t => (
                    <TemplateCard key={t.key} t={t} selected={selectedKey === t.key}
                      groomName={form.groomName} brideName={form.brideName} date={form.date}
                      onClick={() => setSelectedKey(t.key)}/>
                  ))}
                </div>
              </div>
            )}

            {/* ══ COUPLE ══ */}
            {section === "couple" && (
              <div>
                <div style={S.group}>
                  <p style={S.groupTitle}>Names — English</p>
                  <div style={S.row}>
                    <div><label style={S.label}>Groom</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="Fikerab" value={form.groomName} onChange={e=>upd("groomName",e.target.value)}/></div>
                    <div><label style={S.label}>Bride</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="Fenan" value={form.brideName} onChange={e=>upd("brideName",e.target.value)}/></div>
                  </div>
                </div>
                <div style={S.group}>
                  <p style={S.groupTitle}>Names — አማርኛ (Amharic)</p>
                  <div style={S.row}>
                    <div><label style={S.label}>Groom</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="ፍቅርአብ" value={form.groomNameAm} onChange={e=>upd("groomNameAm",e.target.value)}/></div>
                    <div><label style={S.label}>Bride</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="ፌናን" value={form.brideNameAm} onChange={e=>upd("brideNameAm",e.target.value)}/></div>
                  </div>
                </div>
                <div style={S.group}>
                  <p style={S.groupTitle}>Names — Arabic (Muslim template)</p>
                  <div style={S.row}>
                    <div><label style={S.label}>Groom</label><input style={{...S.input,direction:"rtl"}} onFocus={focus} onBlur={blur} placeholder="إسماعيل" value={form.groomNameAr} onChange={e=>upd("groomNameAr",e.target.value)}/></div>
                    <div><label style={S.label}>Bride</label><input style={{...S.input,direction:"rtl"}} onFocus={focus} onBlur={blur} placeholder="سارة" value={form.brideNameAr} onChange={e=>upd("brideNameAr",e.target.value)}/></div>
                  </div>
                </div>
                <div style={S.group}>
                  <p style={S.groupTitle}>Couple Photo</p>
                  <FileUpload
                    label="Hero photo (shown at the top of the invitation)"
                    hint="JPG, PNG, WEBP — recommended 900×1200px portrait"
                    accept="image/*"
                    value={form.couplePhotoUrl}
                    onChange={(url) => upd("couplePhotoUrl", url)}
                    preview
                  />
                </div>
                {/* Background Music upload removed */}
              </div>
            )}

            {/* ══ EVENT ══ */}
            {section === "event" && (
              <div>
                <div style={S.group}>
                  <p style={S.groupTitle}>Date & Time</p>
                  <div style={S.row}>
                    <div>
                      <label style={S.label}>Date</label>
                      <input style={S.input} type="date" onFocus={focus} onBlur={blur} value={form.date} onChange={e=>upd("date",e.target.value)}/>
                    </div>
                    <div>
                      <label style={S.label}>Time (e.g. 09:00 AM)</label>
                      <input style={S.input} onFocus={focus} onBlur={blur} placeholder="09:00 AM" value={form.timeEn} onChange={e=>upd("timeEn",e.target.value)}/>
                    </div>
                  </div>
                  <div style={S.wrap}>
                    <label style={S.label}>Ethiopian Time (optional)</label>
                    <input style={S.input} onFocus={focus} onBlur={blur} placeholder="3:00 ጠዋት" value={form.timeAm} onChange={e=>upd("timeAm",e.target.value)}/>
                  </div>
                </div>
                <div style={S.group}>
                  <p style={S.groupTitle}>Venue</p>
                  <div style={S.wrap}>
                    <label style={S.label}>Venue Name</label>
                    <input style={S.input} onFocus={focus} onBlur={blur} placeholder="Hilton International Hotel" value={form.venue} onChange={e=>upd("venue",e.target.value)}/>
                  </div>
                  <div style={S.wrap}>
                    <label style={S.label}>Full Address</label>
                    <input style={S.input} onFocus={focus} onBlur={blur} placeholder="Menelik II Ave, Addis Ababa, Ethiopia" value={form.venueAddress} onChange={e=>upd("venueAddress",e.target.value)}/>
                  </div>
                  <div style={S.wrap}>
                    <label style={S.label}>Google Maps Link</label>
                    <input style={S.input} onFocus={focus} onBlur={blur} placeholder="https://maps.google.com/?q=…" value={form.venueMapLink} onChange={e=>upd("venueMapLink",e.target.value)}/>
                    {/* Google Maps guest hint removed */}
                  </div>
                </div>
              </div>
            )}

            {/* ══ MESSAGE ══ */}
            {section === "message" && (
              <div>
                <div style={S.group}>
                  <p style={S.groupTitle}>English</p>
                  <div style={S.wrap}>
                    <label style={S.label}>Greeting heading</label>
                    <input style={S.input} onFocus={focus} onBlur={blur} placeholder="Dear Families and Friends" value={form.greetingTitle} onChange={e=>upd("greetingTitle",e.target.value)}/>
                  </div>
                  <div style={S.wrap}>
                    <label style={S.label}>Invitation message</label>
                    <textarea style={S.textarea} onFocus={focus} onBlur={blur} placeholder="Together with their families, we joyfully invite you…" value={form.messageBody} onChange={e=>upd("messageBody",e.target.value)}/>
                  </div>
                </div>
                <div style={S.group}>
                  <p style={S.groupTitle}>አማርኛ (Amharic)</p>
                  <div style={S.wrap}>
                    <label style={S.label}>Greeting — Amharic</label>
                    <input style={S.input} onFocus={focus} onBlur={blur} placeholder="ለምንወዳቸው ቤተሰቦቻችን…" value={form.greetingTitleAm} onChange={e=>upd("greetingTitleAm",e.target.value)}/>
                  </div>
                  <div style={S.wrap}>
                    <label style={S.label}>Message — Amharic</label>
                    <textarea style={S.textarea} onFocus={focus} onBlur={blur} placeholder="ከቤተሰቦቻቸው ጋር ወደ ሠርጋቸው ጥሪ…" value={form.messageBodyAm} onChange={e=>upd("messageBodyAm",e.target.value)}/>
                  </div>
                </div>
                <div style={S.group}>
                  <p style={S.groupTitle}>Scripture / Verse</p>
                  <div style={S.wrap}>
                    <label style={S.label}>Verse</label>
                    <textarea style={{...S.textarea,minHeight:70}} onFocus={focus} onBlur={blur} placeholder='"The Lord has done great things for us, and we are filled with joy."' value={form.scripture} onChange={e=>upd("scripture",e.target.value)}/>
                  </div>
                  <div style={S.wrap}>
                    <label style={S.label}>Reference</label>
                    <input style={S.input} onFocus={focus} onBlur={blur} placeholder="Psalms 126:3" value={form.scriptureRef} onChange={e=>upd("scriptureRef",e.target.value)}/>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PROGRAMME ══ */}
            {section === "programme" && (
              <div>
                <p style={{ fontSize:12, color:"#A09890", marginBottom:18, lineHeight:1.65 }}>
                  Add the order of events. These appear as a timeline on the invitation.
                </p>
                {program.map((item: any, i: number) => (
                  <div key={i} style={{
                    border:"1px solid #EDE8E1", borderRadius:9, padding:"16px 14px 12px",
                    marginBottom:10, background:"#FAFAF8", position:"relative",
                  }}>
                    <span style={{
                      position:"absolute", top:-10, left:12,
                      background:"#8C6040", color:"#fff",
                      fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:10,
                    }}>Event {i + 1}</span>
                    <button
                      onClick={() => rmProg(i)}
                      style={{
                        position:"absolute", top:10, right:10, width:26, height:26,
                        background:"transparent", border:"1px solid #E0D6CC",
                        borderRadius:5, color:"#B0A090", fontSize:15, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.background="#FEE2E2";e.currentTarget.style.color="#DC2626";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#B0A090";}}
                    >×</button>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                      <div><label style={S.label}>Time (EN)</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="09:00 AM" value={item.time} onChange={e=>updProg(i,"time",e.target.value)}/></div>
                      <div><label style={S.label}>Time (አማ)</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="3:00 ጠዋት" value={item.timeAm??""} onChange={e=>updProg(i,"timeAm",e.target.value)}/></div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                      <div><label style={S.label}>Title (EN)</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="Wedding Ceremony" value={item.title} onChange={e=>updProg(i,"title",e.target.value)}/></div>
                      <div><label style={S.label}>Title (አማ)</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="ሠርግ ሥነ-ስርዓት" value={item.titleAm??""} onChange={e=>updProg(i,"titleAm",e.target.value)}/></div>
                    </div>
                    <div><label style={S.label}>Description</label><input style={S.input} onFocus={focus} onBlur={blur} placeholder="Exchange of vows & rings" value={item.desc} onChange={e=>updProg(i,"desc",e.target.value)}/></div>
                  </div>
                ))}
                <button
                  onClick={addProg}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    width:"100%", padding:11, background:"transparent",
                    border:"1.5px dashed #D5CCC4", borderRadius:8,
                    color:"#A09890", fontSize:13, fontWeight:500, cursor:"pointer",
                    transition:"all .15s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#8C6040";e.currentTarget.style.color="#8C6040";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#D5CCC4";e.currentTarget.style.color="#A09890";}}
                >
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
                  Add Event
                </button>
              </div>
            )}

            {/* Gallery/media section removed */}

          </div>
        </div>

        {/* ── RIGHT: live preview ── */}
        <div style={{
          width:360, flexShrink:0, background:"#EDE8E1",
          display:"flex", flexDirection:"column", overflow:"hidden",
        }}>
          {/* preview header */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"12px 18px", background:"#F5F2EE",
            borderBottom:"1px solid #E5DDD6", flexShrink:0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{
                width:7, height:7, borderRadius:"50%", background:"#3DAA68",
                display:"inline-block",
                animation:"none",
              }}/>
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#A09890" }}>Live Preview</span>
            </div>
            <span style={{ fontSize:12.5, color:"#7A6E66" }}>{selected.name}</span>
          </div>
          {/* phone */}
          <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"18px 8px 36px" }}>
            <div style={{
              width:320, flexShrink:0,
              borderRadius:40, border:"7px solid #D0C6BC",
              boxShadow:"0 0 0 1px rgba(140,100,60,0.1), 0 0 0 8px rgba(208,198,188,0.28), 0 20px 50px rgba(80,50,20,0.18)",
              overflow:"hidden", background:"#fff", position:"relative",
            }}>
              <div style={{
                position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                width:90, height:22, background:"#D0C6BC",
                borderRadius:"0 0 14px 14px", zIndex:10,
              }}/>
              <div style={{ overflowY:"auto", maxHeight:680, paddingTop:22, borderRadius:34, scrollbarWidth:"none" }}>
                <Comp data={{ ...event, ...form, program }}/>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}