"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCountdown, useRSVP, useLang, getEthiopianDate } from "@/lib/hooks";

// ─── TEMPLATE 2: Habesha Royal ────────────────────────────────────────────────
// Style: Navy/black + gold, premium luxury aesthetic
// Audience: Luxury Ethiopian weddings
// Dark full-bleed hero, large script names, gold details, minimal text

export default function HasbeshaRoyalTemplate({ data }: { data: any }) {
  const cd = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const { lang, toggle } = useLang();
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const eth = getEthiopianDate(data.date);
  const gc = new Date(data.date);
  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  return (
    <>
      <style>{`
        .hbr { background:#0A0A14; color:#F0EAD8; font-family:system-ui,-apple-system,sans-serif; max-width:430px; margin:0 auto; overflow-x:hidden; }
        .hbr * { box-sizing:border-box; }
        .hbr-in { opacity:0; transition:opacity .7s ease; }
        .hbr-in.go { opacity:1; }

        /* Gold top line */
        .hbr-topline { height:3px; background:linear-gradient(90deg,transparent,#C4941A,transparent); }

        /* Full bleed hero */
        .hbr-hero { position:relative; height:92vh; min-height:500px; }
        .hbr-hero img { width:100%; height:100%; object-fit:cover; display:block; }
        .hbr-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(10,10,20,.92) 0%,rgba(10,10,20,.24) 28%,rgba(10,10,20,.14) 50%,rgba(10,10,20,.68) 74%,#0A0A14 100%); }

        /* Names overlay */
        .hbr-names-ov { position:absolute; bottom:0; left:0; right:0; padding:0 28px 32px; z-index:2; text-align:center; }
        .hbr-crown { display:block; margin:0 auto 10px; }
        .hbr-name { font-size:clamp(2rem,9vw,3rem); font-weight:300; color:#fff; letter-spacing:.06em; line-height:1.15; }
        .hbr-name-am { font-size:clamp(1.5rem,7vw,2.2rem); font-weight:400; color:#C4941A; }
        .hbr-and { font-size:1.2rem; color:rgba(196,148,26,.7); margin:6px 0; letter-spacing:.2em; }
        .hbr-tag { font-size:9px; letter-spacing:.32em; text-transform:uppercase; color:rgba(240,234,216,.4); margin-top:10px; }

        /* Gold rule */
        .hbr-rule { display:flex; align-items:center; gap:10px; padding:0 28px; margin:24px 0; }
        .hbr-rl { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(196,148,26,.45),transparent); }
        .hbr-diamond { width:6px; height:6px; background:#C4941A; transform:rotate(45deg); flex-shrink:0; }

        /* Scripture */
        .hbr-scrip { text-align:center; padding:0 36px 20px; }
        .hbr-scrip p { font-size:13px; color:rgba(240,234,216,.62); line-height:1.8; font-style:italic; }
        .hbr-scrip-ref { font-size:10px; letter-spacing:.14em; color:rgba(196,148,26,.55); margin-top:6px; }

        /* Date */
        .hbr-date { display:grid; grid-template-columns:1fr 1px 1fr 1px 1fr; background:rgba(255,255,255,.04); border-top:1px solid rgba(196,148,26,.15); border-bottom:1px solid rgba(196,148,26,.15); }
        .hbr-dc { text-align:center; padding:20px 8px; }
        .hbr-ds { background:rgba(196,148,26,.2); margin:16px 0; }
        .hbr-dc-lbl { font-size:7.5px; letter-spacing:.22em; text-transform:uppercase; color:rgba(196,148,26,.6); margin-bottom:6px; }
        .hbr-dc-big { font-size:2.2rem; font-weight:300; color:#fff; line-height:1; }
        .hbr-dc-sub { font-size:10px; color:rgba(240,234,216,.5); margin-top:4px; }
        .hbr-dc-eth { font-size:10px; color:rgba(196,148,26,.55); margin-top:2px; }

        /* Countdown */
        .hbr-cd { display:grid; grid-template-columns:repeat(4,1fr); }
        .hbr-cdc { text-align:center; padding:16px 4px; background:rgba(0,0,0,.4); border-right:1px solid rgba(196,148,26,.08); }
        .hbr-cdc:last-child { border-right:none; }
        .hbr-cdn { font-size:2.2rem; font-weight:300; color:#C4941A; line-height:1; }
        .hbr-cdl { font-size:7px; letter-spacing:.2em; text-transform:uppercase; color:rgba(240,234,216,.28); margin-top:4px; }

        /* Message */
        .hbr-msg { padding:0 32px 24px; text-align:center; }
        .hbr-msg-t { font-size:14px; font-weight:600; color:#F0EAD8; margin-bottom:10px; }
        .hbr-msg-b { font-size:13px; line-height:1.9; color:rgba(240,234,216,.65); }

        /* Details */
        .hbr-dets { background:rgba(255,255,255,.03); }
        .hbr-det { display:grid; grid-template-columns:50px 1fr; border-bottom:1px solid rgba(196,148,26,.09); }
        .hbr-det:last-child { border-bottom:none; }
        .hbr-det-ic { display:flex; align-items:center; justify-content:center; font-size:17px; border-right:1px solid rgba(196,148,26,.09); }
        .hbr-det-bd { padding:13px 14px; }
        .hbr-det-k { font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:rgba(196,148,26,.65); margin-bottom:3px; }
        .hbr-det-v { font-size:13.5px; color:#F0EAD8; line-height:1.4; }
        .hbr-det-v2 { font-size:11px; color:rgba(240,234,216,.45); margin-top:2px; }

        /* Programme */
        .hbr-prog { padding:0 20px 22px; }
        .hbr-pi { display:grid; grid-template-columns:68px 1fr; margin-bottom:2px; }
        .hbr-pt { text-align:right; padding:11px 11px 11px 0; border-right:1.5px solid rgba(196,148,26,.25); }
        .hbr-pt-am { font-size:11.5px; color:#C4941A; }
        .hbr-pt-en { font-size:9.5px; color:rgba(240,234,216,.35); margin-top:1px; }
        .hbr-pb { padding:11px 0 11px 14px; position:relative; }
        .hbr-pdot { position:absolute; left:-5px; top:50%; transform:translateY(-50%); width:8px; height:8px; background:#C4941A; border-radius:50%; }
        .hbr-pb-t { font-size:13px; font-weight:500; color:#F0EAD8; }
        .hbr-pb-am { font-size:11.5px; color:rgba(196,148,26,.65); margin-top:1px; }
        .hbr-pb-d { font-size:11px; color:rgba(240,234,216,.4); margin-top:2px; }

        /* Map */
        .hbr-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; margin:0 20px 20px; padding:12px; border:1px solid rgba(196,148,26,.35); color:#C4941A; font-size:10px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; text-decoration:none; transition:background .2s; }
        .hbr-map-btn:hover { background:rgba(196,148,26,.08); }

        /* RSVP */
        .hbr-rsvp { margin:0 20px 28px; padding:22px 20px; border:1px solid rgba(196,148,26,.25); background:rgba(255,255,255,.03); }
        .hbr-rsvp-t { font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:#C4941A; text-align:center; margin-bottom:20px; }
        .hbr-lbl { display:block; font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:rgba(240,234,216,.38); margin-bottom:5px; }
        .hbr-input { width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(196,148,26,.2); color:#F0EAD8; padding:10px 12px; font-size:13.5px; outline:none; margin-bottom:12px; border-radius:3px; font-family:inherit; transition:border-color .15s; }
        .hbr-input:focus { border-color:#C4941A; }
        .hbr-input::placeholder { color:rgba(240,234,216,.2); }
        .hbr-input option { background:#0A0A14; }
        .hbr-att { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
        .hbr-att-btn { padding:9px 4px; border:1px solid rgba(196,148,26,.2); background:transparent; color:rgba(240,234,216,.4); font-size:9px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; border-radius:3px; transition:all .15s; font-family:inherit; }
        .hbr-att-btn.on { border-color:#C4941A; color:#C4941A; background:rgba(196,148,26,.07); }
        .hbr-submit { width:100%; padding:13px; background:#C4941A; color:#0A0A14; font-size:10px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; border:none; cursor:pointer; border-radius:3px; transition:opacity .2s; font-family:inherit; }
        .hbr-submit:hover { opacity:.9; }
        .hbr-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Footer */
        .hbr-footer { background:rgba(0,0,0,.4); border-top:1px solid rgba(196,148,26,.18); padding:22px 20px; text-align:center; }
        .hbr-footer-am { font-size:.95rem; color:rgba(196,148,26,.65); }
        .hbr-footer-v { font-size:8.5px; letter-spacing:.14em; text-transform:uppercase; color:rgba(240,234,216,.22); margin-top:5px; }

        .hbr-ctrl { position:fixed; top:12px; right:12px; display:flex; gap:7px; z-index:100; }
        .hbr-ctrl-btn { background:rgba(10,10,20,.9); border:1px solid rgba(196,148,26,.4); color:#C4941A; font-size:10px; font-weight:600; padding:6px 10px; cursor:pointer; border-radius:3px; font-family:inherit; }

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(196,148,26,.85); }
          50%      { text-shadow: 0 2px 40px rgba(196,148,26,.85), 0 0 80px rgba(196,148,26,.35); }
        }
        .hbr-name-am { animation: name-glow 3.5s ease-in-out infinite; }
      
        @keyframes hbr-glow {
          0%,100% { text-shadow: 0 2px 22px rgba(196,148,26,.9); }
          50%      { text-shadow: 0 2px 44px rgba(196,148,26,.9), 0 0 90px rgba(196,148,26,0.32); }
        }
        .hbr-name-am { animation: hbr-glow 3.5s ease-in-out infinite; }
        .hbr-grain-fx {
          position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
      `}</style>

      <div className={`hbr hbr-in${ready?" go":""}`}>
        <div className="hbr-ctrl">
          {data.audioUrl && <button className="hbr-ctrl-btn" onClick={()=>{if(muted){audioRef.current?.play();setMuted(false);}else{audioRef.current?.pause();setMuted(true);}}}>{muted?"🔇":"🔊"}</button>}
          <button className="hbr-ctrl-btn" onClick={toggle}>{lang==="en"?"አማ":"EN"}</button>
        </div>

        <div className="hbr-topline"/>

        <div className="hbr-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="hbr-hero-ov"/>
          <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.04,backgroundImage:"linear-gradient(rgba(196,148,26,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(196,148,26,.4) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
          <div className="hbr-vig-inner" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 100px rgba(0,0,0,0.6)",pointerEvents:"none",zIndex:3}}/>
          <div className="hbr-names-ov">
            {/* Crown SVG */}
            <svg className="hbr-crown" viewBox="0 0 48 28" width="42" height="24" fill="none">
              <path d="M4 24L8 8l10 10 6-14 6 14 10-10 4 16H4z" fill="#C4941A" opacity=".7"/>
              <circle cx="4" cy="8" r="2.5" fill="#C4941A"/>
              <circle cx="24" cy="4" r="2.5" fill="#C4941A"/>
              <circle cx="44" cy="8" r="2.5" fill="#C4941A"/>
              <line x1="4" y1="24" x2="44" y2="24" stroke="#C4941A" strokeWidth="1.5" opacity=".5"/>
            </svg>
            <p className="hbr-name-am">{lang==="am"&&data.groomNameAm?data.groomNameAm:data.groomName}</p>
            <p className="hbr-and">—&amp;—</p>
            <p className="hbr-name-am">{lang==="am"&&data.brideNameAm?data.brideNameAm:data.brideName}</p>
            <p className="hbr-name" style={{fontSize:"1rem",marginTop:4}}>{data.groomName} & {data.brideName}</p>
            <p className="hbr-tag">Royal Wedding Celebration</p>
          </div>
        </div>

        {data.scripture&&<div className="hbr-scrip" style={{paddingTop:22}}><p>{data.scripture}</p>{data.scriptureRef&&<p className="hbr-scrip-ref">{data.scriptureRef}</p>}</div>}

        <div className="hbr-rule"><div className="hbr-rl"/><div className="hbr-diamond"/><div className="hbr-rl"/></div>

        <div className="hbr-date">
          <div className="hbr-dc"><p className="hbr-dc-lbl">Day</p><p className="hbr-dc-big">{gc.getDate()}</p><p className="hbr-dc-sub">{gc.toLocaleString("en-US",{weekday:"short"}).toUpperCase()}</p></div>
          <div className="hbr-ds"/>
          <div className="hbr-dc"><p className="hbr-dc-lbl">Month</p><p className="hbr-dc-big" style={{fontSize:"1.5rem",marginTop:4}}>{gc.toLocaleString("en-US",{month:"short"}).toUpperCase()}</p><p className="hbr-dc-sub">{gc.getFullYear()}</p><p className="hbr-dc-eth">{eth.day} {eth.monthAm}</p></div>
          <div className="hbr-ds"/>
          <div className="hbr-dc"><p className="hbr-dc-lbl">Time</p><p className="hbr-dc-big" style={{fontSize:"1.3rem",marginTop:4}}>{data.timeEn}</p>{data.timeAm&&<p className="hbr-dc-eth">{data.timeAm}</p>}</div>
        </div>

        <div className="hbr-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="hbr-cdc"><p className="hbr-cdn">{String(n).padStart(2,"0")}</p><p className="hbr-cdl">{l}</p></div>
          ))}
        </div>

        <div className="hbr-rule" style={{marginTop:24}}><div className="hbr-rl"/><div className="hbr-diamond"/><div className="hbr-rl"/></div>

        <div className="hbr-msg">
          <p className="hbr-msg-t">{lang==="am"&&data.greetingTitleAm?data.greetingTitleAm:data.greetingTitle}</p>
          <p className="hbr-msg-b">{lang==="am"&&data.messageBodyAm?data.messageBodyAm:data.messageBody}</p>
        </div>

        <div className="hbr-dets">
          {[
            {ic:"📅",k:"Date",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),v2:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {ic:"⏰",k:"Time",v:data.timeEn,v2:data.timeAm??""},
            {ic:"🏛️",k:"Venue",v:data.venue,v2:""},
            {ic:"📍",k:"Location",v:data.venueAddress,v2:""},
          ].map(r=>(
            <div key={r.k} className="hbr-det">
              <div className="hbr-det-ic">{r.ic}</div>
              <div className="hbr-det-bd">
                <p className="hbr-det-k">{r.k}</p>
                <p className="hbr-det-v">{r.v}</p>
                {r.v2&&<p className="hbr-det-v2">{r.v2}</p>}
              </div>
            </div>
          ))}
        </div>

        {data.program?.length>0&&(
          <>
            <div className="hbr-rule" style={{margin:"22px 0 16px"}}><div className="hbr-rl"/><div className="hbr-diamond"/><div className="hbr-rl"/></div>
            <div style={{textAlign:"center",padding:"0 20px 14px"}}><p style={{fontSize:"9px",letterSpacing:".22em",textTransform:"uppercase",color:"rgba(196,148,26,.65)"}}>Programme · የዕለቱ ፕሮግራም</p></div>
            <div className="hbr-prog">
              {data.program.map((item:any,i:number)=>(
                <div key={i} className="hbr-pi">
                  <div className="hbr-pt"><p className="hbr-pt-am">{item.timeAm??item.time}</p><p className="hbr-pt-en">{item.time}</p></div>
                  <div className="hbr-pb">
                    <div className="hbr-pdot"/>
                    <p className="hbr-pb-t">{item.title}</p>
                    {item.titleAm&&<p className="hbr-pb-am">{item.titleAm}</p>}
                    <p className="hbr-pb-d">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {data.venueMapLink&&<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="hbr-map-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>}

        <div className="hbr-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"16px 0"}}><p style={{fontSize:"1rem",color:"#C4941A",marginBottom:5}}>አስቀድሞ እናመሰግናለን!</p><p style={{fontSize:"9px",letterSpacing:".16em",textTransform:"uppercase",color:"rgba(240,234,216,.4)"}}>RSVP Received</p></div>):(
            <>
              <p className="hbr-rsvp-t">Confirm Attendance · ምዝገባ</p>
              <label className="hbr-lbl">Full Name *</label>
              <input className="hbr-input" placeholder="e.g. Tigist Bekele" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="hbr-lbl">Phone *</label>
              <input className="hbr-input" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="hbr-lbl">Attendance</label>
              <div className="hbr-att">{(["yes","no","maybe"] as const).map(v=><button key={v} onClick={()=>rsvp.update("attending",v)} className={`hbr-att-btn${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}</button>)}</div>
              <label className="hbr-lbl">Guests</label>
              <select className="hbr-input" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="hbr-lbl">Message to the Couple</label>
              <textarea className="hbr-input" rows={3} style={{resize:"none"}} placeholder="Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="hbr-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP"}</button>
            </>
          )}
        </div>

        <div className="hbr-footer">
          <p className="hbr-footer-am">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="hbr-footer-v">{data.venue} · Royal Wedding</p>
        </div>
        <div className="hbr-topline"/>
      </div>
    </>
  );
}