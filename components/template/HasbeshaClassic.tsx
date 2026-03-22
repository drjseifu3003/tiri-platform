"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCountdown, useRSVP, useLang, getEthiopianDate } from "@/lib/hooks";

// ─── TEMPLATE 1: Habesha Classic ──────────────────────────────────────────────
// Style: White + gold, tilet woven border pattern, formal Amharic typography
// Audience: Traditional Ethiopian weddings
// Ref: Image 5 (ivory bg, tilet side borders, habesha couple, Amharic ዛሬ heading)

export default function HasbeshaClassicTemplate({ data }: { data: any }) {
  const cd = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const { lang, toggle } = useLang();
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const eth = getEthiopianDate(data.date);
  const gc = new Date(data.date);
  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  const TILET_SVG = `
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'>
      <rect width='20' height='20' fill='#8B4513'/>
      <polygon points='10,0 20,5 20,15 10,20 0,15 0,5' fill='none' stroke='#D4891A' stroke-width='1'/>
      <polygon points='10,3 17,7 17,13 10,17 3,13 3,7' fill='#A0522D'/>
      <circle cx='10' cy='10' r='2' fill='#D4891A'/>
    </svg>`;

  const DIAMOND_SVG = `
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
      <polygon points='8,0 16,8 8,16 0,8' fill='#8B4513'/>
      <polygon points='8,2 14,8 8,14 2,8' fill='#D4891A'/>
      <polygon points='8,4 12,8 8,12 4,8' fill='#8B4513'/>
    </svg>`;

  return (
    <>
      <style>{`
        .hbc { background:#FAF6EE; color:#2A1A00; font-family:system-ui,-apple-system,sans-serif; max-width:430px; margin:0 auto; overflow-x:hidden; }
        .hbc * { box-sizing:border-box; }
        .hbc-in { opacity:0; transition:opacity .6s ease; }
        .hbc-in.go { opacity:1; }

        /* Tilet border strips */
        .hbc-tilet-top, .hbc-tilet-bot {
          height:18px;
          background-image: url("data:image/svg+xml,${encodeURIComponent(TILET_SVG)}");
          background-repeat: repeat-x;
          background-size: 20px 18px;
        }
        .hbc-tilet-side {
          position:absolute; top:0; bottom:0; width:18px;
          background-image: url("data:image/svg+xml,${encodeURIComponent(TILET_SVG)}");
          background-repeat: repeat-y;
          background-size: 18px 20px;
        }
        .hbc-tilet-side.left { left:0; }
        .hbc-tilet-side.right { right:0; }

        /* Hero */
        .hbc-hero { position:relative; height:92vh; min-height:380px; }
        .hbc-hero img { width:100%; height:100%; object-fit:cover; display:block; }
        .hbc-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(90,43,12,.84) 0%,rgba(90,43,12,.22) 28%,rgba(90,43,12,.12) 50%,rgba(90,43,12,.65) 74%,#FAF6EE 100%); }

        /* Gold frame on photo */
        .hbc-frame { position:absolute; inset:10px; pointer-events:none; }
        .hbc-frame::before { content:''; position:absolute; inset:0; border:2px solid rgba(180,130,30,.5); }
        .hbc-frame-c { position:absolute; width:22px; height:22px; }
        .hbc-frame-c.tl { top:-1px; left:-1px; border-top:3px solid #B4821E; border-left:3px solid #B4821E; }
        .hbc-frame-c.tr { top:-1px; right:-1px; border-top:3px solid #B4821E; border-right:3px solid #B4821E; }
        .hbc-frame-c.bl { bottom:-1px; left:-1px; border-bottom:3px solid #B4821E; border-left:3px solid #B4821E; }
        .hbc-frame-c.br { bottom:-1px; right:-1px; border-bottom:3px solid #B4821E; border-right:3px solid #B4821E; }

        /* ዛሬ heading */
        .hbc-serg { text-align:center; padding:20px 40px 0; }
        .hbc-serg-am { font-size:clamp(2.8rem,13vw,4.2rem); font-weight:700; color:#2A1A00; line-height:1; letter-spacing:-.02em; }
        .hbc-serg-en { font-size:11px; letter-spacing:.28em; text-transform:uppercase; color:#9A7A40; margin-top:5px; }

        /* Gold divider */
        .hbc-divider { display:flex; align-items:center; gap:8px; padding:0 40px; margin:16px 0; }
        .hbc-div-line { flex:1; height:1.5px; background:linear-gradient(90deg,transparent,#B4821E,transparent); }
        .hbc-div-diamond { width:8px; height:8px; background:#B4821E; transform:rotate(45deg); flex-shrink:0; }

        /* Scripture */
        .hbc-scrip { text-align:center; padding:0 40px 16px; }
        .hbc-scrip p { font-size:13px; color:#6A4E20; line-height:1.75; font-style:italic; }
        .hbc-scrip-ref { font-size:11px; color:#9A7A40; margin-top:4px; letter-spacing:.06em; }

        /* Names */
        .hbc-names { text-align:center; padding:0 40px 8px; }
        .hbc-name-am { font-size:clamp(1.4rem,6.5vw,2rem); font-weight:700; color:#2A1A00; line-height:1.3; margin-bottom:4px; }
        .hbc-name-en { font-size:12px; color:#9A7A40; letter-spacing:.06em; }
        .hbc-parents { font-size:11px; color:#8A6A30; margin-top:6px; line-height:1.7; }

        /* Date block */
        .hbc-date-block { background:#2A1A00; margin:20px 40px; padding:18px 20px; text-align:center; }
        .hbc-date-inshallah { font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:rgba(212,137,26,.7); margin-bottom:8px; }
        .hbc-date-row { display:flex; align-items:center; justify-content:center; gap:16px; }
        .hbc-date-sep { width:1px; height:40px; background:rgba(212,137,26,.35); }
        .hbc-date-day { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.6); }
        .hbc-date-num { font-size:2.8rem; font-weight:700; color:#fff; line-height:1; }
        .hbc-date-month { font-size:14px; font-weight:600; color:#D4891A; letter-spacing:.08em; }
        .hbc-date-year { font-size:11px; color:rgba(255,255,255,.45); margin-top:2px; }
        .hbc-date-eth { font-size:11px; color:rgba(212,137,26,.65); margin-top:4px; }

        /* Countdown */
        .hbc-cd { display:grid; grid-template-columns:repeat(4,1fr); border-bottom:2px solid #2A1A00; }
        .hbc-cdc { text-align:center; padding:15px 4px; border-right:1px solid rgba(42,26,0,.1); background:#fff; }
        .hbc-cdc:last-child { border-right:none; }
        .hbc-cdn { font-size:2rem; font-weight:700; color:#2A1A00; line-height:1; }
        .hbc-cdl { font-size:8px; letter-spacing:.15em; text-transform:uppercase; color:#9A7A40; margin-top:4px; }

        /* Message */
        .hbc-msg { padding:22px 40px; text-align:center; }
        .hbc-msg-title { font-size:15px; font-weight:600; color:#2A1A00; margin-bottom:10px; }
        .hbc-msg-body { font-size:13px; line-height:1.85; color:#4A3810; }
        .hbc-msg-body-am { font-size:12.5px; line-height:2; color:#6A4E20; margin-top:12px; padding-top:12px; border-top:1px solid rgba(180,130,30,.2); }

        /* Details */
        .hbc-details { margin:0 0 4px; background:#fff; border-top:1px solid rgba(180,130,30,.2); border-bottom:1px solid rgba(180,130,30,.2); }
        .hbc-det { display:grid; grid-template-columns:48px 1fr; border-bottom:1px solid rgba(180,130,30,.1); }
        .hbc-det:last-child { border-bottom:none; }
        .hbc-det-ic { display:flex; align-items:center; justify-content:center; border-right:1px solid rgba(180,130,30,.1); }
        .hbc-det-ic span { font-size:18px; }
        .hbc-det-bd { padding:11px 14px; }
        .hbc-det-k { font-size:8.5px; letter-spacing:.2em; text-transform:uppercase; color:#9A7A40; margin-bottom:2px; }
        .hbc-det-v { font-size:13.5px; color:#2A1A00; line-height:1.4; }
        .hbc-det-v2 { font-size:11px; color:#6A4E20; margin-top:1px; }

        /* Programme */
        .hbc-prog-wrap { padding:0 20px 20px; }
        .hbc-prog-item { display:grid; grid-template-columns:72px 1fr; margin-bottom:2px; }
        .hbc-prog-t { text-align:right; padding:11px 12px 11px 0; border-right:2px solid #B4821E; }
        .hbc-prog-t-am { font-size:11.5px; color:#B4821E; }
        .hbc-prog-t-en { font-size:9.5px; color:#9A7A40; margin-top:1px; }
        .hbc-prog-b { padding:11px 0 11px 14px; position:relative; }
        .hbc-prog-dot { position:absolute; left:-5px; top:50%; transform:translateY(-50%); width:8px; height:8px; background:#B4821E; border-radius:50%; }
        .hbc-prog-title { font-size:13px; font-weight:600; color:#2A1A00; }
        .hbc-prog-title-am { font-size:11.5px; color:#6A4E20; margin-top:1px; }
        .hbc-prog-desc { font-size:11px; color:#9A7A40; margin-top:2px; }

        /* Map btn */
        .hbc-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; margin:0 20px 20px; padding:13px; background:#2A1A00; color:#D4891A; font-size:11px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; text-decoration:none; border:none; cursor:pointer; width:calc(100% - 40px); transition:opacity .2s; }
        .hbc-map-btn:hover { opacity:.88; }

        /* RSVP */
        .hbc-rsvp { margin:0 20px 28px; padding:22px 20px; border:2px solid #B4821E; background:#fff; }
        .hbc-rsvp-t { font-size:13px; font-weight:700; color:#2A1A00; text-align:center; margin-bottom:4px; letter-spacing:.06em; }
        .hbc-rsvp-am { font-size:12px; color:#9A7A40; text-align:center; margin-bottom:18px; }
        .hbc-lbl { display:block; font-size:10px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#9A7A40; margin-bottom:5px; }
        .hbc-input { width:100%; background:#FAF6EE; border:1px solid rgba(180,130,30,.3); color:#2A1A00; padding:10px 12px; font-size:13.5px; outline:none; margin-bottom:12px; border-radius:4px; font-family:inherit; transition:border-color .15s; }
        .hbc-input:focus { border-color:#B4821E; background:#fff; }
        .hbc-input::placeholder { color:#C0A870; }
        .hbc-input option { background:#FAF6EE; }
        .hbc-att { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
        .hbc-att-btn { padding:9px 4px; border:1.5px solid rgba(180,130,30,.3); background:transparent; color:#9A7A40; font-size:9.5px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; border-radius:4px; transition:all .15s; font-family:inherit; }
        .hbc-att-btn.on { border-color:#B4821E; color:#B4821E; background:rgba(180,130,30,.08); }
        .hbc-submit { width:100%; padding:13px; background:#2A1A00; color:#D4891A; font-size:11px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; border:none; cursor:pointer; border-radius:4px; transition:opacity .2s; font-family:inherit; }
        .hbc-submit:hover { opacity:.88; }
        .hbc-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Footer */
        .hbc-footer { background:#2A1A00; padding:20px; text-align:center; }
        .hbc-footer-am { font-size:.95rem; color:#D4891A; opacity:.75; }
        .hbc-footer-v { font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-top:5px; }

        /* Controls */
        .hbc-ctrl { position:fixed; top:12px; right:12px; display:flex; gap:7px; z-index:100; }
        .hbc-ctrl-btn { background:rgba(250,246,238,.92); border:1px solid rgba(180,130,30,.4); color:#8B4513; font-size:10px; font-weight:600; padding:6px 10px; cursor:pointer; backdrop-filter:blur(4px); border-radius:4px; font-family:inherit; }

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(232,160,32,.85); }
          50%      { text-shadow: 0 2px 40px rgba(232,160,32,.85), 0 0 80px rgba(232,160,32,.35); }
        }
        .hbc-name-am { animation: name-glow 3.5s ease-in-out infinite; }
      
        @keyframes hbc-glow {
          0%,100% { text-shadow: 0 2px 22px rgba(232,160,32,.85); }
          50%      { text-shadow: 0 2px 44px rgba(232,160,32,.85), 0 0 90px rgba(232,160,32,0.3); }
        }
        .hbc-name-am { animation: hbc-glow 3.5s ease-in-out infinite; }
        .hbc-grain-fx {
          position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
      `}</style>

      <div className={`hbc hbc-in${ready?" go":""}`}>
        <div className="hbc-ctrl">
          {data.audioUrl && <button className="hbc-ctrl-btn" onClick={() => { if(muted){audioRef.current?.play();setMuted(false);}else{audioRef.current?.pause();setMuted(true);} }}>{muted?"🔇":"🔊"}</button>}
          <button className="hbc-ctrl-btn" onClick={toggle}>{lang==="en"?"አማ":"EN"}</button>
        </div>

        <div className="hbc-tilet-top"/>

        {/* Hero */}
        <div className="hbc-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="hbc-hero-ov"/>
          <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.05,backgroundImage:"repeating-linear-gradient(60deg,rgba(180,130,30,.6) 0px,rgba(180,130,30,.6) 2px,transparent 2px,transparent 20px)",backgroundSize:"24px 24px"}}/>
          <div className="hbc-vig-inner" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 100px rgba(0,0,0,0.5)",pointerEvents:"none",zIndex:3}}/>
          <div className="hbc-frame">
            <div className="hbc-frame-c tl"/><div className="hbc-frame-c tr"/>
            <div className="hbc-frame-c bl"/><div className="hbc-frame-c br"/>
          </div>
        </div>

        {/* ዛሬ */}
        <div className="hbc-serg">
          <p className="hbc-serg-am">ዛሬ</p>
          <p className="hbc-serg-en">Wedding Celebration</p>
        </div>

        <div className="hbc-divider"><div className="hbc-div-line"/><div className="hbc-div-diamond"/><div className="hbc-div-line"/></div>

        {/* Scripture */}
        {data.scripture && (
          <div className="hbc-scrip">
            <p>{data.scripture}</p>
            {data.scriptureRef && <p className="hbc-scrip-ref">{data.scriptureRef}</p>}
          </div>
        )}

        <div className="hbc-divider"><div className="hbc-div-line"/><div className="hbc-div-diamond"/><div className="hbc-div-line"/></div>

        {/* Names */}
        <div className="hbc-names">
          <p className="hbc-name-am">
            {lang==="am"&&data.groomNameAm ? `${data.groomNameAm}` : data.groomName}
          </p>
          <p className="hbc-name-am" style={{fontSize:"1.1rem",color:"#B4821E",margin:"2px 0"}}>እና</p>
          <p className="hbc-name-am">
            {lang==="am"&&data.brideNameAm ? `${data.brideNameAm}` : data.brideName}
          </p>
          <p className="hbc-name-en">{data.groomName} & {data.brideName}</p>
          <p className="hbc-parents">{data.messageBody?.slice(0,100)}</p>
        </div>

        {/* Date */}
        <div className="hbc-date-block">
          <p className="hbc-date-inshallah">InshAllah On · እግዚአብሔር ፈቃዱ ሆኖ</p>
          <div className="hbc-date-row">
            <div>
              <p className="hbc-date-day">{gc.toLocaleString("en-US",{weekday:"long"})}</p>
              <p className="hbc-date-num">{gc.getDate()}</p>
              <p className="hbc-date-year">{gc.getFullYear()}</p>
            </div>
            <div className="hbc-date-sep"/>
            <div>
              <p className="hbc-date-month">{gc.toLocaleString("en-US",{month:"long"}).toUpperCase()}</p>
              <p className="hbc-date-eth">{eth.day} {eth.monthAm} {eth.year} ዓ.ም</p>
            </div>
            <div className="hbc-date-sep"/>
            <div>
              <p className="hbc-date-day">Time</p>
              <p className="hbc-date-month" style={{fontSize:"1rem"}}>{data.timeEn}</p>
              {data.timeAm && <p className="hbc-date-eth">{data.timeAm}</p>}
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="hbc-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="hbc-cdc">
              <p className="hbc-cdn">{String(n).padStart(2,"0")}</p>
              <p className="hbc-cdl">{l}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="hbc-divider" style={{margin:"20px 0 16px"}}><div className="hbc-div-line"/><div className="hbc-div-diamond"/><div className="hbc-div-line"/></div>

        {/* Greeting */}
        <div className="hbc-msg">
          <p className="hbc-msg-title">{lang==="am"&&data.greetingTitleAm ? data.greetingTitleAm : data.greetingTitle}</p>
          <p className="hbc-msg-body">{lang==="am"&&data.messageBodyAm ? data.messageBodyAm : data.messageBody}</p>
          {lang==="en" && data.messageBodyAm && <p className="hbc-msg-body-am">{data.messageBodyAm}</p>}
        </div>

        <div className="hbc-divider"><div className="hbc-div-line"/><div className="hbc-div-diamond"/><div className="hbc-div-line"/></div>

        {/* Event details */}
        <div className="hbc-details">
          {[
            {ic:"📅",k:"Date · ቀን", v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}), v2:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {ic:"⏰",k:"Time · ሰዓት", v:data.timeEn, v2:data.timeAm??""},
            {ic:"🏛️",k:"Venue · ቦታ", v:data.venue, v2:""},
            {ic:"📍",k:"Location · አድራሻ", v:data.venueAddress, v2:""},
          ].map(r=>(
            <div key={r.k} className="hbc-det">
              <div className="hbc-det-ic"><span>{r.ic}</span></div>
              <div className="hbc-det-bd">
                <p className="hbc-det-k">{r.k}</p>
                <p className="hbc-det-v">{r.v}</p>
                {r.v2&&<p className="hbc-det-v2">{r.v2}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        {data.program?.length > 0 && (
          <>
            <div className="hbc-divider" style={{margin:"20px 0 16px"}}><div className="hbc-div-line"/><div className="hbc-div-diamond"/><div className="hbc-div-line"/></div>
            <div style={{textAlign:"center",padding:"0 20px 14px"}}>
              <p style={{fontSize:"10px",letterSpacing:".22em",textTransform:"uppercase",color:"#9A7A40"}}>የዕለቱ ፕሮግራም · Programme</p>
            </div>
            <div className="hbc-prog-wrap">
              {data.program.map((item:any,i:number)=>(
                <div key={i} className="hbc-prog-item">
                  <div className="hbc-prog-t">
                    <p className="hbc-prog-t-am">{item.timeAm??item.time}</p>
                    <p className="hbc-prog-t-en">{item.time}</p>
                  </div>
                  <div className="hbc-prog-b">
                    <div className="hbc-prog-dot"/>
                    <p className="hbc-prog-title">{item.title}</p>
                    {item.titleAm&&<p className="hbc-prog-title-am">{item.titleAm}</p>}
                    <p className="hbc-prog-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Map */}
        {data.venueMapLink && (
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="hbc-map-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Open in Google Maps · ካርታ ክፈት
          </a>
        )}

        {/* RSVP */}
        <div className="hbc-rsvp">
          {rsvp.submitted ? (
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <p style={{fontSize:"1rem",fontWeight:700,color:"#2A1A00",marginBottom:5}}>አስቀድሞ እናመሰግናለን!</p>
              <p style={{fontSize:"11px",letterSpacing:".16em",textTransform:"uppercase",color:"#9A7A40"}}>Your RSVP has been received</p>
            </div>
          ):(
            <>
              <p className="hbc-rsvp-t">RSVP</p>
              <p className="hbc-rsvp-am">ምዝገባ · Please Confirm Your Attendance</p>
              <label className="hbc-lbl">Full Name · ሙሉ ስም *</label>
              <input className="hbc-input" placeholder="e.g. Selam Bekele" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="hbc-lbl">Phone · ስልክ ቁጥር *</label>
              <input className="hbc-input" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="hbc-lbl">Attendance</label>
              <div className="hbc-att">
                {(["yes","no","maybe"] as const).map(v=>(
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`hbc-att-btn${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}
                  </button>
                ))}
              </div>
              <label className="hbc-lbl">Guests</label>
              <select className="hbc-input" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="hbc-lbl">Message to the Couple · ለሙሽሮቹ</label>
              <textarea className="hbc-input" rows={3} style={{resize:"none"}} placeholder="ምርቃትዎን ያካፍሉ…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="hbc-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Sending…":"Confirm RSVP · አረጋግጥ"}
              </button>
            </>
          )}
        </div>

        <div className="hbc-footer">
          <p className="hbc-footer-am">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="hbc-footer-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="hbc-tilet-bot"/>
      </div>
    </>
  );
}