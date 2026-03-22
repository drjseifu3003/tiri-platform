"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCountdown, useRSVP, getEthiopianDate } from "@/lib/hooks";

// ─── TEMPLATE 10: Elegant Universal ──────────────────────────────────────────
// Style: Neutral, soft gold + white — works for all religions & cultures
// Audience: General users — free tier
// Clean floral border card inspired by reference image 7 (flower corners, gold frame)

export default function ElegantUniversalTemplate({ data }: { data: any }) {
  const cd = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const eth = getEthiopianDate(data.date);
  const gc = new Date(data.date);
  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  // Decorative floral corner SVG inspired by image 7
  const FloralTopRight = () => (
    <svg viewBox="0 0 100 100" width="90" height="90" fill="none">
      <circle cx="85" cy="15" r="12" fill="#E8A0B8" opacity=".7"/>
      <circle cx="95" cy="25" r="8" fill="#D4506A" opacity=".6"/>
      <circle cx="75" cy="8" r="8" fill="#F0C0D0" opacity=".65"/>
      <circle cx="70" cy="22" r="6" fill="#C84060" opacity=".5"/>
      <circle cx="90" cy="40" r="6" fill="#E8A0B8" opacity=".55"/>
      <ellipse cx="80" cy="30" rx="4" ry="7" fill="#4A8A40" opacity=".5" transform="rotate(-30 80 30)"/>
      <ellipse cx="68" cy="18" rx="3" ry="6" fill="#4A8A40" opacity=".4" transform="rotate(20 68 18)"/>
      <ellipse cx="92" cy="35" rx="3" ry="5" fill="#4A8A40" opacity=".45" transform="rotate(-60 92 35)"/>
    </svg>
  );

  const FloralBottomLeft = () => (
    <svg viewBox="0 0 100 100" width="90" height="90" fill="none">
      <circle cx="15" cy="85" r="14" fill="#E8A0B8" opacity=".7"/>
      <circle cx="5" cy="75" r="9" fill="#D4506A" opacity=".6"/>
      <circle cx="25" cy="92" r="9" fill="#F0C0D0" opacity=".65"/>
      <circle cx="30" cy="78" r="7" fill="#E8C8D0" opacity=".5"/>
      <circle cx="8" cy="60" r="7" fill="#C84060" opacity=".45"/>
      <circle cx="35" cy="90" r="5" fill="#E8A0B8" opacity=".55"/>
      <ellipse cx="20" cy="70" rx="4" ry="8" fill="#4A8A40" opacity=".5" transform="rotate(40 20 70)"/>
      <ellipse cx="32" cy="82" rx="3" ry="6" fill="#4A8A40" opacity=".45" transform="rotate(-20 32 82)"/>
      <ellipse cx="8" cy="68" rx="3" ry="6" fill="#4A8A40" opacity=".4" transform="rotate(60 8 68)"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .eu { background:#FEFDFB; color:#1A1008; font-family:system-ui,-apple-system,sans-serif; max-width:430px; margin:0 auto; overflow-x:hidden; }
        .eu * { box-sizing:border-box; }
        .eu-in { opacity:0; transition:opacity .65s ease; }
        .eu-in.go { opacity:1; }

        /* Soft gold top line */
        .eu-topline { height:2px; background:linear-gradient(90deg,transparent,#C8A850,transparent); }

        /* Hero with floral decoration */
        .eu-hero { position:relative; height:92vh; min-height:370px; }
        .eu-hero img { width:100%; height:100%; object-fit:cover; display:block; }
        .eu-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(26,16,8,.52) 0%,rgba(26,16,8,.12) 28%,rgba(26,16,8,.07) 50%,rgba(26,16,8,.42) 72%,#FEFDFB 100%); }
        .eu-floral-tr { position:absolute; top:0; right:0; pointer-events:none; }
        .eu-floral-bl { position:absolute; bottom:0; left:0; pointer-events:none; }

        /* Gold frame */
        .eu-frame { position:absolute; inset:16px; pointer-events:none; }
        .eu-frame::before { content:''; position:absolute; inset:0; border:1.5px solid rgba(200,168,80,.38); }
        .eu-fc { position:absolute; width:18px; height:18px; }
        .eu-fc.tl { top:-1px; left:-1px; border-top:2px solid #C8A850; border-left:2px solid #C8A850; }
        .eu-fc.tr { top:-1px; right:-1px; border-top:2px solid #C8A850; border-right:2px solid #C8A850; }
        .eu-fc.bl { bottom:-1px; left:-1px; border-bottom:2px solid #C8A850; border-left:2px solid #C8A850; }
        .eu-fc.br { bottom:-1px; right:-1px; border-bottom:2px solid #C8A850; border-right:2px solid #C8A850; }

        /* Card content area */
        .eu-card { margin:0 20px; background:#fff; border:1.5px solid rgba(200,168,80,.3); padding:28px 24px; text-align:center; position:relative; z-index:2; }

        /* Title */
        .eu-title { font-size:9px; letter-spacing:.28em; text-transform:uppercase; color:#C8A850; margin-bottom:14px; }

        /* Names */
        .eu-name { font-size:clamp(1.5rem,7.5vw,2.2rem); font-weight:600; color:#1A1008; line-height:1.3; }
        .eu-and { font-size:1.2rem; color:#C8A850; margin:6px 0; letter-spacing:.12em; }
        .eu-name-am { font-size:clamp(1rem,5vw,1.4rem); color:#4A3818; margin-top:3px; }
        .eu-name-en { font-size:11px; color:#8A7840; letter-spacing:.06em; margin-top:4px; }

        /* Thin rule */
        .eu-rule { width:50px; height:1px; background:#C8A850; margin:14px auto; opacity:.6; }

        /* Scripture in card */
        .eu-scrip { font-size:12.5px; color:#3A2808; line-height:1.85; font-style:italic; margin-bottom:4px; }
        .eu-scrip-ref { font-size:10px; color:#C8A850; letter-spacing:.08em; }

        /* Date in card */
        .eu-date { margin-top:16px; padding-top:16px; border-top:1px solid rgba(200,168,80,.2); }
        .eu-date-label { font-size:8.5px; letter-spacing:.22em; text-transform:uppercase; color:#9A8840; margin-bottom:8px; }
        .eu-date-row { display:flex; align-items:center; justify-content:center; gap:12px; }
        .eu-date-day { font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:#C8A850; }
        .eu-date-sep { font-size:14px; color:rgba(200,168,80,.5); }
        .eu-date-num { font-size:2.8rem; font-weight:300; color:#1A1008; line-height:1; }
        .eu-date-month { font-size:12px; font-weight:600; color:#1A1008; text-transform:uppercase; letter-spacing:.1em; }
        .eu-date-year { font-size:11px; color:#8A7840; margin-top:2px; }
        .eu-date-eth { font-size:10.5px; color:#C8A850; margin-top:3px; opacity:.8; }
        .eu-date-time { font-size:12px; color:#4A3818; margin-top:6px; }

        /* Countdown */
        .eu-cd { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid rgba(200,168,80,.22); border-bottom:1px solid rgba(200,168,80,.22); }
        .eu-cdc { text-align:center; padding:16px 4px; background:#FEFDFB; border-right:1px solid rgba(200,168,80,.15); }
        .eu-cdc:last-child { border-right:none; }
        .eu-cdn { font-size:2rem; font-weight:300; color:#1A1008; line-height:1; }
        .eu-cdl { font-size:8px; letter-spacing:.14em; text-transform:uppercase; color:#C8A850; margin-top:4px; opacity:.7; }

        /* Message */
        .eu-msg { padding:22px 32px 18px; text-align:center; background:#fff; }
        .eu-msg-t { font-size:14px; font-weight:600; color:#1A1008; margin-bottom:10px; }
        .eu-msg-b { font-size:13px; line-height:1.9; color:#3A2808; }
        .eu-msg-am { font-size:12.5px; line-height:2; color:#5A4828; margin-top:12px; padding-top:12px; border-top:1px solid rgba(200,168,80,.18); }

        /* Details */
        .eu-dets { background:#FEFDFB; border-top:1px solid rgba(200,168,80,.2); border-bottom:1px solid rgba(200,168,80,.2); }
        .eu-det { display:grid; grid-template-columns:48px 1fr; border-bottom:1px solid rgba(200,168,80,.1); }
        .eu-det:last-child { border-bottom:none; }
        .eu-det-ic { display:flex; align-items:center; justify-content:center; font-size:17px; border-right:1px solid rgba(200,168,80,.1); }
        .eu-det-bd { padding:12px 14px; }
        .eu-det-k { font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:#C8A850; margin-bottom:2px; }
        .eu-det-v { font-size:13.5px; color:#1A1008; line-height:1.4; }
        .eu-det-v2 { font-size:11px; color:#6A5830; margin-top:1px; }

        /* Programme */
        .eu-prog { padding:0 24px 20px; background:#fff; }
        .eu-prog-head { text-align:center; padding:18px 0 12px; }
        .eu-prog-head-t { font-size:1rem; font-weight:600; color:#1A1008; }
        .eu-prog-head-s { font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:#C8A850; margin-top:3px; }
        .eu-pi { display:grid; grid-template-columns:66px 1fr; margin-bottom:2px; }
        .eu-pt { text-align:right; padding:11px 12px 11px 0; border-right:1px solid rgba(200,168,80,.4); }
        .eu-pt-main { font-size:11.5px; color:#C8A850; }
        .eu-pt-am { font-size:9.5px; color:#9A8840; margin-top:1px; }
        .eu-pb { padding:11px 0 11px 14px; position:relative; }
        .eu-pdot { position:absolute; left:-5px; top:50%; transform:translateY(-50%); width:8px; height:8px; border:1.5px solid #C8A850; border-radius:50%; background:#FEFDFB; }
        .eu-pb-t { font-size:13px; font-weight:500; color:#1A1008; }
        .eu-pb-am { font-size:11px; color:#8A7840; margin-top:1px; }
        .eu-pb-d { font-size:11px; color:#9A8860; margin-top:2px; }

        /* Map */
        .eu-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; margin:0 24px 20px; padding:12px; border:1.5px solid rgba(200,168,80,.4); color:#8A7040; font-size:10px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; text-decoration:none; transition:background .2s; }
        .eu-map-btn:hover { background:rgba(200,168,80,.06); }

        /* RSVP */
        .eu-rsvp { margin:0 24px 26px; padding:22px 20px; border:1.5px solid rgba(200,168,80,.35); background:#fff; }
        .eu-rsvp-t { font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:#8A7840; text-align:center; margin-bottom:16px; }
        .eu-lbl { display:block; font-size:8.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#9A8860; margin-bottom:5px; }
        .eu-input { width:100%; background:#FEFDFB; border:1px solid rgba(200,168,80,.25); color:#1A1008; padding:10px 12px; font-size:13.5px; outline:none; margin-bottom:12px; border-radius:3px; font-family:inherit; transition:border-color .15s; }
        .eu-input:focus { border-color:#C8A850; background:#fff; }
        .eu-input::placeholder { color:#C8B880; }
        .eu-input option { background:#FEFDFB; }
        .eu-att { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
        .eu-att-btn { padding:9px 4px; border:1px solid rgba(200,168,80,.25); background:transparent; color:#9A8860; font-size:9px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; border-radius:3px; transition:all .15s; font-family:inherit; }
        .eu-att-btn.on { border-color:#C8A850; color:#8A7040; background:rgba(200,168,80,.07); }
        .eu-submit { width:100%; padding:13px; background:#1A1008; color:#C8A850; font-size:10px; font-weight:600; letter-spacing:.2em; text-transform:uppercase; border:none; cursor:pointer; border-radius:3px; transition:opacity .2s; font-family:inherit; }
        .eu-submit:hover { opacity:.85; }
        .eu-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Footer */
        .eu-footer { padding:20px; text-align:center; border-top:1px solid rgba(200,168,80,.22); position:relative; overflow:hidden; }
        .eu-footer-flr { position:absolute; top:0; right:0; opacity:.3; pointer-events:none; }
        .eu-footer-am { font-size:.9rem; color:#8A7840; position:relative; }
        .eu-footer-v { font-size:8.5px; letter-spacing:.14em; text-transform:uppercase; color:#C8B880; margin-top:5px; position:relative; }

        .eu-ctrl { position:fixed; top:12px; right:12px; display:flex; gap:7px; z-index:100; }
        .eu-ctrl-btn { background:rgba(254,253,251,.92); border:1px solid rgba(200,168,80,.4); color:#8A7040; font-size:10px; font-weight:600; padding:6px 10px; cursor:pointer; border-radius:3px; font-family:inherit; }

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(200,168,80,.85); }
          50%      { text-shadow: 0 2px 40px rgba(200,168,80,.85), 0 0 80px rgba(200,168,80,.35); }
        }
        .eu-name { animation: name-glow 3.5s ease-in-out infinite; }
      
        @keyframes eu-glow {
          0%,100% { text-shadow: 0 2px 22px rgba(200,168,80,.85); }
          50%      { text-shadow: 0 2px 44px rgba(200,168,80,.85), 0 0 90px rgba(200,168,80,0.3); }
        }
        .eu-name { animation: eu-glow 3.5s ease-in-out infinite; }
        .eu-grain-fx {
          position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
      `}</style>

      <div className={`eu eu-in${ready?" go":""}`}>
        <div className="eu-ctrl">
          {data.audioUrl&&<button className="eu-ctrl-btn" onClick={()=>{if(muted){audioRef.current?.play();setMuted(false);}else{audioRef.current?.pause();setMuted(true);}}}>{muted?"🔇":"🔊"}</button>}
        </div>

        <div className="eu-topline"/>

        {/* Hero */}
        <div className="eu-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="eu-hero-ov"/>
          <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.045,backgroundImage:"radial-gradient(circle,rgba(200,168,64,.55) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
          <div className="eu-vig-inner" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 100px rgba(60,40,10,0.2)",pointerEvents:"none",zIndex:3}}/>
          <div className="eu-floral-tr"><FloralTopRight/></div>
          <div className="eu-floral-bl"><FloralBottomLeft/></div>
          <div className="eu-frame">
            <div className="eu-fc tl"/><div className="eu-fc tr"/>
            <div className="eu-fc bl"/><div className="eu-fc br"/>
          </div>
        </div>

        {/* Card */}
        <div className="eu-card">
          <p className="eu-title">Wedding Invitation · የሠርግ ጥሪ</p>
          <p className="eu-name">{data.groomNameAm??data.groomName}</p>
          <p className="eu-and">&amp;</p>
          <p className="eu-name">{data.brideNameAm??data.brideName}</p>
          <p className="eu-name-en">{data.groomName} & {data.brideName}</p>
          <div className="eu-rule"/>
          {data.scripture&&<><p className="eu-scrip">{data.scripture}</p>{data.scriptureRef&&<p className="eu-scrip-ref">{data.scriptureRef}</p>}</>}
          <div className="eu-date">
            <p className="eu-date-label">Date of Celebration</p>
            <div className="eu-date-row">
              <div>
                <p className="eu-date-day">{gc.toLocaleString("en-US",{weekday:"long"})}</p>
                <p className="eu-date-num">{gc.getDate()}</p>
              </div>
              <p className="eu-date-sep">·</p>
              <div>
                <p className="eu-date-month">{gc.toLocaleString("en-US",{month:"long"})}</p>
                <p className="eu-date-year">{gc.getFullYear()}</p>
                <p className="eu-date-eth">{eth.day} {eth.monthAm} {eth.year} ዓ.ም</p>
              </div>
            </div>
            <p className="eu-date-time">⏰ {data.timeEn}{data.timeAm?` · ${data.timeAm}`:""}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="eu-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="eu-cdc"><p className="eu-cdn">{String(n).padStart(2,"0")}</p><p className="eu-cdl">{l}</p></div>
          ))}
        </div>

        {/* Message */}
        <div className="eu-msg">
          <p className="eu-msg-t">{data.greetingTitle}</p>
          <p className="eu-msg-b">{data.messageBody}</p>
          {data.messageBodyAm&&<p className="eu-msg-am">{data.messageBodyAm}</p>}
        </div>

        {/* Details */}
        <div className="eu-dets">
          {[
            {ic:"📅",k:"Date",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),v2:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {ic:"⏰",k:"Time",v:data.timeEn,v2:data.timeAm??""},
            {ic:"🏛️",k:"Venue",v:data.venue,v2:""},
            {ic:"📍",k:"Location",v:data.venueAddress,v2:""},
          ].map(r=>(
            <div key={r.k} className="eu-det">
              <div className="eu-det-ic">{r.ic}</div>
              <div className="eu-det-bd"><p className="eu-det-k">{r.k}</p><p className="eu-det-v">{r.v}</p>{r.v2&&<p className="eu-det-v2">{r.v2}</p>}</div>
            </div>
          ))}
        </div>

        {/* Programme */}
        {data.program?.length>0&&(
          <div className="eu-prog">
            <div className="eu-prog-head"><p className="eu-prog-head-t">Programme of Events</p><p className="eu-prog-head-s">የዕለቱ ፕሮግራም</p></div>
            {data.program.map((item:any,i:number)=>(
              <div key={i} className="eu-pi">
                <div className="eu-pt"><p className="eu-pt-main">{item.time}</p>{item.timeAm&&<p className="eu-pt-am">{item.timeAm}</p>}</div>
                <div className="eu-pb">
                  <div className="eu-pdot"/>
                  <p className="eu-pb-t">{item.title}</p>
                  {item.titleAm&&<p className="eu-pb-am">{item.titleAm}</p>}
                  <p className="eu-pb-d">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.venueMapLink&&<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="eu-map-btn"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>}

        <div className="eu-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"14px 0"}}><p style={{fontSize:"1rem",fontWeight:600,color:"#1A1008",marginBottom:4}}>Thank You!</p><p style={{fontSize:"11px",letterSpacing:".14em",textTransform:"uppercase",color:"#9A8860"}}>RSVP Received</p></div>):(
            <>
              <p className="eu-rsvp-t">Confirm Your Attendance</p>
              <label className="eu-lbl">Full Name *</label>
              <input className="eu-input" placeholder="Your name" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="eu-lbl">Phone *</label>
              <input className="eu-input" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="eu-lbl">Attendance</label>
              <div className="eu-att">{(["yes","no","maybe"] as const).map(v=><button key={v} onClick={()=>rsvp.update("attending",v)} className={`eu-att-btn${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}</button>)}</div>
              <label className="eu-lbl">Guests</label>
              <select className="eu-input" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="eu-lbl">Message to the Couple</label>
              <textarea className="eu-input" rows={3} style={{resize:"none"}} placeholder="Share your blessing or wishes…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="eu-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP"}</button>
            </>
          )}
        </div>

        <div className="eu-footer">
          <div className="eu-footer-flr"><FloralTopRight/></div>
          <p className="eu-footer-am">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="eu-footer-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="eu-topline"/>
      </div>
    </>
  );
}