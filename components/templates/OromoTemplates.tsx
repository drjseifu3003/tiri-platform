"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP, getCalendarDays } from "@/lib/hooks";
import WeddingGallery from "@/components/templates/WeddingGallery";

// ─── CULTURE TEMPLATE: Oromo ──────────────────────────────────────────────────
// Visual identity: culture only — Oromo flag colors (green/red/white),
// Irreecha festival palette (green + gold), Afaan Oromoo text, grass/nature motifs,
// Siinqee (ritual staff), Kallacha (forehead ornament), Gadaa system references.
// NO religious symbols — religion-agnostic.

const DEFAULT_PROGRAM = [
  { time: "9:00 AM",  timeEn: "9:00 AM",  timeOr: "Ganama 9",  titleOr: "Sirna Fuudhaa",     title: "Wedding Ceremony",    desc: "Exchange of vows" },
  { time: "11:00 AM", timeEn: "11:00 AM", timeOr: "Ganama 11", titleOr: "Suuraa Fuudhuu",    title: "Photo Session",       desc: "Family portraits" },
  { time: "12:00 PM", timeEn: "12:00 PM", timeOr: "Guyyaa 12", titleOr: "Ayyaana Sirna",     title: "Reception Feast",     desc: "Oromo traditional feast" },
  { time: "2:00 PM",  timeEn: "2:00 PM",  timeOr: "Guyyaa 2",  titleOr: "Nyaata Afaan",      title: "Traditional Meal",    desc: "Marqaa, himbasha & more" },
  { time: "4:00 PM",  timeEn: "4:00 PM",  timeOr: "Guyyaa 4",  titleOr: "Sirbaa fi Taphataa",title: "Music & Dance",       desc: "Oromo music & celebration" },
  { time: "6:00 PM",  timeEn: "6:00 PM",  timeOr: "Galgala 6", titleOr: "Dubbii fi Eebbaa",  title: "Speeches & Blessing", desc: "Family tributes & blessing" },
];

export default function OromoTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const { year, weddingDay, firstDay, daysInMonth, monthName } = getCalendarDays(data.date);
  const gc = new Date(data.date);

  const cells: (number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  // Oromo colors: deep forest green, red, white, gold
  const FOREST = "#1A4023";
  const RED    = "#C0392B";
  const GOLD   = "#D4A017";
  const CREAM  = "#F5F0E8";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        .or2{background:${CREAM};color:#0D2010;font-family:'Nunito',sans-serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .or2 *{box-sizing:border-box;}
        .or2-in{opacity:0;transition:opacity .65s ease;}
        .or2-in.go{opacity:1;}
        /* Oromo flag stripe top: green | red | white */
        .or2-flag{display:flex;height:12px;}
        .or2-flag-g{flex:1;background:${FOREST};}
        .or2-flag-r{flex:1;background:${RED};}
        .or2-flag-w{flex:1;background:#fff;}
        /* hero */
        .or2-hero{position:relative;height:64vh;min-height:400px;}
        .or2-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .or2-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(26,64,35,.15) 0%,rgba(26,64,35,.45) 60%,${FOREST} 100%);}
        /* green band names */
        .or2-band{background:${FOREST};padding:26px 22px 20px;text-align:center;position:relative;}
        .or2-band::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:${GOLD};}
        .or2-nm{font-family:'Libre Baskerville',serif;font-size:clamp(1.6rem,7vw,2.5rem);font-style:italic;color:#fff;line-height:1.2;}
        .or2-nm-or{font-family:'Nunito',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(212,160,23,.7);margin-top:6px;}
        .or2-save{font-family:'Nunito',sans-serif;font-size:9px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-top:7px;}
        /* Irreecha nature divider */
        .or2-nature{background:${FOREST};padding:12px 20px 20px;display:flex;align-items:center;gap:8px;}
        .or2-nature-line{flex:1;height:1px;background:rgba(212,160,23,.3);}
        /* calendar */
        .or2-cal{background:${FOREST};padding:0 20px 22px;}
        .or2-cal-head{text-align:center;padding-bottom:14px;}
        .or2-cal-month{font-family:'Libre Baskerville',serif;font-size:1.85rem;font-weight:700;color:#fff;}
        .or2-cal-yr{font-family:'Nunito',sans-serif;font-size:12px;color:rgba(255,255,255,.38);margin-left:8px;}
        .or2-cal-dh{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px;}
        .or2-cal-dhc{text-align:center;font-family:'Nunito',sans-serif;font-size:8px;font-weight:600;letter-spacing:.1em;color:rgba(255,255,255,.3);padding:3px 0;}
        .or2-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
        .or2-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;font-size:13px;color:rgba(255,255,255,.6);}
        .or2-cal-day.wed{background:rgba(212,160,23,.18);border:2px solid ${GOLD};border-radius:50%;}
        /* countdown */
        .or2-cd{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:3px solid ${FOREST};}
        .or2-cdc{text-align:center;padding:17px 4px;border-right:1px solid rgba(26,64,35,.12);}
        .or2-cdc:last-child{border-right:none;}
        .or2-cdn{font-family:'Libre Baskerville',serif;font-size:2.1rem;font-weight:700;color:${FOREST};line-height:1;}
        .or2-cdl{font-family:'Nunito',sans-serif;font-size:8px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:rgba(26,64,35,.38);margin-top:5px;}
        /* rule */
        .or2-rule{display:flex;align-items:center;gap:10px;padding:0 22px;margin:22px 0;}
        .or2-rl{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(26,64,35,.25),transparent);}
        /* section */
        .or2-sh{text-align:center;padding:0 24px 14px;}
        .or2-sh-or{font-family:'Nunito',sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${FOREST};margin-bottom:5px;}
        .or2-sh-en{font-family:'Libre Baskerville',serif;font-size:1.3rem;color:#0D2010;}
        /* message */
        .or2-msg{padding:0 26px 24px;text-align:center;}
        .or2-msg p{font-size:13.5px;font-weight:300;line-height:1.9;color:rgba(13,32,16,.65);}
        /* details */
        .or2-dets{background:rgba(26,64,35,.04);}
        .or2-det{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid rgba(26,64,35,.08);}
        .or2-det:last-child{border-bottom:none;}
        .or2-det-ic{display:flex;align-items:center;justify-content:center;padding:15px 0;border-right:1px solid rgba(26,64,35,.08);}
        .or2-det-bd{padding:13px 15px;}
        .or2-det-k{font-family:'Nunito',sans-serif;font-size:8px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,64,35,.42);margin-bottom:3px;}
        .or2-det-v{font-family:'Libre Baskerville',serif;font-size:14px;color:#0D2010;line-height:1.4;}
        /* programme */
        .or2-prog{padding:0 20px 24px;}
        .or2-pi{display:grid;grid-template-columns:72px 1fr;margin-bottom:2px;}
        .or2-pt{padding:12px 11px 12px 0;text-align:right;border-right:2px solid rgba(26,64,35,.15);}
        .or2-pt-or{font-family:'Nunito',sans-serif;font-size:11px;font-weight:600;color:${FOREST};}
        .or2-pt-en{font-family:'Nunito',sans-serif;font-size:9.5px;color:rgba(13,32,16,.38);margin-top:2px;}
        .or2-pb{padding:12px 0 12px 14px;position:relative;}
        .or2-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:${GOLD};border-radius:50%;}
        .or2-pb-or{font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#0D2010;}
        .or2-pb-en{font-family:'Libre Baskerville',serif;font-size:12px;color:${FOREST};margin-top:1px;}
        .or2-pb-d{font-family:'Nunito',sans-serif;font-size:11.5px;font-weight:300;color:rgba(13,32,16,.45);margin-top:3px;}
        /* map */
        .or2-map{margin:0 20px 20px;height:162px;overflow:hidden;border:1px solid rgba(26,64,35,.18);}
        .or2-map iframe{width:100%;height:100%;border:none;filter:hue-rotate(80deg) saturate(.8);}
        .or2-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 20px 24px;padding:12px;border:1.5px solid ${FOREST};color:${FOREST};font-family:'Nunito',sans-serif;font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;transition:all .2s;}
        .or2-mapbtn:hover{background:${FOREST};color:#fff;}
        /* rsvp */
        .or2-rsvp{margin:0 20px 32px;padding:24px 20px;border:1.5px solid rgba(26,64,35,.2);background:#fff;}
        .or2-rsvp-t{font-family:'Libre Baskerville',serif;font-size:1.35rem;color:#0D2010;text-align:center;margin-bottom:4px;}
        .or2-rsvp-or{font-family:'Nunito',sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(26,64,35,.4);text-align:center;margin-bottom:22px;}
        .or2-lbl{font-family:'Nunito',sans-serif;font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(26,64,35,.42);display:block;margin-bottom:6px;}
        .or2-field{width:100%;background:${CREAM};border:1px solid rgba(26,64,35,.18);color:#0D2010;padding:11px 13px;font-family:'Nunito',sans-serif;font-size:13.5px;font-weight:300;outline:none;margin-bottom:14px;transition:border-color .15s;border-radius:3px;}
        .or2-field:focus{border-color:${FOREST};}
        .or2-field::placeholder{color:rgba(26,64,35,.22);}
        .or2-field option{background:${CREAM};}
        .or2-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .or2-ab{padding:10px 4px;border:1px solid rgba(26,64,35,.18);background:transparent;color:rgba(26,64,35,.4);font-family:'Nunito',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:all .15s;}
        .or2-ab.on{border-color:${FOREST};color:${FOREST};background:rgba(26,64,35,.06);}
        .or2-sub{width:100%;padding:13px;background:${FOREST};color:#fff;font-family:'Nunito',sans-serif;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;border:none;cursor:pointer;border-radius:3px;transition:opacity .2s;}
        .or2-sub:hover{opacity:.9;}
        .or2-sub:disabled{opacity:.42;cursor:not-allowed;}
        /* footer */
        .or2-foot{background:${FOREST};padding:22px 20px;text-align:center;}
        .or2-foot-nm{font-family:'Libre Baskerville',serif;font-size:1rem;font-style:italic;color:rgba(255,255,255,.55);}
        .or2-foot-v{font-family:'Nunito',sans-serif;font-size:8.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.25);margin-top:5px;}
        /* audio btn */
        .or2-audio{position:fixed;top:14px;right:14px;z-index:100;background:rgba(26,64,35,.9);border:1px solid rgba(212,160,23,.4);color:${GOLD};font-family:'Nunito',sans-serif;font-size:10px;font-weight:600;letter-spacing:.1em;padding:7px 10px;cursor:pointer;backdrop-filter:blur(5px);}
      `}</style>

      <div className={`or2 or2-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        {data.audioUrl&&<button className="or2-audio" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}

        {/* Oromo flag stripe */}
        <div className="or2-flag"><div className="or2-flag-g"/><div className="or2-flag-r"/><div className="or2-flag-w"/></div>

        {/* Hero */}
        <div className="or2-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="or2-ov"/>
        </div>

        {/* Green names band */}
        <div className="or2-band">
          <p className="or2-nm">{data.groomName} & {data.brideName}</p>
          <p className="or2-nm-or">Sirna Fuudhaa · Wedding Celebration</p>
          <p className="or2-save">Guyyaa Kee Ol-kaa'i · Save the Date</p>
        </div>

        {/* Irreecha leaf divider */}
        <div className="or2-nature">
          <div className="or2-nature-line"/>
          {/* Siinqee / leaf motif */}
          <svg viewBox="0 0 28 28" width="22" height="22">
            <ellipse cx="14" cy="10" rx="5" ry="9" fill={FOREST} opacity=".7" transform="rotate(-15 14 14)"/>
            <ellipse cx="14" cy="10" rx="5" ry="9" fill={FOREST} opacity=".5" transform="rotate(15 14 14)"/>
            <line x1="14" y1="4" x2="14" y2="26" stroke={GOLD} strokeWidth="1.2" opacity=".6"/>
          </svg>
          <div className="or2-nature-line"/>
        </div>

        {/* Calendar */}
        <div className="or2-cal">
          <div className="or2-cal-head">
            <span className="or2-cal-month">{monthName}</span>
            <span className="or2-cal-yr">{year}</span>
          </div>
          <div className="or2-cal-dh">
            {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=><div key={d} className="or2-cal-dhc">{d}</div>)}
          </div>
          <div className="or2-cal-days">
            {cells.map((day,i)=>(
              <div key={i} className={`or2-cal-day${day===weddingDay?" wed":""}`}>
                {day===weddingDay?(
                  <svg viewBox="0 0 24 24" width="17" height="17" fill={GOLD} stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                ):day!==null?day:""}
              </div>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="or2-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="or2-cdc">
              <p className="or2-cdn">{String(n).padStart(2,"0")}</p>
              <p className="or2-cdl">{l}</p>
            </div>
          ))}
        </div>

        {/* Greeting */}
        <div className="or2-rule" style={{marginTop:26}}>
          <div className="or2-rl"/>
          <svg viewBox="0 0 28 28" width="20" height="20">
            <ellipse cx="14" cy="10" rx="4" ry="8" fill={FOREST} opacity=".6" transform="rotate(-20 14 14)"/>
            <ellipse cx="14" cy="10" rx="4" ry="8" fill={FOREST} opacity=".45" transform="rotate(20 14 14)"/>
            <line x1="14" y1="5" x2="14" y2="25" stroke={GOLD} strokeWidth="1.2" opacity=".55"/>
          </svg>
          <div className="or2-rl"/>
        </div>
        <div className="or2-sh">
          <p className="or2-sh-or">Maatii fi Hiriyoota Keenya</p>
          <p className="or2-sh-en">{data.greetingTitle}</p>
        </div>
        <div className="or2-msg"><p>{data.messageBody}</p></div>

        {/* Details */}
        <div className="or2-rule" style={{margin:"4px 0 16px"}}>
          <div className="or2-rl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="rgba(26,64,35,.45)" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg>
          <div className="or2-rl"/>
        </div>
        <div className="or2-sh" style={{paddingBottom:12}}>
          <p className="or2-sh-or">Odeeffannoo Sirna · Event Details</p>
        </div>
        <div className="or2-dets">
          {[
            {icon:"📅",k:"Date",    v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})},
            {icon:"⏰",k:"Time",    v:data.timeEn},
            {icon:"🏛️",k:"Venue",  v:data.venue},
            {icon:"📍",k:"Location",v:data.venueAddress},
          ].map(row=>(
            <div key={row.k} className="or2-det">
              <div className="or2-det-ic"><span style={{fontSize:17}}>{row.icon}</span></div>
              <div className="or2-det-bd">
                <p className="or2-det-k">{row.k}</p>
                <p className="or2-det-v">{row.v}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="or2-rule" style={{margin:"22px 0 16px"}}>
          <div className="or2-rl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="rgba(26,64,35,.45)" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg>
          <div className="or2-rl"/>
        </div>
        <div className="or2-sh" style={{paddingBottom:14}}>
          <p className="or2-sh-or">Sagantaa Guyyaa · Programme</p>
        </div>
        <div className="or2-prog">
          {prog.map(item=>(
            <div key={item.time} className="or2-pi">
              <div className="or2-pt">
                <p className="or2-pt-or">{(item as any).timeOr??item.time}</p>
                <p className="or2-pt-en">{item.timeEn??item.time}</p>
              </div>
              <div className="or2-pb">
                <div className="or2-pdot"/>
                <p className="or2-pb-or">{(item as any).titleOr??item.title}</p>
                <p className="or2-pb-en">{item.title}</p>
                <p className="or2-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="or2-rule" style={{margin:"8px 0 16px"}}>
          <div className="or2-rl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill={FOREST} opacity=".5"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.17 5 11 5 11s5-6.83 5-11c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 5.5 10 5.5 11.5 6.17 11.5 7 10.83 8.5 10 8.5z"/></svg>
          <div className="or2-rl"/>
        </div>
        <div className="or2-sh" style={{paddingBottom:13}}><p className="or2-sh-or">Bakka Sirna · Venue Location</p></div>
        {data.venueMapUrl?(
          <div className="or2-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>
        ):(
          <div className="or2-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(26,64,35,.28)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:"9px",color:"rgba(26,64,35,.28)"}}>Provide venueMapUrl to embed map</p>
          </div>
        )}
        {data.venueMapLink&&(
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="or2-mapbtn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Open in Google Maps
          </a>
        )}

        {/* RSVP */}
        <WeddingGallery images={data.galleryImages??[]} telegramChannel={data.telegramChannel} telegramName={data.telegramChannelName} coupleNames={`${data.groomName} & ${data.brideName}`} accentColor="#D4A017" bgColor="#1A4023" textColor="#F5F0E8"/>
        <div className="or2-rsvp">
          {rsvp.submitted?(
            <div style={{textAlign:"center",padding:"18px 0"}}>
              <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:"1.1rem",fontStyle:"italic",color:FOREST,marginBottom:6}}>Galateeffanna!</p>
              <p style={{fontFamily:"'Nunito',sans-serif",fontSize:"9px",letterSpacing:".18em",textTransform:"uppercase",color:"rgba(26,64,35,.42)"}}>Your RSVP has been received</p>
            </div>
          ):(
            <>
              <p className="or2-rsvp-t">RSVP</p>
              <p className="or2-rsvp-or">Dhufaatii Kee Mirkaneessi · Confirm Attendance</p>
              <label className="or2-lbl">Full Name *</label>
              <input className="or2-field" placeholder="e.g. Chaltu Gemechu" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="or2-lbl">Phone · Lakkoofsa Bilbilaa *</label>
              <input className="or2-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="or2-lbl">Attendance</label>
              <div className="or2-att">
                {(["yes","no","maybe"] as const).map(v=>(
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`or2-ab${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Dhufaa":v==="no"?"✗ Dhufuu Hindanda'u":"? Beekamaa Miti"}
                  </button>
                ))}
              </div>
              <label className="or2-lbl">Number of Guests</label>
              <select className="or2-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="or2-lbl">Message to the Couple</label>
              <textarea className="or2-field" rows={3} style={{resize:"none"}} placeholder="Eebbaa kee qoodadhu… Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="or2-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Erga jira…":"Mirkaneessi · Confirm RSVP"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="or2-foot">
          <p className="or2-foot-nm">{data.groomName} & {data.brideName}</p>
          <p className="or2-foot-v">{data.venue} · Oromiyaa, Ethiopia</p>
        </div>
        <div className="or2-flag"><div className="or2-flag-g"/><div className="or2-flag-r"/><div className="or2-flag-w"/></div>
      </div>
    </>
  );
}