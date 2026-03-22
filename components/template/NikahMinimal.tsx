"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCountdown, useRSVP, getHijriDate } from "@/lib/hooks";

// ─── TEMPLATE 7: Nikah Minimal ────────────────────────────────────────────────
// Style: White + light green, minimal UI, simple clean
// Audience: Simple Muslim weddings — free tier

export default function NikahMinimalTemplate({ data }: { data: any }) {
  const cd = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [ready, setReady] = useState(false);
  const gc = new Date(data.date);
  const hijri = getHijriDate(data.date);
  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  return (
    <>
      <style>{`
        .nm2 { background:#F8FFF9; color:#1A2A1A; font-family:system-ui,-apple-system,sans-serif; max-width:430px; margin:0 auto; overflow-x:hidden; }
        .nm2 * { box-sizing:border-box; }
        .nm2-in { opacity:0; transition:opacity .6s ease; }
        .nm2-in.go { opacity:1; }

        .nm2-green { height:4px; background:#2E7D32; }
        .nm2-green-lt { height:2px; background:rgba(46,125,50,.3); }

        /* Bismillah header */
        .nm2-bism { background:#fff; padding:18px 24px 14px; text-align:center; border-bottom:1px solid rgba(46,125,50,.15); }
        .nm2-bism-ar { font-size:1.6rem; color:#2E7D32; direction:rtl; line-height:1.5; }
        .nm2-bism-en { font-size:10px; color:rgba(46,125,50,.55); margin-top:4px; font-style:italic; }

        /* Hero */
        .nm2-hero { position:relative; height:92vh; min-height:360px; }
        .nm2-hero img { width:100%; height:100%; object-fit:cover; display:block; }
        .nm2-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(46,125,50,.72) 0%,rgba(46,125,50,.18) 28%,rgba(46,125,50,.1) 50%,rgba(46,125,50,.55) 74%,#F8FFF9 100%); }

        /* Names */
        .nm2-names { background:#fff; padding:22px 32px 16px; text-align:center; border-bottom:2px solid rgba(46,125,50,.15); }
        .nm2-name { font-size:clamp(1.4rem,7vw,2.1rem); font-weight:600; color:#1A2A1A; line-height:1.3; }
        .nm2-and { font-size:1.1rem; color:#2E7D32; margin:5px 0; letter-spacing:.1em; }
        .nm2-name-en { font-size:11px; color:#5A7A5A; letter-spacing:.06em; margin-top:4px; }

        /* Date */
        .nm2-date { background:#2E7D32; padding:20px 24px; text-align:center; }
        .nm2-date-inshallah { font-size:9px; letter-spacing:.24em; text-transform:uppercase; color:rgba(255,255,255,.65); margin-bottom:10px; }
        .nm2-date-main { display:flex; align-items:center; justify-content:center; gap:16px; }
        .nm2-date-num { font-size:3rem; font-weight:300; color:#fff; line-height:1; }
        .nm2-date-vsep { width:1px; height:50px; background:rgba(255,255,255,.3); }
        .nm2-date-right { text-align:left; }
        .nm2-date-month { font-size:1.1rem; font-weight:600; color:#fff; }
        .nm2-date-year { font-size:12px; color:rgba(255,255,255,.65); margin-top:2px; }
        .nm2-date-hijri { font-size:11px; color:rgba(255,255,255,.55); margin-top:4px; }
        .nm2-date-time { font-size:11px; color:rgba(255,255,255,.55); margin-top:2px; }

        /* Countdown */
        .nm2-cd { display:grid; grid-template-columns:repeat(4,1fr); background:#fff; border-bottom:2px solid rgba(46,125,50,.18); }
        .nm2-cdc { text-align:center; padding:15px 4px; border-right:1px solid rgba(46,125,50,.1); }
        .nm2-cdc:last-child { border-right:none; }
        .nm2-cdn { font-size:2rem; font-weight:600; color:#2E7D32; line-height:1; }
        .nm2-cdl { font-size:7.5px; letter-spacing:.14em; text-transform:uppercase; color:#5A7A5A; margin-top:4px; }

        /* Message */
        .nm2-msg { padding:20px 32px 16px; text-align:center; background:#fff; }
        .nm2-msg-t { font-size:14px; font-weight:600; color:#1A2A1A; margin-bottom:8px; }
        .nm2-msg-b { font-size:13px; line-height:1.85; color:#3A4A3A; }

        /* Details */
        .nm2-dets { background:#F8FFF9; border-top:1px solid rgba(46,125,50,.15); border-bottom:1px solid rgba(46,125,50,.15); }
        .nm2-det { display:grid; grid-template-columns:48px 1fr; border-bottom:1px solid rgba(46,125,50,.08); }
        .nm2-det:last-child { border-bottom:none; }
        .nm2-det-ic { display:flex; align-items:center; justify-content:center; font-size:17px; border-right:1px solid rgba(46,125,50,.08); }
        .nm2-det-bd { padding:12px 14px; }
        .nm2-det-k { font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:#2E7D32; margin-bottom:2px; }
        .nm2-det-v { font-size:13.5px; color:#1A2A1A; line-height:1.4; }
        .nm2-det-v2 { font-size:11px; color:#5A7A5A; margin-top:1px; }

        /* Programme */
        .nm2-prog { padding:0 20px 20px; background:#fff; }
        .nm2-prog-head { text-align:center; padding:16px 0 12px; font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:#2E7D32; }
        .nm2-pi { display:flex; gap:12px; align-items:flex-start; padding:9px 0; border-bottom:1px solid rgba(46,125,50,.08); }
        .nm2-pi:last-child { border-bottom:none; }
        .nm2-pi-time { min-width:68px; text-align:right; flex-shrink:0; }
        .nm2-pi-t { font-size:11px; font-weight:600; color:#2E7D32; }
        .nm2-pi-tar { font-size:11px; color:rgba(46,125,50,.6); direction:rtl; }
        .nm2-pi-body {}
        .nm2-pi-title { font-size:13px; font-weight:600; color:#1A2A1A; }
        .nm2-pi-title-ar { font-size:12px; color:rgba(46,125,50,.65); direction:rtl; }
        .nm2-pi-desc { font-size:11px; color:#5A7A5A; margin-top:2px; }

        /* Map */
        .nm2-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; margin:0 20px 18px; padding:12px; border:1.5px solid #2E7D32; color:#2E7D32; font-size:10.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; text-decoration:none; border-radius:4px; transition:background .2s; }
        .nm2-map-btn:hover { background:rgba(46,125,50,.06); }

        /* RSVP */
        .nm2-rsvp { margin:0 20px 24px; padding:20px 18px; border:1.5px solid rgba(46,125,50,.3); background:#fff; border-radius:6px; }
        .nm2-rsvp-ar { font-size:1.1rem; color:#2E7D32; text-align:center; direction:rtl; margin-bottom:3px; }
        .nm2-rsvp-t { font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:#5A7A5A; text-align:center; margin-bottom:16px; }
        .nm2-lbl { display:block; font-size:8.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#5A7A5A; margin-bottom:5px; }
        .nm2-input { width:100%; background:#F8FFF9; border:1px solid rgba(46,125,50,.22); color:#1A2A1A; padding:10px 12px; font-size:13.5px; outline:none; margin-bottom:12px; border-radius:4px; font-family:inherit; transition:border-color .15s; }
        .nm2-input:focus { border-color:#2E7D32; background:#fff; }
        .nm2-input::placeholder { color:#8AAA8A; }
        .nm2-input option { background:#F8FFF9; }
        .nm2-att { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
        .nm2-att-btn { padding:9px 4px; border:1px solid rgba(46,125,50,.22); background:transparent; color:#5A7A5A; font-size:9px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; border-radius:4px; transition:all .15s; font-family:inherit; }
        .nm2-att-btn.on { border-color:#2E7D32; color:#2E7D32; background:rgba(46,125,50,.06); }
        .nm2-submit { width:100%; padding:13px; background:#2E7D32; color:#fff; font-size:10.5px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; border:none; cursor:pointer; border-radius:4px; transition:opacity .2s; font-family:inherit; }
        .nm2-submit:hover { opacity:.88; }
        .nm2-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Footer */
        .nm2-footer { background:#2E7D32; padding:18px 20px; text-align:center; }
        .nm2-footer-sal { font-size:1rem; color:rgba(255,255,255,.7); margin-bottom:4px; }
        .nm2-footer-nm { font-size:12.5px; color:rgba(255,255,255,.55); }
        .nm2-footer-v { font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.35); margin-top:5px; }

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(255,255,255,.85); }
          50%      { text-shadow: 0 2px 40px rgba(255,255,255,.85), 0 0 80px rgba(255,255,255,.35); }
        }
        .nm2-name { animation: name-glow 3.5s ease-in-out infinite; }
      
        @keyframes nm2-glow {
          0%,100% { text-shadow: 0 2px 22px rgba(237,216,122,.85); }
          50%      { text-shadow: 0 2px 44px rgba(237,216,122,.85), 0 0 90px rgba(237,216,122,0.3); }
        }
        .nm2-name { animation: nm2-glow 3.5s ease-in-out infinite; }
        .nm2-grain-fx {
          position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
      `}</style>

      <div className={`nm2 nm2-in${ready?" go":""}`}>
        <div className="nm2-green"/>

        {/* Bismillah */}
        <div className="nm2-bism">
          <p className="nm2-bism-ar">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
          <p className="nm2-bism-en">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>

        <div className="nm2-grain-fx" aria-hidden="true"/>

        <div className="nm2-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="nm2-hero-ov"/>
          <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.04,backgroundImage:"repeating-linear-gradient(45deg,rgba(46,125,50,.5) 0px,rgba(46,125,50,.5) 1px,transparent 1px,transparent 26px)",backgroundSize:"24px 24px"}}/>
          <div className="nm2-vig-inner" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 100px rgba(0,40,0,0.22)",pointerEvents:"none",zIndex:3}}/>
        </div>

        <div className="nm2-names">
          <p className="nm2-name">{data.groomNameAr??data.groomName}</p>
          <p className="nm2-and">و</p>
          <p className="nm2-name">{data.brideNameAr??data.brideName}</p>
          <p className="nm2-name-en">{data.groomName} & {data.brideName}</p>
        </div>

        <div className="nm2-date">
          <p className="nm2-date-inshallah">إن شاء الله · Inshallah On</p>
          <div className="nm2-date-main">
            <p className="nm2-date-num">{gc.getDate()}</p>
            <div className="nm2-date-vsep"/>
            <div className="nm2-date-right">
              <p className="nm2-date-month">{gc.toLocaleString("en-US",{month:"long"}).toUpperCase()}</p>
              <p className="nm2-date-year">{gc.getFullYear()}</p>
              <p className="nm2-date-hijri">{hijri.day} {hijri.monthAr} {hijri.year} هـ</p>
              <p className="nm2-date-time">{data.timeEn}{data.timeAr?` · ${data.timeAr}`:""}</p>
            </div>
          </div>
        </div>

        <div className="nm2-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="nm2-cdc"><p className="nm2-cdn">{String(n).padStart(2,"0")}</p><p className="nm2-cdl">{l}</p></div>
          ))}
        </div>

        <div className="nm2-msg">
          <p className="nm2-msg-t">{data.greetingTitle}</p>
          <p className="nm2-msg-b">{data.messageBody}</p>
        </div>

        {data.scripture&&<div style={{textAlign:"center",padding:"0 32px 18px",background:"#fff",borderBottom:"1px solid rgba(46,125,50,.1)"}}><p style={{fontSize:"1.1rem",color:"#2E7D32",direction:"rtl",lineHeight:1.7}}>{data.scripture}</p>{data.scriptureRef&&<p style={{fontSize:"10px",color:"rgba(46,125,50,.55)",marginTop:5,fontStyle:"italic"}}>{data.scriptureRef}</p>}</div>}

        <div className="nm2-dets">
          {[
            {ic:"📅",k:"Date · التاريخ",v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),v2:`${hijri.day} ${hijri.monthAr} ${hijri.year} هـ`},
            {ic:"🕌",k:"Time · الوقت",v:data.timeEn,v2:data.timeAr??""},
            {ic:"🏛️",k:"Venue · المكان",v:data.venue,v2:""},
            {ic:"📍",k:"Location · الموقع",v:data.venueAddress,v2:""},
          ].map(r=>(
            <div key={r.k} className="nm2-det">
              <div className="nm2-det-ic">{r.ic}</div>
              <div className="nm2-det-bd"><p className="nm2-det-k">{r.k}</p><p className="nm2-det-v">{r.v}</p>{r.v2&&<p className="nm2-det-v2">{r.v2}</p>}</div>
            </div>
          ))}
        </div>

        {data.program?.length>0&&(
          <div className="nm2-prog">
            <p className="nm2-prog-head">Programme · برنامج اليوم</p>
            {data.program.map((item:any,i:number)=>(
              <div key={i} className="nm2-pi">
                <div className="nm2-pi-time"><p className="nm2-pi-t">{item.time}</p>{item.timeAr&&<p className="nm2-pi-tar">{item.timeAr}</p>}</div>
                <div className="nm2-pi-body">
                  <p className="nm2-pi-title">{item.title}</p>
                  {item.titleAr&&<p className="nm2-pi-title-ar">{item.titleAr}</p>}
                  <p className="nm2-pi-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.venueMapLink&&<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="nm2-map-btn"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps · خرائط</a>}

        <div className="nm2-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"14px 0"}}><p style={{fontSize:"1.1rem",color:"#2E7D32",marginBottom:5}}>جزاكم الله خيراً</p><p style={{fontSize:"9px",letterSpacing:".16em",textTransform:"uppercase",color:"#5A7A5A"}}>RSVP Received</p></div>):(
            <>
              <p className="nm2-rsvp-ar">تأكيد الحضور</p>
              <p className="nm2-rsvp-t">Confirm Your Attendance</p>
              <label className="nm2-lbl">Full Name *</label>
              <input className="nm2-input" placeholder="e.g. Fatima Yusuf" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="nm2-lbl">Phone *</label>
              <input className="nm2-input" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="nm2-lbl">Attendance</label>
              <div className="nm2-att">{(["yes","no","maybe"] as const).map(v=><button key={v} onClick={()=>rsvp.update("attending",v)} className={`nm2-att-btn${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}</button>)}</div>
              <label className="nm2-lbl">Guests</label>
              <select className="nm2-input" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="nm2-lbl">Message · رسالة</label>
              <textarea className="nm2-input" rows={3} style={{resize:"none"}} placeholder="Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="nm2-submit" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP · تأكيد"}</button>
            </>
          )}
        </div>

        <div className="nm2-footer">
          <p className="nm2-footer-sal">السَّلَامُ عَلَيْكُمْ</p>
          <p className="nm2-footer-nm">{data.groomName} & {data.brideName}</p>
          <p className="nm2-footer-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="nm2-green"/>
      </div>
    </>
  );
}