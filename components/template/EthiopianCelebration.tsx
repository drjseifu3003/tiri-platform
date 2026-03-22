"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCountdown, useRSVP, useLang, getEthiopianDate, getCalendarDays } from "@/lib/hooks";

// ─── TEMPLATE 3: Ethiopian Celebration ───────────────────────────────────────
// Style: Ethiopian flag colors (Green/Yellow/Red), bold & energetic, festive
// Audience: Festive, joyful Ethiopian weddings

export default function EthiopianCelebrationTemplate({ data }: { data: any }) {
  const cd = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const { lang, toggle } = useLang();
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const eth = getEthiopianDate(data.date);
  const { year, weddingDay, firstDay, daysInMonth, monthName } = getCalendarDays(data.date);
  const gc = new Date(data.date);
  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  const cells: (number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  return (
    <>
      <style>{`
        .ec { background:#FFFEF8; color:#1A1A00; font-family:system-ui,-apple-system,sans-serif; max-width:430px; margin:0 auto; overflow-x:hidden; }
        .ec * { box-sizing:border-box; }
        .ec-in { opacity:0; transition:opacity .6s ease; }
        .ec-in.go { opacity:1; }

        /* Ethiopian flag stripe */
        .ec-flag { display:flex; height:10px; }
        .ec-flag-g { flex:1; background:#078930; }
        .ec-flag-y { flex:1; background:#FCDD09; }
        .ec-flag-r { flex:1; background:#DA121A; }

        /* Hero */
        .ec-hero { position:relative; height:92vh; min-height:360px; }
        .ec-hero img { width:100%; height:100%; object-fit:cover; display:block; }
        .ec-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(7,137,48,.78) 0%,rgba(7,60,20,.2) 28%,rgba(218,18,26,.1) 50%,rgba(7,60,20,.62) 74%,#FFFEF8 100%); }

        /* Bold header */
        .ec-header { background:#078930; padding:20px 24px; text-align:center; }
        .ec-header-am { font-size:clamp(2.2rem,10vw,3.2rem); font-weight:700; color:#FCDD09; letter-spacing:-.01em; line-height:1; }
        .ec-header-en { font-size:10px; font-weight:600; letter-spacing:.28em; text-transform:uppercase; color:rgba(255,255,255,.7); margin-top:6px; }

        /* Yellow stripe */
        .ec-stripe-y { height:8px; background:#FCDD09; }
        .ec-stripe-r { height:8px; background:#DA121A; }

        /* Scripture */
        .ec-scrip { background:#fff; border-bottom:3px solid #078930; padding:18px 32px; text-align:center; }
        .ec-scrip p { font-size:13px; color:#1A3A10; line-height:1.75; font-style:italic; }
        .ec-scrip-ref { font-size:10.5px; color:#078930; margin-top:6px; font-weight:600; }

        /* Names — big bold */
        .ec-names { background:#FFFEF8; padding:24px 24px 16px; text-align:center; }
        .ec-name-am { font-size:clamp(1.6rem,7.5vw,2.4rem); font-weight:700; color:#1A1A00; line-height:1.25; }
        .ec-name-and { font-size:1.8rem; color:#DA121A; font-weight:700; margin:4px 0; }
        .ec-name-en { font-size:11px; letter-spacing:.1em; color:#6A6A30; margin-top:4px; }

        /* Date — bold colorful */
        .ec-date-wrap { display:flex; flex-direction:column; margin:0; }
        .ec-date-top { background:#DA121A; padding:14px 24px 10px; text-align:center; }
        .ec-date-inshallah { font-size:9px; letter-spacing:.24em; text-transform:uppercase; color:rgba(255,255,255,.7); margin-bottom:8px; }
        .ec-date-main { display:flex; align-items:center; justify-content:center; gap:12px; }
        .ec-date-num { font-size:3.5rem; font-weight:700; color:#FCDD09; line-height:1; }
        .ec-date-vsep { width:2px; height:50px; background:rgba(255,255,255,.3); }
        .ec-date-right { text-align:left; }
        .ec-date-month { font-size:1.4rem; font-weight:700; color:#fff; letter-spacing:.04em; }
        .ec-date-year { font-size:13px; color:rgba(255,255,255,.7); }
        .ec-date-eth { font-size:11px; color:rgba(252,221,9,.8); margin-top:2px; }
        .ec-date-bottom { background:#078930; padding:8px 24px; display:flex; align-items:center; justify-content:center; gap:8px; }
        .ec-date-time { font-size:12px; font-weight:600; color:#fff; }
        .ec-date-time-am { font-size:11px; color:rgba(252,221,9,.8); }
        .ec-date-day { font-size:11px; color:rgba(255,255,255,.65); }

        /* Countdown */
        .ec-cd { display:grid; grid-template-columns:repeat(4,1fr); }
        .ec-cdc { text-align:center; padding:16px 4px; background:#FCDD09; border-right:2px solid #fff; }
        .ec-cdc:last-child { border-right:none; }
        .ec-cdn { font-size:2.2rem; font-weight:700; color:#1A1A00; line-height:1; }
        .ec-cdl { font-size:8px; letter-spacing:.14em; text-transform:uppercase; color:#4A4A00; margin-top:4px; }

        /* Calendar */
        .ec-cal { background:#fff; border-top:3px solid #DA121A; padding:0 18px 18px; }
        .ec-cal-head { text-align:center; padding:14px 0 12px; }
        .ec-cal-month { font-size:1.4rem; font-weight:700; color:#1A1A00; }
        .ec-cal-eth { font-size:11px; color:#078930; margin-top:3px; }
        .ec-cal-dh { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:4px; }
        .ec-cal-dhc { text-align:center; font-size:8px; font-weight:700; letter-spacing:.08em; color:#6A6A30; padding:3px 0; }
        .ec-cal-days { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
        .ec-cal-day { aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:13px; color:#2A2A10; border-radius:50%; }
        .ec-cal-day.wed { background:#DA121A; color:#fff; font-weight:700; }

        /* Message */
        .ec-msg { padding:20px 28px; text-align:center; border-top:3px solid #078930; }
        .ec-msg-t { font-size:14.5px; font-weight:700; color:#1A1A00; margin-bottom:10px; }
        .ec-msg-b { font-size:13px; line-height:1.85; color:#3A3A10; }
        .ec-msg-b-am { font-size:12px; line-height:2; color:#5A5A20; margin-top:12px; padding-top:12px; border-top:1px solid rgba(7,137,48,.2); }

        /* Details */
        .ec-dets { background:#FFFEF8; border-top:2px solid #FCDD09; }
        .ec-det { display:grid; grid-template-columns:48px 1fr; border-bottom:1px solid rgba(7,137,48,.1); }
        .ec-det:last-child { border-bottom:none; }
        .ec-det-ic { display:flex; align-items:center; justify-content:center; font-size:18px; border-right:1px solid rgba(7,137,48,.1); }
        .ec-det-bd { padding:12px 14px; }
        .ec-det-k { font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:#078930; margin-bottom:2px; font-weight:600; }
        .ec-det-v { font-size:13.5px; color:#1A1A00; line-height:1.4; }
        .ec-det-v2 { font-size:11px; color:#6A6A30; margin-top:1px; }

        /* Programme */
        .ec-prog { padding:0 18px 20px; }
        .ec-pi { display:grid; grid-template-columns:68px 1fr; margin-bottom:2px; }
        .ec-pt { text-align:right; padding:11px 11px 11px 0; border-right:3px solid #078930; }
        .ec-pt-am { font-size:11.5px; color:#078930; font-weight:600; }
        .ec-pt-en { font-size:9.5px; color:#6A6A30; margin-top:1px; }
        .ec-pb { padding:11px 0 11px 13px; position:relative; }
        .ec-pdot { position:absolute; left:-5px; top:50%; transform:translateY(-50%); width:8px; height:8px; background:#DA121A; border-radius:50%; }
        .ec-pb-t { font-size:13px; font-weight:700; color:#1A1A00; }
        .ec-pb-am { font-size:11.5px; color:#078930; margin-top:1px; }
        .ec-pb-d { font-size:11px; color:#6A6A30; margin-top:2px; }

        /* Map */
        .ec-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; margin:0 18px 18px; padding:13px; background:#078930; color:#fff; font-size:11px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; text-decoration:none; border:none; cursor:pointer; width:calc(100% - 36px); transition:opacity .2s; }
        .ec-map-btn:hover { opacity:.88; }

        /* RSVP */
        .ec-rsvp { margin:0 18px 26px; padding:20px 18px; border:3px solid #078930; background:#fff; }
        .ec-rsvp-t { font-size:13px; font-weight:700; color:#1A1A00; text-align:center; margin-bottom:4px; }
        .ec-rsvp-am { font-size:11.5px; color:#078930; text-align:center; margin-bottom:16px; }
        .ec-lbl { display:block; font-size:9.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#6A6A30; margin-bottom:5px; }
        .ec-input { width:100%; background:#FFFEF8; border:2px solid rgba(7,137,48,.25); color:#1A1A00; padding:10px 12px; font-size:13.5px; outline:none; margin-bottom:12px; border-radius:4px; font-family:inherit; transition:border-color .15s; }
        .ec-input:focus { border-color:#078930; background:#fff; }
        .ec-input::placeholder { color:#A0A070; }
        .ec-input option { background:#FFFEF8; }
        .ec-att { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
        .ec-att-btn { padding:9px 4px; border:2px solid rgba(7,137,48,.25); background:transparent; color:#6A6A30; font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; border-radius:4px; transition:all .15s; font-family:inherit; }
        .ec-att-btn.on { border-color:#078930; color:#078930; background:rgba(7,137,48,.07); }
        .ec-submit { width:100%; padding:13px; background:#DA121A; color:#fff; font-size:11px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; border:none; cursor:pointer; border-radius:4px; transition:opacity .2s; font-family:inherit; }
        .ec-submit:hover { opacity:.88; }
        .ec-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Footer */
        .ec-footer { background:#078930; padding:20px; text-align:center; }
        .ec-footer-am { font-size:.95rem; color:#FCDD09; font-weight:700; }
        .ec-footer-v { font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.55); margin-top:5px; }

        .ec-ctrl { position:fixed; top:12px; right:12px; display:flex; gap:7px; z-index:100; }
        .ec-ctrl-btn { background:rgba(255,254,248,.92); border:2px solid #078930; color:#078930; font-size:10px; font-weight:700; padding:6px 10px; cursor:pointer; border-radius:4px; font-family:inherit; }

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(252,221,9,.85); }
          50%      { text-shadow: 0 2px 40px rgba(252,221,9,.85), 0 0 80px rgba(252,221,9,.35); }
        }
        .ec-header-am { animation: name-glow 3.5s ease-in-out infinite; }
      
        @keyframes ec-glow {
          0%,100% { text-shadow: 0 2px 22px rgba(252,221,9,.9); }
          50%      { text-shadow: 0 2px 44px rgba(252,221,9,.9), 0 0 90px rgba(252,221,9,0.32); }
        }
        .ec-header-am { animation: ec-glow 3.5s ease-in-out infinite; }
        .ec-grain-fx {
          position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
      `}</style>

      <div className={`ec ec-in${ready?" go":""}`}>
        <div className="ec-ctrl">
          {data.audioUrl&&<button className="ec-ctrl-btn" onClick={()=>{if(muted){audioRef.current?.play();setMuted(false);}else{audioRef.current?.pause();setMuted(true);}}}>{muted?"🔇":"🔊"}</button>}
          <button className="ec-ctrl-btn" onClick={toggle}>{lang==="en"?"አማ":"EN"}</button>
        </div>

        <div className="ec-flag"><div className="ec-flag-g"/><div className="ec-flag-y"/><div className="ec-flag-r"/></div>

        <div className="ec-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="ec-hero-ov"/>
          <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.05,backgroundImage:"repeating-linear-gradient(45deg,rgba(252,221,9,.6) 0px,rgba(252,221,9,.6) 1px,transparent 1px,transparent 22px)",backgroundSize:"24px 24px"}}/>
          <div className="ec-vig-inner" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 100px rgba(0,0,0,0.4)",pointerEvents:"none",zIndex:3}}/>
        </div>

        <div className="ec-header">
          <p className="ec-header-am">ዛሬ!</p>
          <p className="ec-header-en">Wedding Celebration · Ethiopia</p>
        </div>
        <div className="ec-stripe-y"/><div className="ec-stripe-r"/>

        {data.scripture&&<div className="ec-scrip"><p>{data.scripture}</p>{data.scriptureRef&&<p className="ec-scrip-ref">{data.scriptureRef}</p>}</div>}

        <div className="ec-names">
          <p className="ec-name-am">{lang==="am"&&data.groomNameAm?data.groomNameAm:data.groomName}</p>
          <p className="ec-name-and">❤</p>
          <p className="ec-name-am">{lang==="am"&&data.brideNameAm?data.brideNameAm:data.brideName}</p>
          <p className="ec-name-en">{data.groomName} & {data.brideName}</p>
        </div>

        <div className="ec-date-wrap">
          <div className="ec-date-top">
            <p className="ec-date-inshallah">እግዚአብሔር ፈቃዱ ሆኖ · Inshallah On</p>
            <div className="ec-date-main">
              <p className="ec-date-num">{gc.getDate()}</p>
              <div className="ec-date-vsep"/>
              <div className="ec-date-right">
                <p className="ec-date-month">{gc.toLocaleString("en-US",{month:"long"}).toUpperCase()}</p>
                <p className="ec-date-year">{gc.getFullYear()}</p>
                <p className="ec-date-eth">{eth.day} {eth.monthAm} {eth.year} ዓ.ም</p>
              </div>
            </div>
          </div>
          <div className="ec-date-bottom">
            <p className="ec-date-day">{gc.toLocaleString("en-US",{weekday:"long"})}</p>
            <span style={{color:"rgba(255,255,255,.4)"}}>·</span>
            <p className="ec-date-time">{data.timeEn}</p>
            {data.timeAm&&<><span style={{color:"rgba(255,255,255,.4)"}}>·</span><p className="ec-date-time-am">{data.timeAm}</p></>}
          </div>
        </div>

        <div className="ec-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="ec-cdc"><p className="ec-cdn">{String(n).padStart(2,"0")}</p><p className="ec-cdl">{l}</p></div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="ec-cal">
          <div className="ec-cal-head">
            <p className="ec-cal-month">{monthName} {year}</p>
            <p className="ec-cal-eth">{eth.monthAm} {eth.year} ዓ.ም</p>
          </div>
          <div className="ec-cal-dh">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=><div key={d} className="ec-cal-dhc">{d}</div>)}</div>
          <div className="ec-cal-days">
            {cells.map((day,i)=>(
              <div key={i} className={`ec-cal-day${day===weddingDay?" wed":""}`}>
                {day===weddingDay?"💍":day!==null?day:""}
              </div>
            ))}
          </div>
        </div>

        <div className="ec-msg">
          <p className="ec-msg-t">{lang==="am"&&data.greetingTitleAm?data.greetingTitleAm:data.greetingTitle}</p>
          <p className="ec-msg-b">{lang==="am"&&data.messageBodyAm?data.messageBodyAm:data.messageBody}</p>
          {lang==="en"&&data.messageBodyAm&&<p className="ec-msg-b-am">{data.messageBodyAm}</p>}
        </div>

        <div className="ec-dets">
          {[
            {ic:"📅",k:"Date · ቀን",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),v2:`${eth.day} ${eth.monthAm} ${eth.year} ዓ.ም`},
            {ic:"⏰",k:"Time · ሰዓት",v:data.timeEn,v2:data.timeAm??""},
            {ic:"🏛️",k:"Venue · ቦታ",v:data.venue,v2:""},
            {ic:"📍",k:"Location · አድራሻ",v:data.venueAddress,v2:""},
          ].map(r=>(
            <div key={r.k} className="ec-det">
              <div className="ec-det-ic">{r.ic}</div>
              <div className="ec-det-bd">
                <p className="ec-det-k">{r.k}</p>
                <p className="ec-det-v">{r.v}</p>
                {r.v2&&<p className="ec-det-v2">{r.v2}</p>}
              </div>
            </div>
          ))}
        </div>

        {data.program?.length>0&&(
          <>
            <div style={{background:"#078930",padding:"12px 18px",textAlign:"center"}}><p style={{fontSize:"9px",letterSpacing:".22em",textTransform:"uppercase",color:"rgba(252,221,9,.9)",fontWeight:700}}>PROGRAMME · የዕለቱ ፕሮግራም</p></div>
            <div className="ec-prog">
              {data.program.map((item:any,i:number)=>(
                <div key={i} className="ec-pi">
                  <div className="ec-pt"><p className="ec-pt-am">{item.timeAm??item.time}</p><p className="ec-pt-en">{item.time}</p></div>
                  <div className="ec-pb">
                    <div className="ec-pdot"/>
                    <p className="ec-pb-t">{item.title}</p>
                    {item.titleAm&&<p className="ec-pb-am">{item.titleAm}</p>}
                    <p className="ec-pb-d">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {data.venueMapLink&&<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="ec-map-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>}

        <div className="ec-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"14px 0"}}><p style={{fontSize:"1rem",fontWeight:700,color:"#078930",marginBottom:5}}>አስቀድሞ እናመሰግናለን! 🎉</p><p style={{fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:"#6A6A30"}}>RSVP Received</p></div>):(
            <>
              <p className="ec-rsvp-t">RSVP</p>
              <p className="ec-rsvp-am">ምዝገባ · Confirm Your Attendance</p>
              <label className="ec-lbl">Full Name *</label>
              <input className="ec-input" placeholder="e.g. Chaltu Gemechu" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="ec-lbl">Phone *</label>
              <input className="ec-input" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="ec-lbl">Attendance</label>
              <div className="ec-att">{(["yes","no","maybe"] as const).map(v=><button key={v} onClick={()=>rsvp.update("attending",v)} className={`ec-att-btn${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}</button>)}</div>
              <label className="ec-lbl">Guests</label>
              <select className="ec-input" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="ec-lbl">Message to the Couple</label>
              <textarea className="ec-input" rows={3} style={{resize:"none"}} placeholder="ምርቃትዎን ያካፍሉ…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="ec-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP · አረጋግጥ"}</button>
            </>
          )}
        </div>

        <div className="ec-footer">
          <p className="ec-footer-am">{data.groomNameAm??data.groomName} & {data.brideNameAm??data.brideName}</p>
          <p className="ec-footer-v">{data.venue} · Ethiopia 🇪🇹</p>
        </div>
        <div className="ec-flag"><div className="ec-flag-g"/><div className="ec-flag-y"/><div className="ec-flag-r"/></div>
      </div>
    </>
  );
}