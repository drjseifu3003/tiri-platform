"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP, getHijriDate } from "@/lib/hooks";

// ─── RELIGION TEMPLATE: Muslim / Nikah ───────────────────────────────────────
// Visual identity: faith only — Bismillah, Hijri date, Islamic geometric border,
// Arabic calligraphy, deep green + Islamic gold. NO ethnic/cultural elements.

const DEFAULT_PROGRAM = [
  { time:"8:00 AM",  timeAr:"الفجر",   title:"Fajr Prayer",       titleAr:"صلاة الفجر",    desc:"Morning prayers together" },
  { time:"10:00 AM", timeAr:"الضحى",   title:"Nikah Ceremony",    titleAr:"عقد النكاح",    desc:"The sacred marriage contract" },
  { time:"12:00 PM", timeAr:"الظهر",   title:"Dua & Blessing",    titleAr:"الدعاء والبركة",desc:"Prayers for the newlyweds" },
  { time:"1:00 PM",  timeAr:"العصر",   title:"Wedding Feast",     titleAr:"وليمة العرس",   desc:"Celebratory meal with family" },
  { time:"4:00 PM",  timeAr:"المساء",  title:"Family Gathering",  titleAr:"التجمع العائلي",desc:"Music, nasheed & celebration" },
  { time:"7:00 PM",  timeAr:"العشاء",  title:"Isha & Closing Dua",titleAr:"العشاء والختام", desc:"Evening prayers & send-off" },
];

export default function MuslimTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog  = data.program ?? DEFAULT_PROGRAM;
  const hijri = getHijriDate(data.date);
  const gc    = new Date(data.date);

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Kufi+Arabic:wght@300;400;600&display=swap');
        .ms{background:#0B1F14;color:#F8F2E3;font-family:'Playfair Display',Georgia,serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .ms *{box-sizing:border-box;}
        .ms-in{opacity:0;transform:translateY(12px);transition:opacity .6s ease,transform .6s ease;}
        .ms-in.go{opacity:1;transform:none;}
        /* Islamic geometric top band */
        .ms-geo{height:52px;background:#162E1E;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
        .ms-geo::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(90deg,transparent 0,transparent 22px,rgba(212,175,55,.32) 22px,rgba(212,175,55,.32) 24px),repeating-linear-gradient(0deg,transparent 0,transparent 22px,rgba(212,175,55,.12) 22px,rgba(212,175,55,.12) 24px);}
        /* Bismillah */
        .ms-bism{background:#162E1E;padding:22px 26px 18px;text-align:center;border-bottom:1px solid rgba(212,175,55,.18);}
        .ms-bism-ar{font-family:'Amiri',serif;font-size:2.3rem;color:#D4AF37;direction:rtl;line-height:1.5;}
        .ms-bism-en{font-family:'Noto Kufi Arabic',sans-serif;font-size:10px;font-style:italic;color:rgba(248,242,227,.38);margin-top:5px;letter-spacing:.04em;}
        /* hero */
        .ms-hero{position:relative;height:92vh;min-height:415px;}
        .ms-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .ms-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,31,20,.85) 0%,rgba(11,31,20,.22) 32%,rgba(11,31,20,.15) 52%,rgba(11,31,20,.65) 75%,#0B1F14 100%);z-index:1;}
        .ms-vig{position:absolute;inset:0;box-shadow:inset 0 0 120px rgba(0,0,0,.55);pointer-events:none;z-index:3;}
        .ms-pat{position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:repeating-linear-gradient(45deg,rgba(212,175,55,1) 0,rgba(212,175,55,1) 1px,transparent 0,transparent 50%);background-size:28px 28px;z-index:2;}
        .ms-grain{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;}
        .ms-frame{position:absolute;inset:12px;border:1px solid rgba(212,175,55,.3);pointer-events:none;}
        .ms-frame::before{content:'';position:absolute;top:-1px;left:-1px;width:30px;height:30px;border-top:2.5px solid #D4AF37;border-left:2.5px solid #D4AF37;opacity:.7;}
        .ms-frame::after{content:'';position:absolute;bottom:-1px;right:-1px;width:30px;height:30px;border-bottom:2.5px solid #D4AF37;border-right:2.5px solid #D4AF37;opacity:.7;}
        .ms-nm{position:absolute;bottom:26px;left:0;right:0;text-align:center;z-index:2;padding:0 20px;}
        .ms-nm-ar{font-family:'Amiri',serif;font-size:clamp(1.8rem,8vw,2.8rem);font-style:italic;color:#EDD87A;direction:rtl;line-height:1.2;}
        .ms-and{font-family:'Amiri',serif;font-size:1.3rem;color:rgba(212,175,55,.7);margin:2px 0;}
        .ms-tag{font-family:'Noto Kufi Arabic',sans-serif;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(212,175,55,.5);margin-top:8px;}
        /* triple date */
        .ms-triple{display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;background:rgba(0,0,0,.28);border-top:1px solid rgba(212,175,55,.16);border-bottom:1px solid rgba(212,175,55,.16);}
        .ms-dc{text-align:center;padding:18px 8px;}
        .ms-vs{background:rgba(212,175,55,.18);margin:14px 0;}
        .ms-dc-lbl{font-family:'Noto Kufi Arabic',sans-serif;font-size:7.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(212,175,55,.6);margin-bottom:5px;}
        .ms-dc-big{font-family:'Amiri',serif;font-size:2.2rem;font-weight:700;color:#EDD87A;line-height:1;}
        .ms-dc-sub{font-family:'Playfair Display',serif;font-size:10px;color:rgba(248,242,227,.5);margin-top:3px;}
        .ms-dc-ar{font-family:'Amiri',serif;font-size:11px;color:rgba(212,175,55,.55);direction:rtl;margin-top:2px;}
        /* countdown */
        .ms-cd{display:grid;grid-template-columns:repeat(4,1fr);}
        .ms-cdc{text-align:center;padding:17px 4px;background:rgba(0,0,0,.38);border-right:1px solid rgba(212,175,55,.08);}
        .ms-cdc:last-child{border-right:none;}
        .ms-cdn{font-family:'Amiri',serif;font-size:2.3rem;font-weight:700;color:#D4AF37;line-height:1;}
        .ms-cdl{font-family:'Noto Kufi Arabic',sans-serif;font-size:7px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.27);margin-top:5px;}
        /* divider */
        .ms-div{display:flex;align-items:center;gap:10px;padding:0 24px;margin:22px 0;}
        .ms-dl{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,.45),transparent);}
        /* section */
        .ms-sh{text-align:center;padding:0 24px 15px;}
        .ms-sh-ar{font-family:'Amiri',serif;font-size:1.45rem;color:rgba(212,175,55,.78);direction:rtl;margin-bottom:4px;}
        .ms-sh-en{font-family:'Noto Kufi Arabic',sans-serif;font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:rgba(212,175,55,.45);}
        /* message */
        .ms-msg{padding:0 26px 24px;text-align:center;}
        .ms-msg p{font-size:14px;line-height:1.9;color:rgba(248,242,227,.7);}
        /* details */
        .ms-dets{background:rgba(0,0,0,.2);}
        .ms-det{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid rgba(212,175,55,.08);}
        .ms-det:last-child{border-bottom:none;}
        .ms-det-ic{display:flex;align-items:center;justify-content:center;padding:15px 0;border-right:1px solid rgba(212,175,55,.08);}
        .ms-det-bd{padding:13px 15px;}
        .ms-det-k{font-family:'Noto Kufi Arabic',sans-serif;font-size:7.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(212,175,55,.65);margin-bottom:3px;}
        .ms-det-v{font-family:'Playfair Display',serif;font-size:13.5px;color:#F8F2E3;line-height:1.4;}
        .ms-det-ar{font-family:'Amiri',serif;font-size:12px;color:rgba(212,175,55,.5);direction:rtl;margin-top:2px;}
        /* programme */
        .ms-prog{padding:0 22px 24px;}
        .ms-pi{display:flex;gap:0;margin-bottom:2px;}
        .ms-pt{width:72px;flex-shrink:0;text-align:right;padding:12px 11px 12px 0;border-right:1.5px solid rgba(212,175,55,.18);}
        .ms-pt-ar{font-family:'Amiri',serif;font-size:13px;color:#D4AF37;direction:rtl;}
        .ms-pt-en{font-size:9.5px;color:rgba(255,255,255,.3);margin-top:2px;}
        .ms-pb{padding:12px 0 12px 15px;position:relative;}
        .ms-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:9px;height:9px;background:#D4AF37;border-radius:50%;}
        .ms-pb-t{font-family:'Playfair Display',serif;font-size:13px;font-weight:600;color:#F8F2E3;}
        .ms-pb-ar{font-family:'Amiri',serif;font-size:13px;color:rgba(212,175,55,.65);direction:rtl;margin-top:1px;}
        .ms-pb-d{font-size:11.5px;color:rgba(248,242,227,.4);margin-top:3px;}
        /* map */
        .ms-map{margin:0 22px 22px;height:164px;overflow:hidden;border:1px solid rgba(212,175,55,.2);}
        .ms-map iframe{width:100%;height:100%;border:none;filter:sepia(25%) saturate(.9) hue-rotate(90deg);}
        .ms-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 22px 26px;padding:12px;border:1px solid rgba(212,175,55,.3);color:#D4AF37;font-family:'Noto Kufi Arabic',sans-serif;font-size:9.5px;letter-spacing:.16em;text-decoration:none;transition:background .2s;}
        .ms-mapbtn:hover{background:rgba(212,175,55,.06);}
        /* rsvp */
        .ms-rsvp{margin:0 22px 32px;padding:26px 22px;border:1px solid rgba(212,175,55,.2);background:rgba(0,0,0,.2);}
        .ms-rt-ar{font-family:'Amiri',serif;font-size:1.45rem;color:#D4AF37;text-align:center;direction:rtl;margin-bottom:3px;}
        .ms-rt-en{font-family:'Noto Kufi Arabic',sans-serif;font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;color:rgba(212,175,55,.5);text-align:center;margin-bottom:22px;}
        .ms-lbl{font-family:'Noto Kufi Arabic',sans-serif;font-size:7.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(248,242,227,.4);display:block;margin-bottom:6px;}
        .ms-field{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.18);color:#F8F2E3;padding:11px 13px;font-family:'Playfair Display',serif;font-size:14px;outline:none;margin-bottom:14px;transition:border-color .15s;}
        .ms-field:focus{border-color:#D4AF37;}
        .ms-field::placeholder{color:rgba(248,242,227,.17);}
        .ms-field option{background:#0B1F14;}
        .ms-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .ms-ab{padding:10px 4px;border:1px solid rgba(212,175,55,.18);background:transparent;color:rgba(248,242,227,.4);font-family:'Noto Kufi Arabic',sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .15s;}
        .ms-ab.on{border-color:#D4AF37;color:#D4AF37;background:rgba(212,175,55,.06);}
        .ms-sub{width:100%;padding:13px;background:#D4AF37;color:#0B1F14;font-family:'Noto Kufi Arabic',sans-serif;font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity .2s;}
        .ms-sub:hover{opacity:.9;}
        .ms-sub:disabled{opacity:.42;cursor:not-allowed;}
        /* footer */
        .ms-foot{background:#162E1E;border-top:1px solid rgba(212,175,55,.18);padding:22px 20px;text-align:center;}
        .ms-foot-sal{font-family:'Amiri',serif;font-size:1.5rem;color:rgba(212,175,55,.58);direction:rtl;margin-bottom:8px;}
        .ms-foot-nm{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:rgba(248,242,227,.45);}
        .ms-foot-v{font-family:'Noto Kufi Arabic',sans-serif;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(248,242,227,.24);margin-top:5px;}
        .ms-geo-bot{height:10px;background:repeating-linear-gradient(90deg,rgba(212,175,55,.45) 0,rgba(212,175,55,.45) 1px,transparent 1px,transparent 12px);}
        /* audio */
        .ms-audio{position:fixed;bottom:22px;right:16px;z-index:100;width:42px;height:42px;border-radius:50%;background:#D4AF37;border:none;color:#0B1F14;font-size:17px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.4);}

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(237,216,122,.8); }
          50%      { text-shadow: 0 2px 40px rgba(237,216,122,.8), 0 0 80px rgba(237,216,122,.8); }
        }
        .ms-nm-ar { animation: name-glow 3.5s ease-in-out infinite; }
      `}</style>

      <div className={`ms ms-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        {data.audioUrl&&<button className="ms-audio" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}

        {/* Islamic geometric top */}
        <div className="ms-geo">
          <svg viewBox="0 0 32 32" width="24" height="24" opacity=".55">
            <polygon points="16,2 19,11 28,11 21,17 24,26 16,20 8,26 11,17 4,11 13,11" fill="#D4AF37"/>
            <polygon points="16,6 18.5,13 26,13 20,17.5 22.5,25 16,21 9.5,25 12,17.5 6,13 13.5,13" fill="#D4AF37" opacity=".5" transform="rotate(22.5 16 16)"/>
          </svg>
        </div>

        {/* Bismillah */}
        <div className="ms-bism">
          <p className="ms-bism-ar">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
          <p className="ms-bism-en">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>

        {/* Hero */}
        <div className="ms-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="ms-ov"/>
          {/* <div className="ms-pat" style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:repeating-linear-gradient(45deg,rgba(212,175,55,1) 0,rgba(212,175,55,1) 1px,transparent 0,transparent 50%);background-size:28px 28px;}}/> */}
          <div className="ms-vig" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 120px rgba(0,0,0,0.55)",pointerEvents:"none",zIndex:3}}/>
          <div className="ms-frame"/>
          <div className="ms-nm">
            <p className="ms-nm-ar">{data.groomNameAr??data.groomName}</p>
            <p className="ms-and">و</p>
            <p className="ms-nm-ar">{data.brideNameAr??data.brideName}</p>
            <p className="ms-tag">Nikah Ceremony · حفل النكاح</p>
          </div>
        </div>

        {/* Triple date: GC / Day num / Hijri */}
        <div className="ms-triple">
          <div className="ms-dc">
            <p className="ms-dc-lbl">Gregorian</p>
            <p className="ms-dc-big" style={{fontSize:"1.5rem"}}>{gc.toLocaleString("en-US",{month:"short"}).toUpperCase()}</p>
            <p className="ms-dc-sub">{gc.getFullYear()}</p>
          </div>
          <div className="ms-vs"/>
          <div className="ms-dc">
            <p className="ms-dc-lbl">Day</p>
            <p className="ms-dc-big">{gc.getDate()}</p>
            <p className="ms-dc-sub">{gc.toLocaleString("en-US",{weekday:"short"}).toUpperCase()}</p>
          </div>
          <div className="ms-vs"/>
          <div className="ms-dc">
            <p className="ms-dc-lbl">Hijri</p>
            <p className="ms-dc-ar" style={{fontSize:"1rem"}}>{hijri.monthAr}</p>
            <p className="ms-dc-ar" style={{fontSize:"11px",opacity:.55}}>{hijri.day} – {hijri.year} هـ</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="ms-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="ms-cdc">
              <p className="ms-cdn">{String(n).padStart(2,"0")}</p>
              <p className="ms-cdl">{l}</p>
            </div>
          ))}
        </div>

        {/* 8-pointed star divider */}
        <div className="ms-div">
          <div className="ms-dl"/>
          <svg viewBox="0 0 28 28" width="22" height="22">
            <polygon points="14,2 16.5,9.5 24,9.5 18,14 20.5,21.5 14,17 7.5,21.5 10,14 4,9.5 11.5,9.5" fill="#D4AF37" opacity=".55"/>
            <polygon points="14,5 16,11 22,11 17,14.5 19,21 14,17.5 9,21 11,14.5 6,11 12,11" fill="#D4AF37" opacity=".4" transform="rotate(22.5 14 14)"/>
          </svg>
          <div className="ms-dl"/>
        </div>

        {/* Greeting */}
        <div className="ms-sh">
          {data.scripture&&<p style={{fontFamily:"'Amiri',serif",fontSize:"1.3rem",color:"rgba(212,175,55,.72)",direction:"rtl",marginBottom:10}}>{data.scripture}</p>}
          {data.scriptureRef&&<p style={{fontFamily:"'Noto Kufi Arabic',sans-serif",fontSize:"9px",letterSpacing:".12em",color:"rgba(248,242,227,.35)",marginBottom:14}}>{data.scriptureRef}</p>}
          <p className="ms-sh-ar">حفل الزفاف</p>
          <p className="ms-sh-en">Wedding Celebration</p>
        </div>
        <div className="ms-msg"><p>{data.messageBody}</p></div>

        {/* Event details */}
        <div className="ms-div" style={{margin:"4px 0 16px"}}>
          <div className="ms-dl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="#D4AF37" opacity=".5"><path d="M10 2l2.2 5.5H18l-4.5 3.3 1.8 5.5L10 13.5 4.7 16.3l1.8-5.5L2 7.5h5.8Z"/></svg>
          <div className="ms-dl"/>
        </div>
        <div className="ms-sh" style={{paddingBottom:12}}>
          <p className="ms-sh-ar">تفاصيل الحفل</p>
          <p className="ms-sh-en">Event Details</p>
        </div>
        <div className="ms-dets">
          {[
            {icon:"📅",k:"Date · التاريخ",      v:gc.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}), ar:`${hijri.day} ${hijri.monthAr} ${hijri.year} هـ`},
            {icon:"🕌",k:"Time · الوقت",        v:data.timeEn, ar:data.timeAr??data.timeAm??""},
            {icon:"🏛️",k:"Venue · المكان",      v:data.venue,  ar:""},
            {icon:"📍",k:"Location · الموقع",   v:data.venueAddress, ar:""},
          ].map(row=>(
            <div key={row.k} className="ms-det">
              <div className="ms-det-ic"><span style={{fontSize:16}}>{row.icon}</span></div>
              <div className="ms-det-bd">
                <p className="ms-det-k">{row.k}</p>
                <p className="ms-det-v">{row.v}</p>
                {row.ar&&<p className="ms-det-ar">{row.ar}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="ms-div" style={{margin:"22px 0 16px"}}>
          <div className="ms-dl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="#D4AF37" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg>
          <div className="ms-dl"/>
        </div>
        <div className="ms-sh" style={{paddingBottom:14}}>
          <p className="ms-sh-ar">برنامج اليوم</p>
          <p className="ms-sh-en">Order of Programme</p>
        </div>
        <div className="ms-prog">
          {prog.map(item=>(
            <div key={item.time} className="ms-pi">
              <div className="ms-pt">
                <p className="ms-pt-ar">{item.timeAr??item.time}</p>
                <p className="ms-pt-en">{item.time}</p>
              </div>
              <div className="ms-pb">
                <div className="ms-pdot"/>
                <p className="ms-pb-t">{item.title}</p>
                {item.titleAr&&<p className="ms-pb-ar">{item.titleAr}</p>}
                <p className="ms-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="ms-div" style={{margin:"8px 0 16px"}}>
          <div className="ms-dl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="#D4AF37" opacity=".5"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.17 5 11 5 11s5-6.83 5-11c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 5.5 10 5.5 11.5 6.17 11.5 7 10.83 8.5 10 8.5z"/></svg>
          <div className="ms-dl"/>
        </div>
        <div className="ms-sh" style={{paddingBottom:13}}><p className="ms-sh-en">Venue Location · موقع الحفل</p></div>
        {data.venueMapUrl?(
          <div className="ms-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>
        ):(
          <div className="ms-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="rgba(212,175,55,.3)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{fontFamily:"'Noto Kufi Arabic',sans-serif",fontSize:"9px",letterSpacing:".12em",color:"rgba(212,175,55,.3)"}}>Provide venueMapUrl to embed map</p>
          </div>
        )}
        {data.venueMapLink&&(
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="ms-mapbtn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Open in Maps · افتح في خرائط
          </a>
        )}

        {/* RSVP */}
        <div className="ms-rsvp">
          {rsvp.submitted?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <p style={{fontFamily:"'Amiri',serif",fontSize:"1.5rem",color:"#D4AF37",direction:"rtl",marginBottom:7}}>جزاكم الله خيراً</p>
              <p style={{fontFamily:"'Noto Kufi Arabic',sans-serif",fontSize:"8.5px",letterSpacing:".16em",textTransform:"uppercase",color:"rgba(248,242,227,.42)"}}>Your RSVP has been received</p>
            </div>
          ):(
            <>
              <p className="ms-rt-ar">تأكيد الحضور</p>
              <p className="ms-rt-en">Confirm Your Attendance</p>
              <label className="ms-lbl">Full Name · الاسم الكامل *</label>
              <input className="ms-field" placeholder="e.g. Fatima Ibrahim" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="ms-lbl">Phone · رقم الهاتف *</label>
              <input className="ms-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="ms-lbl">Attendance · الحضور</label>
              <div className="ms-att">
                {(["yes","no","maybe"] as const).map(v=>(
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`ms-ab${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}
                  </button>
                ))}
              </div>
              <label className="ms-lbl">Guests · عدد الحضور</label>
              <select className="ms-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="ms-lbl">Message to the Couple · رسالة للعروسين</label>
              <textarea className="ms-field" rows={3} style={{resize:"none"}} placeholder="Share your blessing or prayer…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="ms-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Sending…":"Confirm RSVP · تأكيد"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="ms-foot">
          <p className="ms-foot-sal">السَّلَامُ عَلَيْكُمْ</p>
          <p className="ms-foot-nm">{data.groomName} & {data.brideName}</p>
          <p className="ms-foot-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="ms-geo-bot"/>
      </div>
    </>
  );
}