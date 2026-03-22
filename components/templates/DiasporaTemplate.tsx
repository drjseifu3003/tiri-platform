"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP, useLang, getCalendarDays } from "@/lib/hooks";

// ─── CULTURE TEMPLATE: Ethiopian Diaspora ────────────────────────────────────
// Visual identity: modern minimal for Ethiopians abroad — clean Swiss grid,
// deep charcoal + Ethiopian green accent, bilingual EN/AM toggle,
// international venue styling, WhatsApp share button.
// NO religious symbols — religion-agnostic.

const DEFAULT_PROGRAM = [
  { time:"4:00 PM",  timeAm:"10:00 ቀን",  title:"Arrival & Welcome",   titleAm:"መግቢያ",         desc:"Drinks & welcome reception" },
  { time:"5:00 PM",  timeAm:"11:00 ቀን",  title:"Wedding Ceremony",    titleAm:"ሠርግ",           desc:"Exchange of vows" },
  { time:"6:30 PM",  timeAm:"12:30 ሌሊት", title:"Cocktail Hour",       titleAm:"ኮክቴይል",        desc:"Canapés & celebration drinks" },
  { time:"7:30 PM",  timeAm:"1:30 ሌሊት",  title:"Dinner & Speeches",   titleAm:"ዲነር",           desc:"Sit-down dinner & toasts" },
  { time:"9:30 PM",  timeAm:"3:30 ሌሊት",  title:"First Dance",         titleAm:"የመጀመሪያ ዳንስ",   desc:"Couple's first dance" },
  { time:"10:00 PM", timeAm:"4:00 ሌሊት",  title:"Party & Eskista",     titleAm:"ፓርቲ",           desc:"Dancing until midnight" },
];

export default function DiasporaTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const { lang, toggle } = useLang();
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const { year, weddingDay, firstDay, daysInMonth, monthName } = getCalendarDays(data.date);
  const gc = new Date(data.date);

  const cells:(number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  const CHAR="#1C1C1E"; const GREEN="#1A7A3C"; const CREAM="#F7F5F0"; const ACCENT="#2A6B3C";

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`You're invited to ${data.groomName} & ${data.brideName}'s wedding! 🎊\n📅 ${gc.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}\n📍 ${data.venue}\n\nhttps://yourdomain.com/invite/${data.slug}`)}`;
    window.open(url,"_blank");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Ethiopic:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .ds{background:${CREAM};color:${CHAR};font-family:'DM Sans',sans-serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .ds *{box-sizing:border-box;}
        .ds-in{opacity:0;transition:opacity .65s ease;}
        .ds-in.go{opacity:1;}
        /* thin green top bar */
        .ds-top{height:4px;background:${GREEN};}
        /* hero */
        .ds-hero{position:relative;height:92vh;min-height:400px;}
        .ds-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .ds-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,28,30,.88) 0%,rgba(28,28,30,.22) 28%,rgba(28,28,30,.12) 50%,rgba(28,28,30,.65) 74%,#1C1C1E 100%);z-index:1;}
        .ds-vig{position:absolute;inset:0;box-shadow:inset 0 0 120px rgba(0,0,0,.55);pointer-events:none;z-index:3;}
        .ds-pat{position:absolute;inset:0;pointer-events:none;opacity:.035;background-image:linear-gradient(rgba(26,122,60,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,60,.6) 1px,transparent 1px);background-size:40px 40px;z-index:2;}
        .ds-grain{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;} 100%);}
        .ds-nm{position:absolute;bottom:30px;left:0;right:0;padding:0 28px;z-index:2;}
        .ds-nm-en{font-family:'Instrument Serif',serif;font-size:clamp(2.2rem,10vw,3.4rem);font-style:italic;color:#fff;line-height:1.1;}
        .ds-nm-am{font-family:'Noto Serif Ethiopic',serif;font-size:clamp(1rem,4.5vw,1.5rem);color:rgba(255,255,255,.55);margin-top:4px;}
        .ds-tag{font-family:'DM Sans',sans-serif;font-size:9px;font-weight:500;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-top:10px;}
        /* stats row */
        .ds-stats{display:grid;grid-template-columns:repeat(4,1fr);background:${CHAR};}
        .ds-stat{text-align:center;padding:18px 4px;border-right:1px solid rgba(255,255,255,.08);}
        .ds-stat:last-child{border-right:none;}
        .ds-stat-n{font-family:'Instrument Serif',serif;font-size:2.1rem;font-style:italic;color:#fff;line-height:1;}
        .ds-stat-l{font-family:'DM Sans',sans-serif;font-size:7.5px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.28);margin-top:4px;}
        /* calendar */
        .ds-cal{background:${CHAR};padding:0 22px 24px;}
        .ds-cal-head{text-align:center;padding-bottom:14px;display:flex;align-items:baseline;justify-content:center;gap:10px;}
        .ds-cal-month{font-family:'Instrument Serif',serif;font-size:1.8rem;font-style:italic;color:#fff;}
        .ds-cal-yr{font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(255,255,255,.35);}
        .ds-cal-dh{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px;}
        .ds-cal-dhc{text-align:center;font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.08em;color:rgba(255,255,255,.28);padding:3px 0;}
        .ds-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
        .ds-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,.55);}
        .ds-cal-day.wed{background:rgba(26,122,60,.2);border:2px solid ${GREEN};border-radius:50%;}
        /* content */
        .ds-content{background:${CREAM};}
        /* section */
        .ds-sh{padding:28px 26px 16px;}
        .ds-sh-label{font-family:'DM Sans',sans-serif;font-size:8.5px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:rgba(28,28,30,.35);margin-bottom:8px;}
        .ds-sh-title{font-family:'Instrument Serif',serif;font-size:1.45rem;font-style:italic;color:${CHAR};}
        .ds-sh-am{font-family:'Noto Serif Ethiopic',serif;font-size:13px;color:rgba(26,107,60,.6);margin-top:3px;}
        /* divider */
        .ds-hr{height:1px;background:rgba(28,28,30,.1);margin:0 26px;}
        /* message */
        .ds-msg{padding:16px 26px 24px;}
        .ds-msg p{font-size:13.5px;font-weight:300;line-height:1.9;color:rgba(28,28,30,.65);}
        .ds-msg-am{font-family:'Noto Serif Ethiopic',serif;font-size:12.5px;color:rgba(26,107,60,.5);line-height:1.9;margin-top:12px;padding-top:12px;border-top:1px solid rgba(28,28,30,.08);}
        /* details */
        .ds-dets{}
        .ds-det{display:flex;align-items:flex-start;padding:14px 26px;border-bottom:1px solid rgba(28,28,30,.07);}
        .ds-det:last-child{border-bottom:none;}
        .ds-det-ic{width:32px;flex-shrink:0;font-size:16px;margin-top:1px;}
        .ds-det-bd{}
        .ds-det-k{font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(28,28,30,.32);margin-bottom:3px;}
        .ds-det-v{font-family:'Instrument Serif',serif;font-size:15px;color:${CHAR};line-height:1.4;}
        /* programme */
        .ds-prog{padding:0 26px 24px;}
        .ds-pi{display:grid;grid-template-columns:66px 1fr;margin-bottom:2px;}
        .ds-pt{padding:12px 12px 12px 0;text-align:right;border-right:1px solid rgba(28,28,30,.1);}
        .ds-pt-main{font-family:'DM Sans',sans-serif;font-size:10.5px;font-weight:500;color:${ACCENT};}
        .ds-pt-am{font-family:'Noto Serif Ethiopic',serif;font-size:9px;color:rgba(28,28,30,.35);margin-top:2px;}
        .ds-pb{padding:12px 0 12px 14px;position:relative;}
        .ds-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:7px;height:7px;background:${GREEN};border-radius:50%;}
        .ds-pb-t{font-family:'Instrument Serif',serif;font-size:14px;font-style:italic;color:${CHAR};}
        .ds-pb-am{font-family:'Noto Serif Ethiopic',serif;font-size:11px;color:rgba(26,107,60,.5);margin-top:1px;}
        .ds-pb-d{font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:300;color:rgba(28,28,30,.42);margin-top:3px;}
        /* map */
        .ds-map{margin:0 26px 22px;height:162px;overflow:hidden;border:1px solid rgba(28,28,30,.12);border-radius:2px;}
        .ds-map iframe{width:100%;height:100%;border:none;}
        .ds-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 26px 24px;padding:12px;border:1.5px solid ${ACCENT};color:${ACCENT};font-family:'DM Sans',sans-serif;font-size:9.5px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;border-radius:2px;transition:all .2s;}
        .ds-mapbtn:hover{background:${ACCENT};color:#fff;}
        /* share */
        .ds-share{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 26px 24px;padding:12px;background:#25D366;color:#fff;font-family:'DM Sans',sans-serif;font-size:9.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;border:none;cursor:pointer;border-radius:2px;transition:opacity .2s;}
        .ds-share:hover{opacity:.9;}
        /* rsvp */
        .ds-rsvp{margin:0 26px 32px;padding:24px 22px;border:1px solid rgba(28,28,30,.12);background:#fff;border-radius:2px;}
        .ds-rsvp-t{font-family:'Instrument Serif',serif;font-size:1.5rem;font-style:italic;color:${CHAR};text-align:center;margin-bottom:4px;}
        .ds-rsvp-am{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:rgba(26,107,60,.45);text-align:center;margin-bottom:22px;}
        .ds-lbl{font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,28,30,.35);display:block;margin-bottom:6px;}
        .ds-field{width:100%;background:${CREAM};border:1px solid rgba(28,28,30,.15);color:${CHAR};padding:11px 13px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:300;outline:none;margin-bottom:14px;transition:border-color .15s;border-radius:2px;}
        .ds-field:focus{border-color:${GREEN};}
        .ds-field::placeholder{color:rgba(28,28,30,.25);}
        .ds-field option{background:${CREAM};}
        .ds-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .ds-ab{padding:10px 4px;border:1px solid rgba(28,28,30,.14);background:transparent;color:rgba(28,28,30,.4);font-family:'DM Sans',sans-serif;font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .15s;}
        .ds-ab.on{border-color:${GREEN};color:${GREEN};background:rgba(26,122,60,.06);}
        .ds-sub{width:100%;padding:13px;background:${CHAR};color:#fff;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;border:none;cursor:pointer;border-radius:2px;transition:opacity .2s;}
        .ds-sub:hover{opacity:.88;}
        .ds-sub:disabled{opacity:.38;cursor:not-allowed;}
        /* footer */
        .ds-foot{background:${CHAR};padding:22px 20px;text-align:center;}
        .ds-foot-nm{font-family:'Instrument Serif',serif;font-size:1rem;font-style:italic;color:rgba(255,255,255,.5);}
        .ds-foot-v{font-family:'DM Sans',sans-serif;font-size:8.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.22);margin-top:5px;}
        .ds-bot{height:4px;background:${GREEN};}
        /* controls */
        .ds-ctrl{position:fixed;top:13px;right:13px;display:flex;gap:8px;z-index:100;}
        .ds-btn{background:rgba(28,28,30,.88);border:1px solid rgba(26,122,60,.4);color:${GREEN};font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:.1em;padding:7px 10px;cursor:pointer;backdrop-filter:blur(5px);border-radius:2px;}

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(247,245,240,.85); }
          50%      { text-shadow: 0 2px 40px rgba(247,245,240,.85), 0 0 80px rgba(247,245,240,.35); }
        }
        .ds-nm-en { animation: name-glow 3.5s ease-in-out infinite; }
      `}</style>

      <div className={`ds ds-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        <div className="ds-ctrl">
          {data.audioUrl&&<button className="ds-btn" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}
          <button className="ds-btn" onClick={toggle}>{lang==="en"?"አማ":"EN"}</button>
        </div>

        <div className="ds-top"/>

        {/* Hero */}
        <div className="ds-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="ds-ov"/>
          {/* <div className="ds-pat" style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",position:"absolute";inset:0;pointer-events:"none";opacity:.035;background-image:linear-gradient(rgba(26,122,60,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,60,.6) 1px,transparent 1px);background-size:40px 40px;}}/> */}
          <div className="ds-vig" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 120px rgba(0,0,0,0.55)",pointerEvents:"none",zIndex:3}}/>
          <div className="ds-nm">
            <p className="ds-nm-en">{data.groomName} & {data.brideName}</p>
            {(data.groomNameAm||data.brideNameAm)&&(
              <p className="ds-nm-am">{data.groomNameAm??""} & {data.brideNameAm??""}</p>
            )}
            <p className="ds-tag">Save The Date · ቀንዎን ያስቀምጡ</p>
          </div>
        </div>

        {/* Countdown as stats */}
        <div className="ds-stats">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="ds-stat"><p className="ds-stat-n">{String(n).padStart(2,"0")}</p><p className="ds-stat-l">{l}</p></div>
          ))}
        </div>

        {/* Calendar */}
        <div className="ds-cal">
          <div className="ds-cal-head">
            <span className="ds-cal-month">{monthName}</span>
            <span className="ds-cal-yr">{year}</span>
          </div>
          <div className="ds-cal-dh">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=><div key={d} className="ds-cal-dhc">{d}</div>)}</div>
          <div className="ds-cal-days">
            {cells.map((day,i)=>(
              <div key={i} className={`ds-cal-day${day===weddingDay?" wed":""}`}>
                {day===weddingDay?(<svg viewBox="0 0 24 24" width="16" height="16" fill={GREEN} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>):day!==null?day:""}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="ds-content">
          <div className="ds-sh">
            <p className="ds-sh-label">Dear Families &amp; Friends</p>
            <p className="ds-sh-title">{lang==="am"&&data.greetingTitleAm?data.greetingTitleAm:data.greetingTitle}</p>
            {data.greetingTitleAm&&lang==="en"&&<p className="ds-sh-am">{data.greetingTitleAm}</p>}
          </div>
          <div className="ds-hr"/>
          <div className="ds-msg">
            <p>{lang==="am"&&data.messageBodyAm?data.messageBodyAm:data.messageBody}</p>
            {lang==="en"&&data.messageBodyAm&&<p className="ds-msg-am">{data.messageBodyAm}</p>}
          </div>
          <div className="ds-hr"/>

          {/* Details */}
          <div className="ds-dets">
            {[
              {icon:"📅",k:"Date",    v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})},
              {icon:"⏰",k:"Time",    v:`${data.timeEn}${data.timeAm?` · ${data.timeAm}`:""}`},
              {icon:"🏛️",k:"Venue",  v:data.venue},
              {icon:"📍",k:"Location",v:data.venueAddress},
            ].map(row=>(
              <div key={row.k} className="ds-det">
                <div className="ds-det-ic">{row.icon}</div>
                <div className="ds-det-bd"><p className="ds-det-k">{row.k}</p><p className="ds-det-v">{row.v}</p></div>
              </div>
            ))}
          </div>
          <div className="ds-hr" style={{margin:"8px 26px 0"}}/>

          {/* Programme */}
          <div className="ds-sh" style={{paddingBottom:14}}>
            <p className="ds-sh-label">Programme of Events</p>
            <p className="ds-sh-title" style={{fontStyle:"italic"}}>Order of the Day</p>
            <p className="ds-sh-am">የዕለቱ ፕሮግራም</p>
          </div>
          <div className="ds-prog">
            {prog.map(item=>(
              <div key={item.time} className="ds-pi">
                <div className="ds-pt">
                  <p className="ds-pt-main">{item.time}</p>
                  {item.timeAm&&<p className="ds-pt-am">{item.timeAm}</p>}
                </div>
                <div className="ds-pb">
                  <div className="ds-pdot"/>
                  <p className="ds-pb-t">{lang==="am"&&item.titleAm?item.titleAm:item.title}</p>
                  {lang==="en"&&item.titleAm&&<p className="ds-pb-am">{item.titleAm}</p>}
                  <p className="ds-pb-d">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="ds-hr" style={{margin:"0 26px 24px"}}/>

          {/* Map */}
          <div className="ds-sh" style={{paddingTop:0,paddingBottom:14}}>
            <p className="ds-sh-label">Venue Location</p>
          </div>
          {data.venueMapUrl?(<div className="ds-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>):(<div className="ds-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(28,28,30,.2)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><p style={{fontSize:"9px",color:"rgba(28,28,30,.25)"}}>Provide venueMapUrl to embed map</p></div>)}
          {data.venueMapLink&&(<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="ds-mapbtn"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>)}

          {/* WhatsApp share */}
          <button className="ds-share" onClick={shareOnWhatsApp}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Share on WhatsApp
          </button>

          {/* RSVP */}
          <div className="ds-rsvp">
            {rsvp.submitted?(<div style={{textAlign:"center",padding:"18px 0"}}><p style={{fontFamily:"'Instrument Serif',serif",fontSize:"1.3rem",fontStyle:"italic",color:CHAR,marginBottom:6}}>Thank You!</p><p style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:"12px",color:"rgba(26,107,60,.5)"}}>አስቀድሞ እናመሰግናለን!</p></div>):(
              <>
                <p className="ds-rsvp-t">RSVP</p>
                <p className="ds-rsvp-am">ምዝገባ · Confirm Your Attendance</p>
                <label className="ds-lbl">Full Name · ሙሉ ስም *</label>
                <input className="ds-field" placeholder="e.g. Hana Girma" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
                <label className="ds-lbl">Phone · ስልክ ቁጥር *</label>
                <input className="ds-field" type="tel" placeholder="+1 (555) 000 0000" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
                <label className="ds-lbl">Attendance</label>
                <div className="ds-att">{(["yes","no","maybe"] as const).map(v=>(<button key={v} onClick={()=>rsvp.update("attending",v)} className={`ds-ab${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}</button>))}</div>
                <label className="ds-lbl">Number of Guests</label>
                <select className="ds-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
                <label className="ds-lbl">Message to the Couple · ለሙሽሮቹ</label>
                <textarea className="ds-field" rows={3} style={{resize:"none"}} placeholder="Share your blessing… ምርቃትዎን ያካፍሉ" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
                <button className="ds-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP · አረጋግጥ"}</button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="ds-foot">
          <p className="ds-foot-nm">{data.groomName} & {data.brideName}</p>
          <p className="ds-foot-v">{data.venue}</p>
        </div>
        <div className="ds-bot"/>
      </div>
    </>
  );
}