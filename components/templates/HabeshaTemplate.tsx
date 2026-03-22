"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP, useLang, getCalendarDays, getEthiopianDate } from "@/lib/hooks";

// ─── CULTURE TEMPLATE: Habesha (Amhara / Tigrinya) ───────────────────────────
// Visual identity: culture only — tibeb woven border, terracotta + ochre palette,
// Noto Serif Ethiopic script, calendar grid with Ethiopian month,
// Meskel flower (adey abeba) dividers, warm earth aesthetic.
// NO religious symbols, NO cross, NO bismillah — religion-agnostic.

const DEFAULT_PROGRAM = [
  { time:"9:00 ጠዋት",  timeEn:"9:00 AM",  titleAm:"ሠርግ ሥነ-ስርዓት",    title:"Wedding Ceremony",    desc:"Exchange of vows & rings" },
  { time:"11:00 ጠዋት", timeEn:"11:00 AM", titleAm:"ፎቶ ግሮፒ",          title:"Photo Session",       desc:"Family & couple portraits" },
  { time:"12:00 ቀን",  timeEn:"12:00 PM", titleAm:"ግብዣ",              title:"Reception & Feast",   desc:"Traditional injera banquet" },
  { time:"2:00 ቀን",   timeEn:"2:00 PM",  titleAm:"ጉርሻ ሥነ-ስርዓት",     title:"Gursha Ceremony",     desc:"Unity feeding ritual" },
  { time:"3:30 ቀን",   timeEn:"3:30 PM",  titleAm:"እስኪስታ",            title:"Eskista Dance",       desc:"Traditional Ethiopian dance" },
  { time:"5:00 ቀን",   timeEn:"5:00 PM",  titleAm:"ንግግሮችና ቶስት",      title:"Speeches & Toasts",   desc:"Family tributes" },
  { time:"7:00 ቀን",   timeEn:"7:00 PM",  titleAm:"ሙዚቃና ደስታ",        title:"Music & Celebration", desc:"Evening celebration" },
];

export default function HasbeshaTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const { lang, toggle } = useLang();
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const eth  = getEthiopianDate(data.date);
  const { year, weddingDay, firstDay, daysInMonth, monthName } = getCalendarDays(data.date);
  const gc   = new Date(data.date);

  // Build calendar cells
  const cells: (number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Ethiopic:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
        .hb{background:#F4E8D0;color:#1E0E00;font-family:'DM Sans',sans-serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .hb *{box-sizing:border-box;}
        .hb-in{opacity:0;transition:opacity .65s ease;}
        .hb-in.go{opacity:1;}
        /* tibeb pattern top */
        .hb-tibeb{height:16px;background:#5A2B0C;position:relative;overflow:hidden;}
        .hb-tibeb::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(90deg,transparent 0,transparent 9px,rgba(212,137,26,.7) 9px,rgba(212,137,26,.7) 10px);}
        .hb-tibeb::after{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(90deg,transparent 0,transparent 4px,rgba(255,255,255,.12) 4px,rgba(255,255,255,.12) 5px);}
        /* tibeb accent stripe */
        .hb-tibeb2{height:5px;background:repeating-linear-gradient(90deg,#D4891A 0,#D4891A 8px,#5A2B0C 8px,#5A2B0C 16px);}
        /* hero */
        .hb-hero{position:relative;height:92vh;min-height:400px;}
        .hb-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .hb-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(90,43,12,.82) 0%,rgba(90,43,12,.2) 28%,rgba(90,43,12,.12) 50%,rgba(90,43,12,.62) 74%,#5A2B0C 100%);z-index:1;}
        .hb-vig{position:absolute;inset:0;box-shadow:inset 0 0 120px rgba(0,0,0,.55);pointer-events:none;z-index:3;}
        .hb-pat{position:absolute;inset:0;pointer-events:none;opacity:.055;background-image:repeating-linear-gradient(60deg,rgba(212,137,26,1) 0px,rgba(212,137,26,1) 2px,transparent 2px,transparent 20px);z-index:2;}
        .hb-grain{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;}
        /* warm names band */
        .hb-band{background:#5A2B0C;padding:26px 22px 20px;text-align:center;}
        .hb-nm-am{font-family:'Noto Serif Ethiopic',serif;font-size:clamp(1.65rem,7.5vw,2.6rem);font-weight:500;color:#E8A020;line-height:1.25;}
        .hb-nm-en{font-family:'Playfair Display',serif;font-size:clamp(1rem,4vw,1.5rem);font-style:italic;color:rgba(244,232,208,.65);margin-top:4px;}
        .hb-save{font-family:'DM Sans',sans-serif;font-size:9px;font-weight:500;letter-spacing:.28em;text-transform:uppercase;color:rgba(244,232,208,.42);margin-top:8px;}
        /* calendar */
        .hb-cal{background:#5A2B0C;padding:0 20px 24px;}
        .hb-cal-head{text-align:center;padding-bottom:14px;}
        .hb-cal-gc{font-family:'Playfair Display',serif;font-size:1.85rem;font-weight:700;color:#fff;letter-spacing:.04em;}
        .hb-cal-yr{font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(255,255,255,.38);margin-left:8px;}
        .hb-cal-eth{font-family:'Noto Serif Ethiopic',serif;font-size:12.5px;color:rgba(232,160,32,.65);margin-top:3px;}
        .hb-cal-dh{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px;}
        .hb-cal-dhc{text-align:center;font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.1em;color:rgba(255,255,255,.3);padding:3px 0;}
        .hb-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
        .hb-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,.62);border-radius:50%;}
        .hb-cal-day.wed{background:rgba(255,255,255,.12);border:2px solid #D4891A;}
        /* countdown */
        .hb-cd{display:grid;grid-template-columns:repeat(4,1fr);background:#F4E8D0;border-bottom:1px solid rgba(90,43,12,.12);}
        .hb-cdc{text-align:center;padding:17px 4px;border-right:1px solid rgba(90,43,12,.1);}
        .hb-cdc:last-child{border-right:none;}
        .hb-cdn{font-family:'Playfair Display',serif;font-size:2.1rem;font-weight:700;color:#5A2B0C;line-height:1;}
        .hb-cdl{font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:rgba(90,43,12,.38);margin-top:5px;}
        /* rule */
        .hb-rule{display:flex;align-items:center;gap:10px;padding:0 22px;margin:24px 0;}
        .hb-rl{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(90,43,12,.3),transparent);}
        /* meskel flower svg */
        /* section */
        .hb-sh{text-align:center;padding:0 24px 14px;}
        .hb-sh-eye{font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.25em;text-transform:uppercase;color:rgba(90,43,12,.45);margin-bottom:7px;}
        .hb-sh-am{font-family:'Noto Serif Ethiopic',serif;font-size:1.1rem;font-weight:500;color:#7A3510;margin-bottom:3px;}
        .hb-sh-en{font-family:'Playfair Display',serif;font-size:1.35rem;color:#1E0E00;}
        /* message */
        .hb-msg{padding:0 26px 24px;text-align:center;}
        .hb-msg p{font-size:13.5px;font-weight:300;line-height:1.9;color:rgba(30,14,0,.65);}
        .hb-msg-am{font-family:'Noto Serif Ethiopic',serif;font-size:12.5px;color:rgba(90,43,12,.45);line-height:1.9;margin-top:12px;padding-top:12px;border-top:1px solid rgba(90,43,12,.1);}
        /* details */
        .hb-dets{background:rgba(90,43,12,.05);}
        .hb-det{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid rgba(90,43,12,.08);}
        .hb-det:last-child{border-bottom:none;}
        .hb-det-ic{display:flex;align-items:center;justify-content:center;padding:15px 0;border-right:1px solid rgba(90,43,12,.08);}
        .hb-det-bd{padding:13px 15px;}
        .hb-det-k{font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(90,43,12,.42);margin-bottom:3px;}
        .hb-det-v{font-family:'Playfair Display',serif;font-size:14px;color:#1E0E00;line-height:1.4;}
        .hb-det-am{font-family:'Noto Serif Ethiopic',serif;font-size:11px;color:rgba(90,43,12,.42);margin-top:2px;}
        /* programme */
        .hb-prog{padding:0 20px 24px;}
        .hb-pi{display:grid;grid-template-columns:72px 1fr;margin-bottom:2px;}
        .hb-pt{padding:12px 11px 12px 0;text-align:right;border-right:2px solid rgba(90,43,12,.15);}
        .hb-pt-am{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:#7A3510;}
        .hb-pt-en{font-family:'DM Sans',sans-serif;font-size:9.5px;color:rgba(30,14,0,.38);margin-top:2px;}
        .hb-pb{padding:12px 0 12px 14px;position:relative;}
        .hb-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:#D4891A;border-radius:50%;}
        .hb-pb-am{font-family:'Noto Serif Ethiopic',serif;font-size:13px;font-weight:500;color:#1E0E00;}
        .hb-pb-en{font-family:'Playfair Display',serif;font-size:12.5px;color:#7A3510;margin-top:1px;}
        .hb-pb-d{font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:300;color:rgba(30,14,0,.45);margin-top:3px;}
        /* map */
        .hb-map{margin:0 20px 20px;height:162px;overflow:hidden;border:1px solid rgba(90,43,12,.18);}
        .hb-map iframe{width:100%;height:100%;border:none;filter:sepia(12%) saturate(.9);}
        .hb-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 20px 24px;padding:12px;border:1.5px solid #7A3510;color:#7A3510;font-family:'DM Sans',sans-serif;font-size:9.5px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;transition:all .2s;}
        .hb-mapbtn:hover{background:#7A3510;color:#F4E8D0;}
        /* rsvp */
        .hb-rsvp{margin:0 20px 32px;padding:24px 20px;border:1.5px solid rgba(90,43,12,.2);background:#fff;}
        .hb-rsvp-t{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:600;color:#1E0E00;text-align:center;margin-bottom:4px;}
        .hb-rsvp-am{font-family:'Noto Serif Ethiopic',serif;font-size:12px;color:rgba(90,43,12,.42);text-align:center;margin-bottom:22px;}
        .hb-lbl{font-family:'DM Sans',sans-serif;font-size:8px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(90,43,12,.42);display:block;margin-bottom:6px;}
        .hb-field{width:100%;background:#F4E8D0;border:1px solid rgba(90,43,12,.18);color:#1E0E00;padding:11px 13px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:300;outline:none;margin-bottom:14px;transition:border-color .15s;border-radius:2px;}
        .hb-field:focus{border-color:#7A3510;}
        .hb-field::placeholder{color:rgba(90,43,12,.22);}
        .hb-field option{background:#F4E8D0;}
        .hb-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .hb-ab{padding:10px 4px;border:1px solid rgba(90,43,12,.18);background:transparent;color:rgba(90,43,12,.4);font-family:'DM Sans',sans-serif;font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .15s;}
        .hb-ab.on{border-color:#7A3510;color:#7A3510;background:rgba(90,43,12,.06);}
        .hb-sub{width:100%;padding:13px;background:#5A2B0C;color:#F4E8D0;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;border:none;cursor:pointer;border-radius:2px;transition:opacity .2s;}
        .hb-sub:hover{opacity:.9;}
        .hb-sub:disabled{opacity:.42;cursor:not-allowed;}
        /* footer */
        .hb-foot{background:#5A2B0C;padding:22px 20px;text-align:center;}
        .hb-foot-am{font-family:'Noto Serif Ethiopic',serif;font-size:1rem;color:rgba(232,160,32,.72);margin-bottom:4px;}
        .hb-foot-en{font-family:'Playfair Display',serif;font-size:13px;font-style:italic;color:rgba(244,232,208,.45);}
        .hb-foot-v{font-family:'DM Sans',sans-serif;font-size:8.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,232,208,.25);margin-top:5px;}
        /* controls */
        .hb-ctrl{position:fixed;top:13px;right:13px;display:flex;gap:8px;z-index:100;}
        .hb-btn{background:rgba(90,43,12,.9);border:1px solid rgba(212,137,26,.4);color:#D4891A;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:.1em;padding:7px 10px;cursor:pointer;backdrop-filter:blur(5px);}

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(232,160,32,.85); }
          50%      { text-shadow: 0 2px 40px rgba(232,160,32,.85), 0 0 80px rgba(232,160,32,.35); }
        }
        .hb-nm-am { animation: name-glow 3.5s ease-in-out infinite; }
      `}</style>

      <div className={`hb hb-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        <div className="hb-ctrl">
          {data.audioUrl&&<button className="hb-btn" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}
          <button className="hb-btn" onClick={toggle}>{lang==="en"?"አማ":"EN"}</button>
        </div>

        {/* Tibeb top */}
        <div className="hb-tibeb"/><div className="hb-tibeb2"/>

        {/* Hero */}
        <div className="hb-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="hb-ov"/>
          {/* <div className="hb-pat" style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",position:absolute;inset:0;pointer-events:none;opacity:.055;background-image:repeating-linear-gradient(60deg,rgba(212,137,26,1) 0px,rgba(212,137,26,1) 2px,transparent 2px,transparent 20px);}}/> */}
          <div className="hb-vig" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 120px rgba(0,0,0,0.55)",pointerEvents:"none",zIndex:3}}/>
        </div>

        {/* Warm names band */}
        <div className="hb-band">
          <p className="hb-nm-am">{lang==="am"&&data.groomNameAm?`${data.groomNameAm} & ${data.brideNameAm}`:`${data.groomNameAm??data.groomName} & ${data.brideNameAm??data.brideName}`}</p>
          <p className="hb-nm-en">{data.groomName} & {data.brideName}</p>
          <p className="hb-save">ቀንዎን ያስቀምጡ · Save the Date</p>
        </div>

        {/* Calendar grid */}
        <div className="hb-cal">
          <div className="hb-cal-head">
            <div><span className="hb-cal-gc">{monthName}</span><span className="hb-cal-yr">{year}</span></div>
            <p className="hb-cal-eth">{eth.day} {eth.monthAm} {eth.year} ዓ.ም</p>
          </div>
          <div className="hb-cal-dh">
            {["ፀ","ሰ","ማ","ሮ","ሐ","ዓ","ቅ"].map(d=><div key={d} className="hb-cal-dhc">{d}</div>)}
          </div>
          <div className="hb-cal-days">
            {cells.map((day,i)=>(
              <div key={i} className={`hb-cal-day${day===weddingDay?" wed":""}`}>
                {day===weddingDay?(
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="#D4891A" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                ):day!==null?day:""}
              </div>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="hb-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="hb-cdc">
              <p className="hb-cdn">{String(n).padStart(2,"0")}</p>
              <p className="hb-cdl">{l}</p>
            </div>
          ))}
        </div>

        {/* Meskel flower rule */}
        <div className="hb-rule" style={{marginTop:26}}>
          <div className="hb-rl"/>
          <svg viewBox="0 0 24 24" width="20" height="20">
            {[0,45,90,135].map(a=><ellipse key={a} cx="12" cy="8" rx="2.2" ry="4" fill="#D4891A" opacity=".6" transform={`rotate(${a} 12 12)`}/>)}
            <circle cx="12" cy="12" r="2.5" fill="#D4891A"/>
          </svg>
          <div className="hb-rl"/>
        </div>

        {/* Greeting */}
        <div className="hb-sh">
          <p className="hb-sh-eye">Dear Families &amp; Friends</p>
          <p className="hb-sh-am">{lang==="am"&&data.greetingTitleAm?data.greetingTitleAm:data.greetingTitleAm??""}</p>
          <p className="hb-sh-en">{lang==="am"&&data.greetingTitleAm?data.greetingTitle:data.greetingTitle}</p>
        </div>
        <div className="hb-msg">
          <p>{lang==="am"&&data.messageBodyAm?data.messageBodyAm:data.messageBody}</p>
          {lang==="en"&&data.messageBodyAm&&<p className="hb-msg-am">{data.messageBodyAm}</p>}
        </div>

        {/* Details */}
        <div className="hb-rule" style={{margin:"4px 0 16px"}}>
          <div className="hb-rl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="rgba(90,43,12,.5)" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg>
          <div className="hb-rl"/>
        </div>
        <div className="hb-sh" style={{paddingBottom:12}}>
          <p className="hb-sh-eye">Event Details · ዝርዝሮች</p>
        </div>
        <div className="hb-dets">
          {[
            {icon:"📅",k:"Date · ቀን",       v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}), am:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {icon:"⏰",k:"Time · ሰዓት",      v:data.timeEn, am:data.timeAm??""},
            {icon:"🏛️",k:"Venue · ቦታ",     v:data.venue,  am:""},
            {icon:"📍",k:"Location · አድራሻ", v:data.venueAddress, am:""},
          ].map(row=>(
            <div key={row.k} className="hb-det">
              <div className="hb-det-ic"><span style={{fontSize:17}}>{row.icon}</span></div>
              <div className="hb-det-bd">
                <p className="hb-det-k">{row.k}</p>
                <p className="hb-det-v">{row.v}</p>
                {row.am&&<p className="hb-det-am">{row.am}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="hb-rule" style={{margin:"22px 0 16px"}}>
          <div className="hb-rl"/>
          <svg viewBox="0 0 24 24" width="20" height="20">
            {[0,45,90,135].map(a=><ellipse key={a} cx="12" cy="8" rx="2" ry="3.5" fill="#7A3510" opacity=".55" transform={`rotate(${a} 12 12)`}/>)}
            <circle cx="12" cy="12" r="2" fill="#7A3510" opacity=".8"/>
          </svg>
          <div className="hb-rl"/>
        </div>
        <div className="hb-sh" style={{paddingBottom:14}}>
          <p className="hb-sh-am">የዕለቱ ፕሮግራም</p>
          <p className="hb-sh-eye" style={{marginTop:4}}>Programme of Events</p>
        </div>
        <div className="hb-prog">
          {prog.map(item=>(
            <div key={item.time} className="hb-pi">
              <div className="hb-pt">
                <p className="hb-pt-am">{item.time}</p>
                <p className="hb-pt-en">{item.timeEn??item.time}</p>
              </div>
              <div className="hb-pb">
                <div className="hb-pdot"/>
                <p className="hb-pb-am">{item.titleAm??item.title}</p>
                <p className="hb-pb-en">{item.title}</p>
                <p className="hb-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="hb-rule" style={{margin:"8px 0 16px"}}>
          <div className="hb-rl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="#7A3510" opacity=".55"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.17 5 11 5 11s5-6.83 5-11c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 5.5 10 5.5 11.5 6.17 11.5 7 10.83 8.5 10 8.5z"/></svg>
          <div className="hb-rl"/>
        </div>
        <div className="hb-sh" style={{paddingBottom:13}}><p className="hb-sh-eye">Venue Map · ካርታ</p></div>
        {data.venueMapUrl?(
          <div className="hb-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>
        ):(
          <div className="hb-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(90,43,12,.28)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",color:"rgba(90,43,12,.28)"}}>Provide venueMapUrl to embed map</p>
          </div>
        )}
        {data.venueMapLink&&(
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="hb-mapbtn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Open in Google Maps · ካርታ ክፈት
          </a>
        )}

        {/* RSVP */}
          <div className="hb-rsvp">
          {rsvp.submitted?(
            <div style={{textAlign:"center",padding:"18px 0"}}>
              <p style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:"1.05rem",color:"#5A2B0C",marginBottom:6}}>አስቀድሞ እናመሰግናለን!</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"8.5px",letterSpacing:".18em",textTransform:"uppercase",color:"rgba(90,43,12,.42)"}}>Your RSVP has been received</p>
            </div>
          ):(
            <>
              <p className="hb-rsvp-t">RSVP</p>
              <p className="hb-rsvp-am">ምዝገባ · Confirm Your Attendance</p>
              <label className="hb-lbl">Full Name · ሙሉ ስም *</label>
              <input className="hb-field" placeholder="e.g. Selam Asfaw" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="hb-lbl">Phone · ስልክ ቁጥር *</label>
              <input className="hb-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="hb-lbl">Attendance · ተገኝነት</label>
              <div className="hb-att">
                {(["yes","no","maybe"] as const).map(v=>(
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`hb-ab${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}
                  </button>
                ))}
              </div>
              <label className="hb-lbl">Number of Guests</label>
              <select className="hb-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="hb-lbl">Message to the Couple · ለሙሽሮቹ</label>
              <textarea className="hb-field" rows={3} style={{resize:"none"}} placeholder="ምርቃትዎን ያካፍሉ… Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="hb-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Sending…":"Confirm RSVP · አረጋግጥ"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="hb-foot">
          <p className="hb-foot-am">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="hb-foot-en">{data.groomName} & {data.brideName}</p>
          <p className="hb-foot-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="hb-tibeb2"/><div className="hb-tibeb"/>
      </div>
    </>
  );
}