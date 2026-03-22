"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCountdown, useRSVP, getEthiopianDate } from "@/lib/hooks";

// ─── TEMPLATE 9: Story / Photo Wedding ───────────────────────────────────────
// Style: Image-heavy, timeline-based, romantic — warm blush/rose palette
// Audience: Romantic couples — paid tier

export default function StoryPhotoTemplate({ data }: { data: any }) {
  const cd = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const eth = getEthiopianDate(data.date);
  const gc = new Date(data.date);
  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  return (
    <>
      <style>{`
        .sp { background:#FFF8F6; color:#2A1018; font-family:system-ui,-apple-system,sans-serif; max-width:430px; margin:0 auto; overflow-x:hidden; }
        .sp * { box-sizing:border-box; }
        .sp-in { opacity:0; transition:opacity .65s ease; }
        .sp-in.go { opacity:1; }

        /* Rose top bar */
        .sp-top { height:3px; background:linear-gradient(90deg,#E8A0A0,#C8506A,#E8A0A0); }

        /* Full hero */
        .sp-hero { position:relative; height:100vh; min-height:550px; }
        .sp-hero img { width:100%; height:100%; object-fit:cover; display:block; }
        .sp-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(42,16,24,.78) 0%,rgba(42,16,24,.22) 30%,rgba(42,16,24,.12) 52%,rgba(42,16,24,.6) 75%,#FFF8F6 100%); }
        .sp-hero-content { position:absolute; bottom:32px; left:0; right:0; text-align:center; padding:0 24px; z-index:2; }
        .sp-hero-date-pill { display:inline-block; background:rgba(200,80,106,.85); color:#fff; font-size:10px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; padding:6px 16px; border-radius:20px; margin-bottom:14px; }
        .sp-hero-names { font-size:clamp(2.2rem,10vw,3.4rem); font-weight:300; color:#fff; line-height:1.15; }
        .sp-hero-and { font-size:1.1rem; color:rgba(255,200,200,.8); margin:4px 0; }
        .sp-hero-tag { font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.45); margin-top:8px; }

        /* Scripture band */
        .sp-scrip { background:#fff; border-top:1px solid rgba(200,80,106,.18); border-bottom:1px solid rgba(200,80,106,.18); padding:22px 36px; text-align:center; }
        .sp-scrip p { font-size:13px; color:#5A2028; line-height:1.85; font-style:italic; }
        .sp-scrip-ref { font-size:10px; color:#C8506A; margin-top:6px; letter-spacing:.08em; }

        /* Countdown */
        .sp-cd { display:grid; grid-template-columns:repeat(4,1fr); }
        .sp-cdc { text-align:center; padding:18px 4px; background:#FFF0F2; border-right:1px solid rgba(200,80,106,.12); }
        .sp-cdc:last-child { border-right:none; }
        .sp-cdn { font-size:2.2rem; font-weight:300; color:#C8506A; line-height:1; }
        .sp-cdl { font-size:7.5px; letter-spacing:.15em; text-transform:uppercase; color:rgba(200,80,106,.55); margin-top:4px; }

        /* Story section heading */
        .sp-sh { text-align:center; padding:28px 32px 16px; }
        .sp-sh-heart { font-size:1.5rem; margin-bottom:6px; display:block; }
        .sp-sh-title { font-size:1.05rem; font-weight:600; color:#2A1018; }
        .sp-sh-sub { font-size:12px; color:#9A6070; margin-top:3px; }

        /* Full-bleed gallery strip */
        .sp-photo-strip { display:grid; grid-template-columns:1fr 1fr; gap:3px; margin:0 0 4px; }
        .sp-photo-strip-item { aspect-ratio:1; overflow:hidden; }
        .sp-photo-strip-item img { width:100%; height:100%; object-fit:cover; display:block; }
        .sp-photo-strip-wide { height:200px; overflow:hidden; }
        .sp-photo-strip-wide img { width:100%; height:100%; object-fit:cover; display:block; }

        /* Message */
        .sp-msg { padding:20px 32px; background:#fff; text-align:center; }
        .sp-msg-t { font-size:14.5px; font-weight:600; color:#2A1018; margin-bottom:10px; }
        .sp-msg-b { font-size:13px; line-height:1.9; color:#4A2030; }
        .sp-msg-am { font-size:12.5px; line-height:2; color:#6A4050; margin-top:12px; padding-top:12px; border-top:1px solid rgba(200,80,106,.15); }

        /* Details */
        .sp-dets { background:#FFF8F6; border-top:1px solid rgba(200,80,106,.15); border-bottom:1px solid rgba(200,80,106,.15); }
        .sp-det { display:grid; grid-template-columns:48px 1fr; border-bottom:1px solid rgba(200,80,106,.08); }
        .sp-det:last-child { border-bottom:none; }
        .sp-det-ic { display:flex; align-items:center; justify-content:center; font-size:17px; border-right:1px solid rgba(200,80,106,.08); }
        .sp-det-bd { padding:12px 14px; }
        .sp-det-k { font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:#C8506A; margin-bottom:2px; }
        .sp-det-v { font-size:13.5px; color:#2A1018; line-height:1.4; }
        .sp-det-v2 { font-size:11px; color:#7A5060; margin-top:1px; }

        /* Timeline programme */
        .sp-prog { padding:0 22px 22px; }
        .sp-prog-head { text-align:center; padding:20px 0 14px; }
        .sp-prog-head-title { font-size:1rem; font-weight:600; color:#2A1018; }
        .sp-prog-head-sub { font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:#C8506A; margin-top:3px; }
        .sp-pi { display:flex; gap:14px; margin-bottom:4px; align-items:stretch; }
        .sp-pi-line { display:flex; flex-direction:column; align-items:center; flex-shrink:0; width:20px; }
        .sp-pi-dot { width:12px; height:12px; border-radius:50%; background:#C8506A; flex-shrink:0; margin-top:4px; }
        .sp-pi-vl { flex:1; width:2px; background:rgba(200,80,106,.2); margin-top:2px; }
        .sp-pi:last-child .sp-pi-vl { display:none; }
        .sp-pi-body { padding-bottom:16px; flex:1; }
        .sp-pi-time { font-size:10px; font-weight:600; color:#C8506A; margin-bottom:2px; }
        .sp-pi-title { font-size:13.5px; font-weight:600; color:#2A1018; }
        .sp-pi-title-am { font-size:11.5px; color:#9A6070; margin-top:1px; }
        .sp-pi-desc { font-size:11.5px; color:#7A5060; margin-top:3px; line-height:1.5; }

        /* Map */
        .sp-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; margin:0 22px 20px; padding:12px; background:#C8506A; color:#fff; font-size:10.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; text-decoration:none; border-radius:4px; transition:opacity .2s; }
        .sp-map-btn:hover { opacity:.88; }

        /* RSVP */
        .sp-rsvp { margin:0 22px 26px; padding:22px 20px; border:1.5px solid rgba(200,80,106,.3); background:#fff; border-radius:8px; }
        .sp-rsvp-heart { font-size:1.5rem; text-align:center; display:block; margin-bottom:4px; }
        .sp-rsvp-t { font-size:13px; font-weight:700; color:#2A1018; text-align:center; margin-bottom:4px; }
        .sp-rsvp-sub { font-size:11px; color:#9A6070; text-align:center; margin-bottom:16px; }
        .sp-lbl { display:block; font-size:8.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#9A6070; margin-bottom:5px; }
        .sp-input { width:100%; background:#FFF8F6; border:1px solid rgba(200,80,106,.22); color:#2A1018; padding:10px 12px; font-size:13.5px; outline:none; margin-bottom:12px; border-radius:5px; font-family:inherit; transition:border-color .15s; }
        .sp-input:focus { border-color:#C8506A; background:#fff; }
        .sp-input::placeholder { color:#D8A0B0; }
        .sp-input option { background:#FFF8F6; }
        .sp-att { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
        .sp-att-btn { padding:9px 4px; border:1px solid rgba(200,80,106,.22); background:transparent; color:#9A6070; font-size:9px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; border-radius:5px; transition:all .15s; font-family:inherit; }
        .sp-att-btn.on { border-color:#C8506A; color:#C8506A; background:rgba(200,80,106,.06); }
        .sp-submit { width:100%; padding:13px; background:#C8506A; color:#fff; font-size:10.5px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; border:none; cursor:pointer; border-radius:5px; transition:opacity .2s; font-family:inherit; }
        .sp-submit:hover { opacity:.88; }
        .sp-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Footer */
        .sp-footer { background:#C8506A; padding:22px 20px; text-align:center; }
        .sp-footer-nm { font-size:1rem; color:rgba(255,255,255,.65); font-weight:300; }
        .sp-footer-v { font-size:8.5px; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.4); margin-top:5px; }

        .sp-ctrl { position:fixed; top:12px; right:12px; display:flex; gap:7px; z-index:100; }
        .sp-ctrl-btn { background:rgba(255,248,246,.92); border:1px solid rgba(200,80,106,.35); color:#C8506A; font-size:10px; font-weight:600; padding:6px 10px; cursor:pointer; border-radius:4px; font-family:inherit; }

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(255,200,180,.85); }
          50%      { text-shadow: 0 2px 40px rgba(255,200,180,.85), 0 0 80px rgba(255,200,180,.35); }
        }
        .sp-hero-names { animation: name-glow 3.5s ease-in-out infinite; }
      
        @keyframes sp-glow {
          0%,100% { text-shadow: 0 2px 22px rgba(200,80,106,.85); }
          50%      { text-shadow: 0 2px 44px rgba(200,80,106,.85), 0 0 90px rgba(200,80,106,0.3); }
        }
        .sp-hero-names { animation: sp-glow 3.5s ease-in-out infinite; }
        .sp-grain-fx {
          position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
      `}</style>

      <div className={`sp sp-in${ready?" go":""}`}>
        <div className="sp-ctrl">
          {data.audioUrl&&<button className="sp-ctrl-btn" onClick={()=>{if(muted){audioRef.current?.play();setMuted(false);}else{audioRef.current?.pause();setMuted(true);}}}>{muted?"🔇":"🔊"}</button>}
        </div>

        <div className="sp-top"/>

        {/* Full hero */}
        <div className="sp-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="sp-hero-ov"/>
          <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.04,backgroundImage:"radial-gradient(circle,rgba(200,80,106,.5) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
          <div className="sp-vig-inner" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 100px rgba(42,16,24,0.45)",pointerEvents:"none",zIndex:3}}/>
          <div className="sp-hero-content">
            <span className="sp-hero-date-pill">{gc.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
            <p className="sp-hero-names">{data.groomName}</p>
            <p className="sp-hero-and">♡</p>
            <p className="sp-hero-names">{data.brideName}</p>
            <p className="sp-hero-tag">Our Love Story</p>
          </div>
        </div>

        {/* Scripture */}
        {data.scripture&&<div className="sp-scrip"><p>{data.scripture}</p>{data.scriptureRef&&<p className="sp-scrip-ref">{data.scriptureRef}</p>}</div>}

        {/* Countdown */}
        <div className="sp-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="sp-cdc"><p className="sp-cdn">{String(n).padStart(2,"0")}</p><p className="sp-cdl">{l}</p></div>
          ))}
        </div>

        {/* Photo gallery strip */}
        {data.galleryImages?.length >= 2 && (
          <>
            <div className="sp-photo-strip">
              {data.galleryImages.slice(0,2).map((src:string,i:number)=>(
                <div key={i} className="sp-photo-strip-item"><img src={src} alt=""/></div>
              ))}
            </div>
            {data.galleryImages[2]&&<div className="sp-photo-strip-wide"><img src={data.galleryImages[2]} alt=""/></div>}
          </>
        )}

        {/* Message */}
        <div className="sp-msg">
          <span className="sp-sh-heart">💍</span>
          <p className="sp-msg-t">{data.greetingTitle}</p>
          <p className="sp-msg-b">{data.messageBody}</p>
          {data.messageBodyAm&&<p className="sp-msg-am">{data.messageBodyAm}</p>}
        </div>

        {/* Details */}
        <div className="sp-dets">
          {[
            {ic:"📅",k:"Wedding Date",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),v2:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {ic:"⏰",k:"Time",v:data.timeEn,v2:data.timeAm??""},
            {ic:"🏛️",k:"Venue",v:data.venue,v2:""},
            {ic:"📍",k:"Location",v:data.venueAddress,v2:""},
          ].map(r=>(
            <div key={r.k} className="sp-det">
              <div className="sp-det-ic">{r.ic}</div>
              <div className="sp-det-bd"><p className="sp-det-k">{r.k}</p><p className="sp-det-v">{r.v}</p>{r.v2&&<p className="sp-det-v2">{r.v2}</p>}</div>
            </div>
          ))}
        </div>

        {/* Programme as timeline */}
        {data.program?.length>0&&(
          <div className="sp-prog">
            <div className="sp-prog-head">
              <p className="sp-prog-head-title">The Wedding Day</p>
              <p className="sp-prog-head-sub">Order of Events</p>
            </div>
            {data.program.map((item:any,i:number)=>(
              <div key={i} className="sp-pi">
                <div className="sp-pi-line"><div className="sp-pi-dot"/><div className="sp-pi-vl"/></div>
                <div className="sp-pi-body">
                  <p className="sp-pi-time">{item.time}{item.timeAm?` · ${item.timeAm}`:""}</p>
                  <p className="sp-pi-title">{item.title}</p>
                  {item.titleAm&&<p className="sp-pi-title-am">{item.titleAm}</p>}
                  <p className="sp-pi-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.venueMapLink&&<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="sp-map-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>}

        <div className="sp-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"14px 0"}}><span style={{fontSize:"1.5rem",display:"block",marginBottom:8}}>💌</span><p style={{fontSize:"1rem",fontWeight:600,color:"#2A1018",marginBottom:4}}>Thank You!</p><p style={{fontSize:"11px",color:"#9A6070"}}>We can't wait to celebrate with you</p></div>):(
            <>
              <span className="sp-rsvp-heart">💌</span>
              <p className="sp-rsvp-t">Will You Join Us?</p>
              <p className="sp-rsvp-sub">Please reply by {gc.toLocaleDateString("en-US",{month:"long",day:"numeric"})}</p>
              <label className="sp-lbl">Your Name *</label>
              <input className="sp-input" placeholder="e.g. Sara Alemu" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="sp-lbl">Phone *</label>
              <input className="sp-input" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="sp-lbl">Are You Coming?</label>
              <div className="sp-att">{(["yes","no","maybe"] as const).map(v=><button key={v} onClick={()=>rsvp.update("attending",v)} className={`sp-att-btn${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Joyfully yes":v==="no"?"✗ Regrettably no":"? Maybe"}</button>)}</div>
              <label className="sp-lbl">Guests</label>
              <select className="sp-input" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="sp-lbl">A message for the couple</label>
              <textarea className="sp-input" rows={3} style={{resize:"none"}} placeholder="Share your love and wishes…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="sp-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Send RSVP 💌"}</button>
            </>
          )}
        </div>

        <div className="sp-footer">
          <p className="sp-footer-nm">{data.groomName} & {data.brideName}</p>
          <p className="sp-footer-v">{data.venue} · {gc.getFullYear()}</p>
        </div>
        <div className="sp-top"/>
      </div>
    </>
  );
}