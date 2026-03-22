"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCountdown, useRSVP, getEthiopianDate } from "@/lib/hooks";

// ─── TEMPLATE 5: Orthodox Minimal ────────────────────────────────────────────
// Style: White + soft gold, clean, minimalist — modern Orthodox couples
// Elegant simplicity, floral corner accents, refined typography

export default function OrthodoxMinimalTemplate({ data }: { data: any }) {
  const cd = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const eth = getEthiopianDate(data.date);
  const gc = new Date(data.date);
  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  // Minimal cross
  const CrossSvg = () => (
    <svg viewBox="0 0 32 44" width="20" height="28" fill="none" stroke="#B4921A" strokeWidth="1.5" opacity=".6">
      <line x1="16" y1="2" x2="16" y2="42"/>
      <line x1="4" y1="14" x2="28" y2="14"/>
    </svg>
  );

  // Floral corner
  const FloralCorner = ({ flip = false }) => (
    <svg viewBox="0 0 60 60" width="55" height="55" fill="none" style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <path d="M5 55 Q20 20 55 5" stroke="#C4A840" strokeWidth="1" opacity=".4"/>
      <circle cx="12" cy="48" r="4" fill="#C4A840" opacity=".3"/>
      <circle cx="22" cy="38" r="3" fill="#C4A840" opacity=".35"/>
      <circle cx="35" cy="25" r="5" fill="#C4A840" opacity=".25"/>
      <circle cx="48" cy="12" r="3" fill="#C4A840" opacity=".3"/>
      <path d="M10 50 Q8 45 14 44 Q12 50 10 50z" fill="#C4A840" opacity=".4"/>
      <path d="M25 35 Q22 30 28 29 Q27 35 25 35z" fill="#C4A840" opacity=".35"/>
      <path d="M42 18 Q39 13 45 12 Q44 18 42 18z" fill="#C4A840" opacity=".4"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .om { background:#FEFCF8; color:#1C1408; font-family:system-ui,-apple-system,sans-serif; max-width:430px; margin:0 auto; overflow-x:hidden; }
        .om * { box-sizing:border-box; }
        .om-in { opacity:0; transition:opacity .65s ease; }
        .om-in.go { opacity:1; }

        /* Gold top border */
        .om-top { height:2px; background:linear-gradient(90deg,transparent 0%,#C4A840 30%,#C4A840 70%,transparent 100%); }

        /* Hero */
        .om-hero { position:relative; height:92vh; min-height:380px; overflow:hidden; }
        .om-hero img { width:100%; height:100%; object-fit:cover; display:block; }
        .om-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(28,20,8,.55) 0%,rgba(28,20,8,.14) 28%,rgba(28,20,8,.08) 50%,rgba(28,20,8,.45) 72%,#FEFCF8 100%); }
        /* Floral corners on photo */
        .om-hero-fl { position:absolute; top:10px; left:10px; pointer-events:none; }
        .om-hero-fr { position:absolute; top:10px; right:10px; pointer-events:none; }

        /* Center content */
        .om-center { text-align:center; padding:24px 36px 0; }
        .om-cross { margin:0 auto 12px; display:block; }
        .om-title { font-size:9px; letter-spacing:.28em; text-transform:uppercase; color:#C4A840; margin-bottom:14px; }
        .om-names-am { font-size:clamp(1.5rem,7vw,2.2rem); font-weight:600; color:#1C1408; line-height:1.3; }
        .om-and { font-size:1.1rem; color:#C4A840; margin:4px 0; letter-spacing:.12em; }
        .om-names-en { font-size:12px; color:#8A7040; letter-spacing:.06em; margin-top:4px; }

        /* Gold thin rule */
        .om-rule { width:60px; height:1px; background:#C4A840; margin:16px auto; opacity:.6; }

        /* Scripture */
        .om-scrip { padding:0 40px 18px; text-align:center; }
        .om-scrip p { font-size:13px; color:#3C2C10; line-height:1.85; font-style:italic; }
        .om-scrip-ref { font-size:10px; letter-spacing:.1em; color:#9A8040; margin-top:6px; }

        /* Date — clean white card */
        .om-date { margin:0 28px 20px; border:1.5px solid rgba(196,168,64,.35); background:#fff; padding:20px 16px; text-align:center; }
        .om-date-inshallah { font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:#9A8040; margin-bottom:12px; }
        .om-date-day { font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:#C4A840; margin-bottom:4px; }
        .om-date-num { font-size:3.8rem; font-weight:300; color:#1C1408; line-height:1; }
        .om-date-month { font-size:14px; font-weight:600; color:#1C1408; letter-spacing:.1em; text-transform:uppercase; margin-top:4px; }
        .om-date-year { font-size:11px; color:#8A7040; margin-top:2px; }
        .om-date-eth { font-size:11px; color:#C4A840; margin-top:4px; opacity:.8; }
        .om-date-time-row { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:12px; padding-top:12px; border-top:1px solid rgba(196,168,64,.2); }
        .om-date-time { font-size:13px; color:#3C2C10; }

        /* Countdown */
        .om-cd { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid rgba(196,168,64,.25); border-bottom:1px solid rgba(196,168,64,.25); }
        .om-cdc { text-align:center; padding:16px 4px; background:#fff; border-right:1px solid rgba(196,168,64,.15); }
        .om-cdc:last-child { border-right:none; }
        .om-cdn { font-size:2rem; font-weight:300; color:#1C1408; line-height:1; }
        .om-cdl { font-size:8px; letter-spacing:.15em; text-transform:uppercase; color:#C4A840; margin-top:4px; opacity:.7; }

        /* Message */
        .om-msg { padding:22px 36px 18px; text-align:center; }
        .om-msg-t { font-size:14.5px; font-weight:600; color:#1C1408; margin-bottom:10px; }
        .om-msg-b { font-size:13px; line-height:1.9; color:#3C2C10; }
        .om-msg-am { font-size:12.5px; line-height:2; color:#5A4820; margin-top:12px; padding-top:12px; border-top:1px solid rgba(196,168,64,.2); }

        /* Details */
        .om-dets { background:#FEFCF8; border-top:1px solid rgba(196,168,64,.22); border-bottom:1px solid rgba(196,168,64,.22); }
        .om-det { display:grid; grid-template-columns:48px 1fr; border-bottom:1px solid rgba(196,168,64,.1); }
        .om-det:last-child { border-bottom:none; }
        .om-det-ic { display:flex; align-items:center; justify-content:center; font-size:17px; border-right:1px solid rgba(196,168,64,.1); }
        .om-det-bd { padding:12px 14px; }
        .om-det-k { font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:#C4A840; margin-bottom:2px; }
        .om-det-v { font-size:13.5px; color:#1C1408; line-height:1.4; }
        .om-det-v2 { font-size:11px; color:#6A5830; margin-top:1px; }

        /* Programme */
        .om-prog { padding:0 24px 20px; }
        .om-pi { display:grid; grid-template-columns:68px 1fr; margin-bottom:2px; }
        .om-pt { text-align:right; padding:11px 12px 11px 0; border-right:1px solid rgba(196,168,64,.4); }
        .om-pt-main { font-size:11.5px; color:#C4A840; }
        .om-pt-am { font-size:9.5px; color:#9A8040; margin-top:1px; }
        .om-pb { padding:11px 0 11px 14px; position:relative; }
        .om-pdot { position:absolute; left:-5px; top:50%; transform:translateY(-50%); width:7px; height:7px; border:1.5px solid #C4A840; border-radius:50%; background:#FEFCF8; }
        .om-pb-t { font-size:13px; font-weight:500; color:#1C1408; }
        .om-pb-am { font-size:11px; color:#8A7040; margin-top:1px; }
        .om-pb-d { font-size:11px; color:#9A8A60; margin-top:2px; }

        /* Map */
        .om-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; margin:0 24px 20px; padding:12px; border:1.5px solid rgba(196,168,64,.45); color:#8A7040; font-size:10px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; text-decoration:none; transition:background .2s; }
        .om-map-btn:hover { background:rgba(196,168,64,.06); }

        /* RSVP */
        .om-rsvp { margin:0 24px 26px; padding:22px 20px; border:1.5px solid rgba(196,168,64,.35); background:#fff; }
        .om-rsvp-t { font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:#8A7040; text-align:center; margin-bottom:18px; }
        .om-lbl { display:block; font-size:8.5px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:#9A8A60; margin-bottom:5px; }
        .om-input { width:100%; background:#FEFCF8; border:1px solid rgba(196,168,64,.28); color:#1C1408; padding:10px 12px; font-size:13.5px; outline:none; margin-bottom:12px; border-radius:3px; font-family:inherit; transition:border-color .15s; }
        .om-input:focus { border-color:#C4A840; background:#fff; }
        .om-input::placeholder { color:#C4B880; }
        .om-input option { background:#FEFCF8; }
        .om-att { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
        .om-att-btn { padding:9px 4px; border:1px solid rgba(196,168,64,.28); background:transparent; color:#9A8A60; font-size:9px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; border-radius:3px; transition:all .15s; font-family:inherit; }
        .om-att-btn.on { border-color:#C4A840; color:#8A7040; background:rgba(196,168,64,.07); }
        .om-submit { width:100%; padding:13px; background:#1C1408; color:#C4A840; font-size:10px; font-weight:600; letter-spacing:.2em; text-transform:uppercase; border:none; cursor:pointer; border-radius:3px; transition:opacity .2s; font-family:inherit; }
        .om-submit:hover { opacity:.85; }
        .om-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Footer */
        .om-footer { padding:20px; text-align:center; border-top:1px solid rgba(196,168,64,.25); }
        .om-footer-cross { margin:0 auto 12px; display:block; }
        .om-footer-am { font-size:.9rem; color:#8A7040; }
        .om-footer-v { font-size:8.5px; letter-spacing:.14em; text-transform:uppercase; color:#C4B880; margin-top:5px; }

        .om-ctrl { position:fixed; top:12px; right:12px; display:flex; gap:7px; z-index:100; }
        .om-ctrl-btn { background:rgba(254,252,248,.92); border:1px solid rgba(196,168,64,.4); color:#8A7040; font-size:10px; font-weight:600; padding:6px 10px; cursor:pointer; border-radius:3px; font-family:inherit; }

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(196,168,64,.85); }
          50%      { text-shadow: 0 2px 40px rgba(196,168,64,.85), 0 0 80px rgba(196,168,64,.35); }
        }
        .om-names-am { animation: name-glow 3.5s ease-in-out infinite; }
      
        @keyframes om-glow {
          0%,100% { text-shadow: 0 2px 22px rgba(196,168,64,.85); }
          50%      { text-shadow: 0 2px 44px rgba(196,168,64,.85), 0 0 90px rgba(196,168,64,0.3); }
        }
        .om-names-am { animation: om-glow 3.5s ease-in-out infinite; }
        .om-grain-fx {
          position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
      `}</style>

      <div className={`om om-in${ready?" go":""}`}>
        <div className="om-ctrl">
          {data.audioUrl&&<button className="om-ctrl-btn" onClick={()=>{if(muted){audioRef.current?.play();setMuted(false);}else{audioRef.current?.pause();setMuted(true);}}}>{muted?"🔇":"🔊"}</button>}
        </div>

        <div className="om-top"/>

        <div className="om-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="om-hero-ov"/>
          <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.045,backgroundImage:"radial-gradient(circle,rgba(196,168,64,.5) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
          <div className="om-vig-inner" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 100px rgba(60,40,10,0.25)",pointerEvents:"none",zIndex:3}}/>
          <div className="om-hero-fl"><FloralCorner/></div>
          <div className="om-hero-fr"><FloralCorner flip/></div>
        </div>

        <div className="om-center">
          <CrossSvg/>
          <p className="om-title">Holy Matrimony · ቅዱስ ጋብቻ</p>
          <p className="om-names-am">{data.groomNameAm??data.groomName}</p>
          <p className="om-and">✝</p>
          <p className="om-names-am">{data.brideNameAm??data.brideName}</p>
          <p className="om-names-en">{data.groomName} & {data.brideName}</p>
        </div>

        <div className="om-rule"/>

        {data.scripture&&<div className="om-scrip"><p>{data.scripture}</p>{data.scriptureRef&&<p className="om-scrip-ref">{data.scriptureRef}</p>}</div>}

        <div className="om-date">
          <p className="om-date-inshallah">እግዚአብሔር ፈቃዱ ሆኖ</p>
          <p className="om-date-day">{gc.toLocaleString("en-US",{weekday:"long"})}</p>
          <p className="om-date-num">{gc.getDate()}</p>
          <p className="om-date-month">{gc.toLocaleString("en-US",{month:"long"})}</p>
          <p className="om-date-year">{gc.getFullYear()}</p>
          <p className="om-date-eth">{eth.day} {eth.monthAm} {eth.year} ዓ.ም</p>
          <div className="om-date-time-row">
            <span>⏰</span>
            <p className="om-date-time">{data.timeEn}</p>
            {data.timeAm&&<p className="om-date-time" style={{color:"#9A8040",fontSize:"12px"}}>· {data.timeAm}</p>}
          </div>
        </div>

        <div className="om-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="om-cdc"><p className="om-cdn">{String(n).padStart(2,"0")}</p><p className="om-cdl">{l}</p></div>
          ))}
        </div>

        <div className="om-msg">
          <p className="om-msg-t">{data.greetingTitle}</p>
          <p className="om-msg-b">{data.messageBody}</p>
          {data.messageBodyAm&&<p className="om-msg-am">{data.messageBodyAm}</p>}
        </div>

        <div className="om-dets">
          {[
            {ic:"📅",k:"Date",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),v2:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {ic:"⏰",k:"Time",v:data.timeEn,v2:data.timeAm??""},
            {ic:"🏛️",k:"Church / Venue",v:data.venue,v2:""},
            {ic:"📍",k:"Location",v:data.venueAddress,v2:""},
          ].map(r=>(
            <div key={r.k} className="om-det">
              <div className="om-det-ic">{r.ic}</div>
              <div className="om-det-bd"><p className="om-det-k">{r.k}</p><p className="om-det-v">{r.v}</p>{r.v2&&<p className="om-det-v2">{r.v2}</p>}</div>
            </div>
          ))}
        </div>

        {data.program?.length>0&&(
          <>
            <div style={{textAlign:"center",padding:"20px 24px 14px"}}><div className="om-rule"/><p style={{fontSize:"9px",letterSpacing:".22em",textTransform:"uppercase",color:"#C4A840",marginTop:8}}>Order of Service · ፕሮግራም</p></div>
            <div className="om-prog">
              {data.program.map((item:any,i:number)=>(
                <div key={i} className="om-pi">
                  <div className="om-pt"><p className="om-pt-main">{item.time}</p>{item.timeAm&&<p className="om-pt-am">{item.timeAm}</p>}</div>
                  <div className="om-pb">
                    <div className="om-pdot"/>
                    <p className="om-pb-t">{item.title}</p>
                    {item.titleAm&&<p className="om-pb-am">{item.titleAm}</p>}
                    <p className="om-pb-d">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {data.venueMapLink&&<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="om-map-btn"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>}

        
        <div className="om-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"14px 0"}}><CrossSvg/><p style={{fontSize:"1rem",fontWeight:600,color:"#1C1408",marginBottom:5,marginTop:8}}>Thank You & God Bless</p><p style={{fontSize:"9px",letterSpacing:".16em",textTransform:"uppercase",color:"#9A8A60"}}>RSVP Received</p></div>):(
            <>
              <p className="om-rsvp-t">RSVP</p>
              <label className="om-lbl">Full Name *</label>
              <input className="om-input" placeholder="e.g. Mihret Haile" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="om-lbl">Phone *</label>
              <input className="om-input" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="om-lbl">Attendance</label>
              <div className="om-att">{(["yes","no","maybe"] as const).map(v=><button key={v} onClick={()=>rsvp.update("attending",v)} className={`om-att-btn${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}</button>)}</div>
              <label className="om-lbl">Guests</label>
              <select className="om-input" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="om-lbl">Message to the Couple</label>
              <textarea className="om-input" rows={3} style={{resize:"none"}} placeholder="Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="om-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP"}</button>
            </>
          )}
        </div>

        <div className="om-footer">
          <CrossSvg/>
          <p className="om-footer-am">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="om-footer-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="om-top"/>
      </div>
    </>
  );
}