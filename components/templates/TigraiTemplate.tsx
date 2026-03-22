"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP, getCalendarDays, getEthiopianDate } from "@/lib/hooks";

// ─── CULTURE TEMPLATE: Tigrai ─────────────────────────────────────────────────
// Visual identity: culture only — Axum obelisk silhouette, ancient stone feel,
// deep red + aged gold + navy, Tigrinya script, traditional Tigrai wedding programme.
// NO religious symbols — religion-agnostic.

const DEFAULT_PROGRAM = [
  { time:"9:00 ጠዋት",  timeEn:"9:00 AM",  titleTi:"ሰርሓት",          title:"Wedding Ceremony",    desc:"Exchange of vows" },
  { time:"11:00 ጠዋት", timeEn:"11:00 AM", titleTi:"ስእሊ ምሕዛዝ",      title:"Photo Session",       desc:"Family & couple portraits" },
  { time:"12:00 ቀን",  timeEn:"12:00 PM", titleTi:"ዓቢ ምግቢ",        title:"Grand Feast",         desc:"Traditional Tigrai banquet" },
  { time:"2:00 ቀን",   timeEn:"2:00 PM",  titleTi:"ናይ ሓዳር ሽርሒ",    title:"Unity Ritual",        desc:"Traditional feeding ceremony" },
  { time:"4:00 ቀን",   timeEn:"4:00 PM",  titleTi:"ሙዚቃን ምዝናይን",    title:"Music & Dancing",     desc:"Traditional Tigrai music" },
  { time:"6:00 ቀን",   timeEn:"6:00 PM",  titleTi:"ናይ ቤተሰብ ናይ ሓዳር",title:"Family Blessing",     desc:"Closing blessings from elders" },
];

export default function TigraiTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const eth  = getEthiopianDate(data.date);
  const { year, weddingDay, firstDay, daysInMonth, monthName } = getCalendarDays(data.date);
  const gc   = new Date(data.date);

  const cells:(number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  const RED="#7B1D1D"; const GOLD="#C09020"; const NAVY="#0F1F3D"; const STONE="#F0E8D8";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Ethiopic:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        .ti{background:${STONE};color:#1A0800;font-family:'Libre Baskerville',Georgia,serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .ti *{box-sizing:border-box;}
        .ti-in{opacity:0;transition:opacity .65s ease;}
        .ti-in.go{opacity:1;}
        /* Axum stripe top: navy | gold | red */
        .ti-stripe{display:flex;height:10px;}
        .ti-stripe-n{flex:1;background:${NAVY};}
        .ti-stripe-g{flex:1;background:${GOLD};}
        .ti-stripe-r{flex:1;background:${RED};}
        /* hero */
        .ti-hero{position:relative;height:92vh;min-height:400px;}
        .ti-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .ti-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(61,14,14,.85) 0%,rgba(15,31,61,.22) 28%,rgba(15,31,61,.12) 50%,rgba(61,14,14,.62) 74%,#3D0E0E 100%);z-index:1;}
        .ti-vig{position:absolute;inset:0;box-shadow:inset 0 0 120px rgba(0,0,0,.55);pointer-events:none;z-index:3;}
        .ti-pat{position:absolute;inset:0;pointer-events:none;opacity:.04;background-image:repeating-linear-gradient(0deg,rgba(192,144,32,1) 0px,rgba(192,144,32,1) 1px,transparent 1px,transparent 28px);z-index:2;}
        .ti-grain{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;} 100%);}
        /* obelisk silhouette top of photo */
        .ti-obelisk{position:absolute;top:14px;left:50%;transform:translateX(-50%);opacity:.18;pointer-events:none;}
        /* names band */
        .ti-band{background:${RED};padding:24px 22px 20px;text-align:center;position:relative;}
        .ti-band::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:${GOLD};}
        .ti-nm-ti{font-family:'Noto Serif Ethiopic',serif;font-size:clamp(1.55rem,7.5vw,2.4rem);font-weight:500;color:#FBE9B0;line-height:1.25;}
        .ti-nm-en{font-family:'Playfair Display',serif;font-size:clamp(1rem,4vw,1.45rem);font-style:italic;color:rgba(251,233,176,.6);margin-top:4px;}
        .ti-save{font-family:'Libre Baskerville',sans-serif;font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:rgba(251,233,176,.38);margin-top:8px;}
        /* calendar in navy */
        .ti-cal{background:${NAVY};padding:0 20px 22px;}
        .ti-cal-head{text-align:center;padding-bottom:14px;}
        .ti-cal-month{font-family:'Playfair Display',serif;font-size:1.85rem;font-weight:700;color:#fff;letter-spacing:.04em;}
        .ti-cal-yr{font-family:'Libre Baskerville',sans-serif;font-size:12px;color:rgba(255,255,255,.35);margin-left:8px;}
        .ti-cal-eth{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:rgba(192,144,32,.65);margin-top:3px;}
        .ti-cal-dh{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px;}
        .ti-cal-dhc{text-align:center;font-family:'Libre Baskerville',sans-serif;font-size:8px;letter-spacing:.1em;color:rgba(255,255,255,.28);padding:3px 0;}
        .ti-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
        .ti-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12.5px;color:rgba(255,255,255,.58);}
        .ti-cal-day.wed{background:rgba(192,144,32,.18);border:2px solid ${GOLD};border-radius:50%;}
        /* countdown */
        .ti-cd{display:grid;grid-template-columns:repeat(4,1fr);background:${STONE};border-bottom:3px solid ${RED};}
        .ti-cdc{text-align:center;padding:17px 4px;border-right:1px solid rgba(123,29,29,.12);}
        .ti-cdc:last-child{border-right:none;}
        .ti-cdn{font-family:'Playfair Display',serif;font-size:2.1rem;font-weight:700;color:${RED};line-height:1;}
        .ti-cdl{font-family:'Libre Baskerville',sans-serif;font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:rgba(123,29,29,.38);margin-top:5px;}
        /* rule */
        .ti-rule{display:flex;align-items:center;gap:10px;padding:0 22px;margin:22px 0;}
        .ti-rl{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(123,29,29,.28),transparent);}
        /* section */
        .ti-sh{text-align:center;padding:0 24px 14px;}
        .ti-sh-ti{font-family:'Noto Serif Ethiopic',serif;font-size:1.05rem;font-weight:500;color:${RED};margin-bottom:4px;}
        .ti-sh-en{font-family:'Playfair Display',serif;font-size:1.3rem;color:#1A0800;}
        /* message */
        .ti-msg{padding:0 26px 24px;text-align:center;}
        .ti-msg p{font-size:13.5px;line-height:1.9;color:rgba(26,8,0,.62);}
        /* details */
        .ti-dets{background:rgba(123,29,29,.05);}
        .ti-det{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid rgba(123,29,29,.08);}
        .ti-det:last-child{border-bottom:none;}
        .ti-det-ic{display:flex;align-items:center;justify-content:center;padding:15px 0;border-right:1px solid rgba(123,29,29,.08);}
        .ti-det-bd{padding:13px 15px;}
        .ti-det-k{font-family:'Libre Baskerville',sans-serif;font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:rgba(123,29,29,.42);margin-bottom:3px;}
        .ti-det-v{font-family:'Playfair Display',serif;font-size:14px;color:#1A0800;line-height:1.4;}
        .ti-det-ti{font-family:'Noto Serif Ethiopic',serif;font-size:11px;color:rgba(123,29,29,.42);margin-top:2px;}
        /* programme */
        .ti-prog{padding:0 20px 24px;}
        .ti-pi{display:grid;grid-template-columns:72px 1fr;margin-bottom:2px;}
        .ti-pt{padding:12px 11px 12px 0;text-align:right;border-right:2px solid rgba(123,29,29,.15);}
        .ti-pt-ti{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:${RED};}
        .ti-pt-en{font-size:9.5px;color:rgba(26,8,0,.35);margin-top:2px;}
        .ti-pb{padding:12px 0 12px 14px;position:relative;}
        .ti-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:${GOLD};border-radius:50%;}
        .ti-pb-ti{font-family:'Noto Serif Ethiopic',serif;font-size:13px;font-weight:500;color:#1A0800;}
        .ti-pb-en{font-family:'Playfair Display',serif;font-size:12.5px;color:${RED};margin-top:1px;}
        .ti-pb-d{font-size:11.5px;color:rgba(26,8,0,.42);margin-top:3px;}
        /* map */
        .ti-map{margin:0 20px 20px;height:162px;overflow:hidden;border:1px solid rgba(123,29,29,.18);}
        .ti-map iframe{width:100%;height:100%;border:none;filter:sepia(10%) saturate(.9);}
        .ti-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 20px 24px;padding:12px;border:1.5px solid ${RED};color:${RED};font-family:'Libre Baskerville',sans-serif;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;transition:all .2s;}
        .ti-mapbtn:hover{background:${RED};color:${STONE};}
        /* rsvp */
        .ti-rsvp{margin:0 20px 32px;padding:24px 20px;border:1.5px solid rgba(123,29,29,.2);background:#fff;}
        .ti-rsvp-t{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:600;color:#1A0800;text-align:center;margin-bottom:4px;}
        .ti-rsvp-ti{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:rgba(123,29,29,.42);text-align:center;margin-bottom:22px;}
        .ti-lbl{font-family:'Libre Baskerville',sans-serif;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(123,29,29,.42);display:block;margin-bottom:6px;}
        .ti-field{width:100%;background:${STONE};border:1px solid rgba(123,29,29,.18);color:#1A0800;padding:11px 13px;font-family:'Libre Baskerville',serif;font-size:13.5px;outline:none;margin-bottom:14px;transition:border-color .15s;border-radius:2px;}
        .ti-field:focus{border-color:${RED};}
        .ti-field::placeholder{color:rgba(123,29,29,.22);}
        .ti-field option{background:${STONE};}
        .ti-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .ti-ab{padding:10px 4px;border:1px solid rgba(123,29,29,.18);background:transparent;color:rgba(123,29,29,.4);font-family:'Libre Baskerville',sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .15s;}
        .ti-ab.on{border-color:${RED};color:${RED};background:rgba(123,29,29,.06);}
        .ti-sub{width:100%;padding:13px;background:${RED};color:${STONE};font-family:'Libre Baskerville',sans-serif;font-size:10px;letter-spacing:.22em;text-transform:uppercase;border:none;cursor:pointer;border-radius:2px;transition:opacity .2s;}
        .ti-sub:hover{opacity:.9;}
        .ti-sub:disabled{opacity:.42;cursor:not-allowed;}
        /* footer */
        .ti-foot{background:${RED};padding:22px 20px;text-align:center;}
        .ti-foot-ti{font-family:'Noto Serif Ethiopic',serif;font-size:1rem;color:rgba(251,233,176,.7);margin-bottom:4px;}
        .ti-foot-en{font-family:'Playfair Display',serif;font-size:13px;font-style:italic;color:rgba(251,233,176,.45);}
        .ti-foot-v{font-family:'Libre Baskerville',sans-serif;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(251,233,176,.25);margin-top:5px;}
        .ti-ctrl{position:fixed;top:13px;right:13px;display:flex;gap:8px;z-index:100;}
        .ti-btn{background:rgba(123,29,29,.9);border:1px solid rgba(192,144,32,.4);color:${GOLD};font-family:'Libre Baskerville',sans-serif;font-size:10px;letter-spacing:.1em;padding:7px 10px;cursor:pointer;backdrop-filter:blur(5px);}

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(251,233,176,.85); }
          50%      { text-shadow: 0 2px 40px rgba(251,233,176,.85), 0 0 80px rgba(251,233,176,.35); }
        }
        .ti-nm-ti { animation: name-glow 3.5s ease-in-out infinite; }
      `}</style>

      <div className={`ti ti-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        <div className="ti-ctrl">
          {data.audioUrl&&<button className="ti-btn" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}
        </div>

        <div className="ti-stripe"><div className="ti-stripe-n"/><div className="ti-stripe-g"/><div className="ti-stripe-r"/></div>

        {/* Hero */}
        <div className="ti-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="ti-ov"/>
          {/* <div className="ti-pat" style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",position:absolute;inset:0;pointer-events:none;opacity:.04;background-image:repeating-linear-gradient(0deg,rgba(192,144,32,1) 0px,rgba(192,144,32,1) 1px,transparent 1px,transparent 28px);}}/> */}
          <div className="ti-vig" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 120px rgba(0,0,0,0.55)",pointerEvents:"none",zIndex:3}}/>
          {/* Axum obelisk silhouette */}
          <svg className="ti-obelisk" viewBox="0 0 40 120" width="28" height="84" fill="#fff">
            <polygon points="20,0 24,20 22,20 22,110 18,110 18,20 16,20"/>
            <rect x="14" y="110" width="12" height="6" rx="1"/>
            <rect x="16" y="30" width="8" height="2" opacity=".6"/>
            <rect x="16" y="50" width="8" height="2" opacity=".6"/>
            <rect x="16" y="70" width="8" height="2" opacity=".6"/>
          </svg>
        </div>

        {/* Names band */}
        <div className="ti-band">
          <p className="ti-nm-ti">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="ti-nm-en">{data.groomName} & {data.brideName}</p>
          <p className="ti-save">ናይ ሰርሓት መዓልቲ · Save the Date</p>
        </div>

        {/* Calendar */}
        <div className="ti-cal">
          <div className="ti-cal-head">
            <span className="ti-cal-month">{monthName}</span><span className="ti-cal-yr">{year}</span>
            <p className="ti-cal-eth">{eth.day} {eth.monthAm} {eth.year} ዓ.ም</p>
          </div>
          <div className="ti-cal-dh">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=><div key={d} className="ti-cal-dhc">{d}</div>)}</div>
          <div className="ti-cal-days">
            {cells.map((day,i)=>(
              <div key={i} className={`ti-cal-day${day===weddingDay?" wed":""}`}>
                {day===weddingDay?(<svg viewBox="0 0 24 24" width="17" height="17" fill={GOLD} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>):day!==null?day:""}
              </div>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="ti-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="ti-cdc"><p className="ti-cdn">{String(n).padStart(2,"0")}</p><p className="ti-cdl">{l}</p></div>
          ))}
        </div>

        {/* Greeting */}
        <div className="ti-rule" style={{marginTop:26}}>
          <div className="ti-rl"/>
          <svg viewBox="0 0 28 28" width="18" height="18" fill={GOLD} opacity=".6"><polygon points="14,2 16.5,9 24,9 18,13.5 20.5,21 14,16.5 7.5,21 10,13.5 4,9 11.5,9"/></svg>
          <div className="ti-rl"/>
        </div>
        <div className="ti-sh">
          <p className="ti-sh-ti">ንፈተውቲ ቤተሰብን ፈሪምስን</p>
          <p className="ti-sh-en">{data.greetingTitle}</p>
        </div>
        <div className="ti-msg"><p>{data.messageBody}</p>{data.messageBodyAm&&<p style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:"12.5px",color:"rgba(26,8,0,.42)",lineHeight:1.9,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(123,29,29,.1)"}}>{data.messageBodyAm}</p>}</div>

        {/* Details */}
        <div className="ti-rule" style={{margin:"4px 0 16px"}}><div className="ti-rl"/><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="rgba(123,29,29,.45)" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg><div className="ti-rl"/></div>
        <div className="ti-sh" style={{paddingBottom:12}}><p className="ti-sh-ti">ዝርዝር ሓበሬታ</p><p className="ti-sh-en" style={{fontSize:"1.1rem"}}>Event Details</p></div>
        <div className="ti-dets">
          {[
            {icon:"📅",k:"Date",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),ti:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {icon:"⏰",k:"Time",v:data.timeEn,ti:data.timeAm??""},
            {icon:"🏛️",k:"Venue",v:data.venue,ti:""},
            {icon:"📍",k:"Location",v:data.venueAddress,ti:""},
          ].map(row=>(
            <div key={row.k} className="ti-det">
              <div className="ti-det-ic"><span style={{fontSize:17}}>{row.icon}</span></div>
              <div className="ti-det-bd">
                <p className="ti-det-k">{row.k}</p>
                <p className="ti-det-v">{row.v}</p>
                {row.ti&&<p className="ti-det-ti">{row.ti}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="ti-rule" style={{margin:"22px 0 16px"}}><div className="ti-rl"/><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="rgba(123,29,29,.45)" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg><div className="ti-rl"/></div>
        <div className="ti-sh" style={{paddingBottom:14}}><p className="ti-sh-ti">ፕሮግራም ናይ ዓይ</p><p className="ti-sh-en" style={{fontSize:"1.1rem"}}>Programme of Events</p></div>
        <div className="ti-prog">
          {prog.map(item=>(
            <div key={item.time} className="ti-pi">
              <div className="ti-pt">
                <p className="ti-pt-ti">{item.time}</p>
                <p className="ti-pt-en">{item.timeEn??item.time}</p>
              </div>
              <div className="ti-pb">
                <div className="ti-pdot"/>
                <p className="ti-pb-ti">{(item as any).titleTi??item.title}</p>
                <p className="ti-pb-en">{item.title}</p>
                <p className="ti-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="ti-rule" style={{margin:"8px 0 16px"}}><div className="ti-rl"/><svg viewBox="0 0 20 20" width="14" height="14" fill={RED} opacity=".5"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.17 5 11 5 11s5-6.83 5-11c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 5.5 10 5.5 11.5 6.17 11.5 7 10.83 8.5 10 8.5z"/></svg><div className="ti-rl"/></div>
        <div className="ti-sh" style={{paddingBottom:13}}><p className="ti-sh-ti">ቦታ ሰርሓት</p></div>
        {data.venueMapUrl?(<div className="ti-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>):(<div className="ti-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(123,29,29,.28)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><p style={{fontSize:"9px",color:"rgba(123,29,29,.28)"}}>Provide venueMapUrl to embed map</p></div>)}
        {data.venueMapLink&&(<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="ti-mapbtn"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>)}

        {/* RSVP */}
        <div className="ti-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"18px 0"}}><p style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:"1.05rem",color:RED,marginBottom:6}}>ብዙሕ ኣመስጊንካ!</p><p style={{fontSize:"8.5px",letterSpacing:".18em",textTransform:"uppercase",color:"rgba(123,29,29,.42)"}}>Your RSVP has been received</p></div>):(
            <>
              <p className="ti-rsvp-t">RSVP</p>
              <p className="ti-rsvp-ti">ምዕዳ ሰርሓት · Confirm Attendance</p>
              <label className="ti-lbl">Full Name · ሙሉ ስም *</label>
              <input className="ti-field" placeholder="e.g. Miriam Tesfay" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="ti-lbl">Phone · ስልኪ ቁጽሪ *</label>
              <input className="ti-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="ti-lbl">Attendance</label>
              <div className="ti-att">{(["yes","no","maybe"] as const).map(v=>(<button key={v} onClick={()=>rsvp.update("attending",v)} className={`ti-ab${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ ክምጻእ":"✗ ኣይምጻእን"}</button>))}</div>
              <label className="ti-lbl">Number of Guests</label>
              <select className="ti-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="ti-lbl">Message to the Couple</label>
              <textarea className="ti-field" rows={3} style={{resize:"none"}} placeholder="ናይ ቡራኬ ቃላትካ ዕደው…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="ti-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP"}</button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="ti-foot">
          <p className="ti-foot-ti">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="ti-foot-en">{data.groomName} & {data.brideName}</p>
          <p className="ti-foot-v">{data.venue} · Tigrai, Ethiopia</p>
        </div>
        <div className="ti-stripe"><div className="ti-stripe-n"/><div className="ti-stripe-g"/><div className="ti-stripe-r"/></div>
      </div>
    </>
  );
}