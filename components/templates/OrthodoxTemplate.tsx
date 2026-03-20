"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP, useLang, getEthiopianDate } from "@/lib/hooks";
// ...existing code...

// ─── RELIGION TEMPLATE: Orthodox Tewahedo ────────────────────────────────────
// Visual identity: faith only — Ethiopian cross, wine + aged gold, Geez calendar,
// Teklil ceremony programme. NO ethnic/cultural elements.

const DEFAULT_PROGRAM = [
  { time:"8:00 AM",  timeAm:"2:00 ጠዋት",  title:"Divine Liturgy",      titleAm:"ቅዳሴ",       desc:"Holy mass at the church" },
  { time:"9:30 AM",  timeAm:"3:30 ጠዋት",  title:"Teklil Ceremony",     titleAm:"ተክሊል",      desc:"Sacred crowning of the couple" },
  { time:"11:00 AM", timeAm:"5:00 ጠዋት",  title:"Zefed — Procession",  titleAm:"ዘፈድ",       desc:"Wedding march & celebration walk" },
  { time:"1:00 PM",  timeAm:"7:00 ቀን",   title:"Reception & Feast",   titleAm:"ግብዣ",       desc:"Welcome meal with family" },
  { time:"3:00 PM",  timeAm:"9:00 ቀን",   title:"Gursha Ceremony",     titleAm:"ጉርሻ",       desc:"Unity feeding ritual" },
  { time:"5:00 PM",  timeAm:"11:00 ቀን",  title:"Music & Dance",       titleAm:"ሙዚቃና ዳንስ", desc:"Celebration continues" },
  { time:"7:00 PM",  timeAm:"1:00 ሌሊት",  title:"Cake & Blessing",     titleAm:"ቡራኬ",       desc:"Pastoral blessing & cake cutting" },
];

export default function OrthodoxTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const { lang, toggle } = useLang();
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const eth  = getEthiopianDate(data.date);
  const gc   = new Date(data.date);
  const gcStr= gc.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English:ital,wght@0,400;1,400&family=Noto+Serif+Ethiopic:wght@300;400;500;600&display=swap');
        .or{background:#2B0812;color:#F4ECD8;font-family:'IM Fell English',Georgia,serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .or *{box-sizing:border-box;}
        .or-in{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease;}
        .or-in.go{opacity:1;transform:none;}
        /* hero */
        .or-hero{position:relative;height:68vh;min-height:430px;}
        .or-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .or-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(43,8,18,.2) 0%,rgba(43,8,18,.55) 58%,#2B0812 100%);}
        .or-frame{position:absolute;inset:13px;border:1px solid rgba(201,148,42,.32);pointer-events:none;}
        .or-fc{position:absolute;width:26px;height:26px;}
        .or-fc.tl{top:-1px;left:-1px;border-top:2.5px solid #C9942A;border-left:2.5px solid #C9942A;}
        .or-fc.tr{top:-1px;right:-1px;border-top:2.5px solid #C9942A;border-right:2.5px solid #C9942A;}
        .or-fc.bl{bottom:-1px;left:-1px;border-bottom:2.5px solid #C9942A;border-left:2.5px solid #C9942A;}
        .or-fc.br{bottom:-1px;right:-1px;border-bottom:2.5px solid #C9942A;border-right:2.5px solid #C9942A;}
        .or-nm{position:absolute;bottom:26px;left:0;right:0;text-align:center;padding:0 20px;z-index:2;}
        .or-nm-am{font-family:'Noto Serif Ethiopic',serif;font-size:clamp(1.6rem,7.5vw,2.5rem);font-weight:500;color:#E8C06A;line-height:1.25;}
        .or-nm-en{font-family:'Cinzel Decorative',serif;font-size:clamp(1rem,4.2vw,1.6rem);color:#fff;margin-top:4px;}
        .or-tag{font-family:'Cinzel',serif;font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,192,106,.58);margin-top:9px;}
        /* dual calendar */
        .or-dual{display:grid;grid-template-columns:1fr 1px 1fr;background:rgba(0,0,0,.32);border-top:1px solid rgba(201,148,42,.17);border-bottom:1px solid rgba(201,148,42,.17);}
        .or-dc{text-align:center;padding:18px 10px;}
        .or-dc-lbl{font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:.22em;text-transform:uppercase;color:rgba(201,148,42,.62);margin-bottom:6px;}
        .or-dc-big{font-family:'Cinzel',serif;font-size:2rem;font-weight:700;color:#fff;line-height:1;}
        .or-dc-sub{font-size:10px;color:rgba(244,236,216,.5);margin-top:3px;}
        .or-dc-am{font-family:'Noto Serif Ethiopic',serif;font-size:10px;color:rgba(201,148,42,.58);margin-top:2px;}
        .or-vs{background:rgba(201,148,42,.2);margin:14px 0;}
        /* countdown */
        .or-cd{display:grid;grid-template-columns:repeat(4,1fr);}
        .or-cdc{text-align:center;padding:17px 4px;background:rgba(0,0,0,.42);border-right:1px solid rgba(201,148,42,.08);}
        .or-cdc:last-child{border-right:none;}
        .or-cdn{font-family:'Cinzel',serif;font-size:2.1rem;font-weight:700;color:#C9942A;line-height:1;}
        .or-cdl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.27);margin-top:5px;}
        /* rule */
        .or-rule{display:flex;align-items:center;gap:10px;padding:0 26px;margin:24px 0;}
        .or-rl{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(201,148,42,.42),transparent);}
        /* section head */
        .or-sh{text-align:center;padding:0 26px 16px;}
        .or-sh-eye{font-family:'Cinzel',serif;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:rgba(201,148,42,.68);margin-bottom:7px;}
        .or-sh-t{font-family:'Cinzel Decorative',serif;font-size:clamp(1.15rem,4.5vw,1.6rem);color:#F4ECD8;}
        .or-sh-am{font-family:'Noto Serif Ethiopic',serif;font-size:.95rem;color:rgba(244,236,216,.52);margin-top:4px;}
        /* message */
        .or-msg{padding:0 26px 24px;text-align:center;}
        .or-msg p{font-size:14px;line-height:1.9;color:rgba(244,236,216,.7);}
        .or-msg-am{font-family:'Noto Serif Ethiopic',serif;font-size:13px;line-height:2;color:rgba(244,236,216,.42);margin-top:13px;padding-top:13px;border-top:1px solid rgba(201,148,42,.13);}
        /* details */
        .or-dets{background:rgba(0,0,0,.22);}
        .or-det{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid rgba(201,148,42,.08);}
        .or-det:last-child{border-bottom:none;}
        .or-det-ic{display:flex;align-items:center;justify-content:center;padding:15px 0;border-right:1px solid rgba(201,148,42,.08);}
        .or-det-bd{padding:13px 15px;}
        .or-det-k{font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:.22em;text-transform:uppercase;color:rgba(201,148,42,.7);margin-bottom:3px;}
        .or-det-v{font-size:13.5px;color:#F4ECD8;line-height:1.4;}
        .or-det-am{font-family:'Noto Serif Ethiopic',serif;font-size:11px;color:rgba(244,236,216,.38);margin-top:2px;}
        /* programme */
        .or-prog{padding:0 22px 24px;}
        .or-pi{display:grid;grid-template-columns:70px 1fr;margin-bottom:2px;}
        .or-pt{padding:12px 11px 12px 0;text-align:right;border-right:1.5px solid rgba(201,148,42,.2);}
        .or-pt-am{font-family:'Noto Serif Ethiopic',serif;font-size:11.5px;color:#C9942A;}
        .or-pt-en{font-size:9.5px;color:rgba(255,255,255,.3);margin-top:2px;}
        .or-pb{padding:12px 0 12px 15px;position:relative;}
        .or-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:#C9942A;border-radius:50%;}
        .or-pb-t{font-family:'Cinzel',serif;font-size:12px;font-weight:600;color:#F4ECD8;letter-spacing:.04em;}
        .or-pb-am{font-family:'Noto Serif Ethiopic',serif;font-size:11px;color:rgba(201,148,42,.68);margin-top:1px;}
        .or-pb-d{font-size:11.5px;color:rgba(244,236,216,.4);margin-top:3px;}
        /* map */
        .or-map{margin:0 22px 22px;height:164px;overflow:hidden;border:1px solid rgba(201,148,42,.2);}
        .or-map iframe{width:100%;height:100%;border:none;filter:sepia(30%) saturate(.8);}
        .or-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 22px 26px;padding:12px;border:1px solid rgba(201,148,42,.32);color:#C9942A;font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;transition:background .2s;}
        .or-mapbtn:hover{background:rgba(201,148,42,.07);}
        /* rsvp */
        .or-rsvp{margin:0 22px 32px;padding:26px 22px;border:1px solid rgba(201,148,42,.22);background:rgba(0,0,0,.24);}
        .or-rsvp-t{font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.26em;text-transform:uppercase;color:#C9942A;text-align:center;margin-bottom:22px;}
        .or-lbl{font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(244,236,216,.42);display:block;margin-bottom:6px;}
        .or-field{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(201,148,42,.18);color:#F4ECD8;padding:11px 13px;font-family:'IM Fell English',serif;font-size:14px;outline:none;margin-bottom:14px;transition:border-color .15s;}
        .or-field:focus{border-color:#C9942A;}
        .or-field::placeholder{color:rgba(244,236,216,.18);}
        .or-field option{background:#2B0812;}
        .or-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .or-ab{padding:10px 4px;border:1px solid rgba(201,148,42,.18);background:transparent;color:rgba(244,236,216,.42);font-family:'Cinzel',serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .15s;}
        .or-ab.on{border-color:#C9942A;color:#C9942A;background:rgba(201,148,42,.07);}
        .or-sub{width:100%;padding:13px;background:#C9942A;color:#2B0812;font-family:'Cinzel',serif;font-size:9.5px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity .2s;}
        .or-sub:hover{opacity:.9;}
        .or-sub:disabled{opacity:.42;cursor:not-allowed;}
        /* footer */
        .or-foot{background:rgba(0,0,0,.38);border-top:1px solid rgba(201,148,42,.18);padding:22px 20px;text-align:center;}
        .or-foot-am{font-family:'Noto Serif Ethiopic',serif;font-size:1rem;color:rgba(201,148,42,.65);}
        .or-foot-en{font-family:'Cinzel',serif;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:rgba(244,236,216,.28);margin-top:5px;}
        /* controls */
        .or-ctrl{position:fixed;top:14px;right:14px;display:flex;gap:8px;z-index:100;}
        .or-btn{background:rgba(43,8,18,.88);border:1px solid rgba(201,148,42,.38);color:#C9942A;font-family:'Cinzel',serif;font-size:10px;letter-spacing:.1em;padding:7px 10px;cursor:pointer;backdrop-filter:blur(6px);}
      `}</style>

      <div className={`or or-in${ready?" go":""}`}>
        {data.audioUrl && <audio ref={audioRef} src={data.audioUrl} loop />}
        <div className="or-ctrl">
          {data.audioUrl && <button className="or-btn" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}
          <button className="or-btn" onClick={toggle}>{lang==="en"?"አማ":"EN"}</button>
        </div>

        {/* Hero */}
        <div className="or-hero">
          <img src={data.couplePhotoUrl} alt="" />
          <div className="or-ov" />
          <div className="or-frame">
            <div className="or-fc tl"/><div className="or-fc tr"/>
            <div className="or-fc bl"/><div className="or-fc br"/>
          </div>
          <div className="or-nm">
            <p className="or-nm-am">{lang==="am"&&data.groomNameAm?`${data.groomNameAm} & ${data.brideNameAm}`:`${data.groomNameAm??""} & ${data.brideNameAm??""}`}</p>
            <p className="or-nm-en">{data.groomName} & {data.brideName}</p>
            <p className="or-tag">Are Joined in Holy Matrimony</p>
          </div>
        </div>

        {/* Dual calendar */}
        <div className="or-dual">
          <div className="or-dc">
            <p className="or-dc-lbl">Gregorian</p>
            <p className="or-dc-big">{gc.getDate()}</p>
            <p className="or-dc-sub">{gc.toLocaleString("en-US",{month:"short"}).toUpperCase()} {gc.getFullYear()}</p>
          </div>
          <div className="or-vs" />
          <div className="or-dc">
            <p className="or-dc-lbl">Ethiopian</p>
            <p className="or-dc-big">{eth.day}</p>
            <p className="or-dc-am">{eth.monthAm} {eth.year} ዓ.ም</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="or-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="or-cdc">
              <p className="or-cdn">{String(n).padStart(2,"0")}</p>
              <p className="or-cdl">{l}</p>
            </div>
          ))}
        </div>

        {/* Cross divider */}
        <div className="or-rule" style={{marginTop:26}}>
          <div className="or-rl"/>
          <svg viewBox="0 0 40 44" width="28" height="31" fill="none" stroke="#C9942A" strokeWidth="1.3">
            <line x1="20" y1="2" x2="20" y2="42"/>
            <line x1="2" y1="14" x2="38" y2="14"/>
            <path d="M16 2h8M16 42h8M2 10v8M38 10v8"/>
            <rect x="14" y="10" width="12" height="8" transform="rotate(45 20 14)" strokeWidth="1"/>
            <circle cx="20" cy="2" r="1.8" fill="#C9942A" stroke="none"/>
            <circle cx="20" cy="42" r="1.8" fill="#C9942A" stroke="none"/>
            <circle cx="2" cy="14" r="1.8" fill="#C9942A" stroke="none"/>
            <circle cx="38" cy="14" r="1.8" fill="#C9942A" stroke="none"/>
          </svg>
          <div className="or-rl"/>
        </div>

        {/* Greeting */}
        <div className="or-sh">
          <p className="or-sh-eye">Dear Families &amp; Friends</p>
          <p className="or-sh-t">{lang==="am"&&data.greetingTitleAm?data.greetingTitleAm:data.greetingTitle}</p>
        </div>
        <div className="or-msg">
          <p>{lang==="am"&&data.messageBodyAm?data.messageBodyAm:data.messageBody}</p>
          {lang==="en"&&data.messageBodyAm&&<p className="or-msg-am">{data.messageBodyAm}</p>}
        </div>

        {/* Star divider */}
        <div className="or-rule">
          <div className="or-rl"/>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="#C9942A" opacity=".55"><path d="M10 2l2.2 5.5H18l-4.5 3.3 1.8 5.5L10 13.5 4.7 16.3l1.8-5.5L2 7.5h5.8Z"/></svg>
          <div className="or-rl"/>
        </div>

        {/* Event details */}
        <div className="or-sh" style={{paddingBottom:12}}>
          <p className="or-sh-eye">Event Information</p>
        </div>
        <div className="or-dets">
          {[
            {icon:<path d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" strokeLinecap="round"/>, k:"Date",     v:gcStr,             am:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {icon:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></>,            k:"Time",     v:data.timeEn,        am:data.timeAm??""},
            {icon:<path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>,            k:"Venue",    v:data.venue,         am:""},
            {icon:<path d="M3 11l9-9 9 9M5 9v11a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1V9" strokeLinecap="round"/>, k:"Location", v:data.venueAddress,  am:""},
          ].map(row=>(
            <div key={row.k} className="or-det">
              <div className="or-det-ic">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="rgba(201,148,42,.55)" strokeWidth="1.5">{row.icon}</svg>
              </div>
              <div className="or-det-bd">
                <p className="or-det-k">{row.k}</p>
                <p className="or-det-v">{row.v}</p>
                {row.am&&<p className="or-det-am">{row.am}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="or-rule" style={{margin:"24px 0 18px"}}>
          <div className="or-rl"/>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#C9942A" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg>
          <div className="or-rl"/>
        </div>
        <div className="or-sh" style={{paddingBottom:14}}>
          <p className="or-sh-eye">Order of Service</p>
          <p className="or-sh-t" style={{fontSize:"1.3rem"}}>Programme</p>
          <p className="or-sh-am">የዕለቱ ፕሮግራም</p>
        </div>
        <div className="or-prog">
          {prog.map(item=>(
            <div key={item.time} className="or-pi">
              <div className="or-pt">
                <p className="or-pt-am">{item.timeAm??item.time}</p>
                <p className="or-pt-en">{item.time}</p>
              </div>
              <div className="or-pb">
                <div className="or-pdot"/>
                <p className="or-pb-t">{item.title}</p>
                {item.titleAm&&<p className="or-pb-am">{item.titleAm}</p>}
                <p className="or-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="or-rule" style={{margin:"8px 0 18px"}}>
          <div className="or-rl"/>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="#C9942A" opacity=".55"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.17 5 11 5 11s5-6.83 5-11c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 5.5 10 5.5 11.5 6.17 11.5 7 10.83 8.5 10 8.5z"/></svg>
          <div className="or-rl"/>
        </div>
        <div className="or-sh" style={{paddingBottom:13}}><p className="or-sh-eye">Venue Location</p></div>
        {data.venueMapUrl?(
          <div className="or-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>
        ):(
          <div className="or-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="rgba(201,148,42,.3)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:".14em",color:"rgba(201,148,42,.3)"}}>Provide venueMapUrl to embed map</p>
          </div>
        )}
        {data.venueMapLink&&(
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="or-mapbtn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Open in Google Maps
          </a>
        )}

        {/* RSVP */}
        {/* WeddingGallery removed */}
        <div className="or-rsvp">
          {rsvp.submitted?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#C9942A" strokeWidth="1.5" style={{margin:"0 auto 12px",display:"block"}}><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:"1.05rem",color:"#C9942A",marginBottom:6}}>አስቀድሞ እናመሰግናለን!</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:"8.5px",letterSpacing:".18em",textTransform:"uppercase",color:"rgba(244,236,216,.45)"}}>Your RSVP has been received</p>
            </div>
          ):(
            <>
              <p className="or-rsvp-t">Confirm Your Attendance · ምዝገባ</p>
              <label className="or-lbl">Full Name · ሙሉ ስም *</label>
              <input className="or-field" placeholder="e.g. Tigist Bekele" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="or-lbl">Phone · ስልክ ቁጥር *</label>
              <input className="or-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="or-lbl">Attendance</label>
              <div className="or-att">
                {(["yes","no","maybe"] as const).map(v=>(
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`or-ab${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}
                  </button>
                ))}
              </div>
              <label className="or-lbl">Number of Guests</label>
              <select className="or-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="or-lbl">Message to the Couple · ለሙሽሮቹ</label>
              <textarea className="or-field" rows={3} style={{resize:"none"}} placeholder="Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="or-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Sending…":"Confirm RSVP · አረጋግጥ"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="or-foot">
          <svg viewBox="0 0 36 44" width="22" height="27" fill="none" stroke="rgba(201,148,42,.45)" strokeWidth="1.3" style={{display:"block",margin:"0 auto 14px"}}>
            <line x1="18" y1="2" x2="18" y2="42"/><line x1="2" y1="14" x2="34" y2="14"/>
            <rect x="13" y="10" width="10" height="8" transform="rotate(45 18 14)"/>
          </svg>
          <p className="or-foot-am">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="or-foot-en">{data.venue} · Ethiopia</p>
        </div>
      </div>
    </>
  );
}