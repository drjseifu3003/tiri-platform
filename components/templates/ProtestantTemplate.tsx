"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP } from "@/lib/hooks";

// ─── RELIGION TEMPLATE: Protestant / Evangelical ─────────────────────────────
// Faith identity only: scripture verse, Latin cross, stark black + off-white,
// crimson accent, editorial Cormorant Garamond. No ethnic culture.

const DEFAULT_PROGRAM = [
  { time:"8:00 AM",  timeAm:"2:00 ጠዋት",  title:"Worship & Praise",     titleAm:"ምስጋናና ጸሎት",    desc:"Opening worship service" },
  { time:"9:00 AM",  timeAm:"3:00 ጠዋት",  title:"Wedding Ceremony",     titleAm:"ሠርግ ሥነ-ስርዓት",  desc:"Exchange of vows & rings" },
  { time:"10:30 AM", timeAm:"4:30 ጠዋት",  title:"Pastoral Blessing",    titleAm:"ቡራኬ",           desc:"Prayer for the couple" },
  { time:"12:00 PM", timeAm:"6:00 ቀን",   title:"Reception Luncheon",   titleAm:"የምሳ ግብዣ",       desc:"Sit-down meal with family" },
  { time:"2:30 PM",  timeAm:"8:30 ቀን",   title:"Speeches & Toasts",    titleAm:"ንግግሮች",         desc:"Family & friends tributes" },
  { time:"4:00 PM",  timeAm:"10:00 ቀን",  title:"Music & Celebration",  titleAm:"ሙዚቃና ደስታ",     desc:"Evening celebration" },
];

export default function ProtestantTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const gc   = new Date(data.date);
  const dayNum  = gc.getDate();
  const monthStr= gc.toLocaleString("en-US",{month:"long"});
  const yearStr = gc.getFullYear();
  const dayStr  = gc.toLocaleString("en-US",{weekday:"long"});

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Raleway:wght@300;400;500;600;700&family=Noto+Serif+Ethiopic:wght@300;400;500&display=swap');
        .pt{background:#0C0C0C;color:#EEEEE8;font-family:'Raleway',sans-serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .pt *{box-sizing:border-box;}
        .pt-in{opacity:0;transition:opacity .7s ease;}
        .pt-in.go{opacity:1;}
        .pt-red{height:3px;background:#B91C1C;}
        /* hero */
        .pt-hero{position:relative;height:92vh;min-height:430px;}
        .pt-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .pt-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,10,.88) 0%,rgba(10,10,10,.2) 30%,rgba(10,10,10,.12) 50%,rgba(10,10,10,.68) 75%,#0C0C0C 100%);z-index:1;}
        .pt-vig{position:absolute;inset:0;box-shadow:inset 0 0 120px rgba(0,0,0,.55);pointer-events:none;z-index:3;}
        .pt-pat{position:absolute;inset:0;pointer-events:none;opacity:.04;background-image:linear-gradient(rgba(185,28,28,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(185,28,28,.5) 1px,transparent 1px);background-size:80px 80px;z-index:2;}
        .pt-grain{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;}
        /* cross watermark top of photo */
        .pt-cross-wm{position:absolute;top:20px;left:50%;transform:translateX(-50%);opacity:.2;pointer-events:none;}
        .pt-nm{position:absolute;bottom:30px;left:0;right:0;text-align:center;padding:0 22px;z-index:2;}
        .pt-nm-script{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,10vw,3.4rem);font-style:italic;font-weight:300;color:#fff;line-height:1.15;}
        .pt-nm-tag{font-family:'Raleway',sans-serif;font-size:9px;font-weight:700;letter-spacing:.35em;text-transform:uppercase;color:rgba(255,255,255,.42);margin-top:10px;}
        /* scripture band */
        .pt-scrip{background:rgba(255,255,255,.04);border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);padding:26px 30px;text-align:center;}
        .pt-scrip-text{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-style:italic;font-weight:300;color:rgba(238,238,232,.65);line-height:1.85;}
        .pt-scrip-ref{font-family:'Raleway',sans-serif;font-size:9px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:rgba(238,238,232,.3);margin-top:10px;}
        .pt-scrip-am{font-family:'Noto Serif Ethiopic',serif;font-size:11.5px;font-weight:300;color:rgba(238,238,232,.3);line-height:1.8;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06);}
        /* date block */
        .pt-date{padding:36px 26px 28px;text-align:center;}
        .pt-date-day{font-family:'Raleway',sans-serif;font-size:9px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:rgba(238,238,232,.35);margin-bottom:10px;}
        .pt-date-num{font-family:'Cormorant Garamond',serif;font-size:6.5rem;font-weight:300;color:#EEEEE8;line-height:1;}
        .pt-date-month{font-family:'Raleway',sans-serif;font-size:10px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:rgba(238,238,232,.45);margin-top:6px;}
        .pt-date-bar{width:36px;height:2px;background:#B91C1C;margin:14px auto;}
        /* countdown */
        .pt-cd{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);}
        .pt-cdc{text-align:center;padding:18px 4px;border-right:1px solid rgba(255,255,255,.05);}
        .pt-cdc:last-child{border-right:none;}
        .pt-cdn{font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:300;color:#EEEEE8;line-height:1;}
        .pt-cdl{font-family:'Raleway',sans-serif;font-size:7px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:rgba(238,238,232,.28);margin-top:5px;}
        /* divider */
        .pt-hr{height:1px;background:rgba(255,255,255,.07);margin:30px 26px;}
        /* greeting */
        .pt-greet{padding:0 26px 26px;text-align:center;}
        .pt-greet-t{font-family:'Cormorant Garamond',serif;font-size:1.55rem;font-weight:400;color:#EEEEE8;margin-bottom:13px;}
        .pt-greet-b{font-family:'Raleway',sans-serif;font-size:13.5px;font-weight:300;line-height:1.9;color:rgba(238,238,232,.62);}
        /* details */
        .pt-dets{background:transparent;}
        .pt-det{display:flex;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,.05);}
        .pt-det:last-child{border-bottom:none;}
        .pt-det-ic{width:54px;flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:16px 0;border-right:1px solid rgba(255,255,255,.05);}
        .pt-det-bd{padding:13px 16px;}
        .pt-det-k{font-family:'Raleway',sans-serif;font-size:8px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:rgba(238,238,232,.3);margin-bottom:4px;}
        .pt-det-v{font-family:'Cormorant Garamond',serif;font-size:15px;color:#EEEEE8;line-height:1.4;}
        /* programme */
        .pt-prog{padding:0 22px 24px;}
        .pt-pi{display:grid;grid-template-columns:68px 1fr;margin-bottom:2px;}
        .pt-pt{padding:12px 11px 12px 0;text-align:right;border-right:1px solid rgba(255,255,255,.07);}
        .pt-pt-main{font-family:'Raleway',sans-serif;font-size:10px;font-weight:600;color:rgba(238,238,232,.5);letter-spacing:.04em;}
        .pt-pt-am{font-family:'Noto Serif Ethiopic',serif;font-size:9px;color:rgba(238,238,232,.28);margin-top:2px;}
        .pt-pb{padding:12px 0 12px 15px;position:relative;}
        .pt-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:8px;height:8px;border-radius:50%;border:1.5px solid rgba(238,238,232,.45);background:#0C0C0C;}
        .pt-pb-t{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:500;color:#EEEEE8;}
        .pt-pb-am{font-family:'Noto Serif Ethiopic',serif;font-size:11px;color:rgba(238,238,232,.35);margin-top:1px;}
        .pt-pb-d{font-family:'Raleway',sans-serif;font-size:11.5px;font-weight:300;color:rgba(238,238,232,.38);margin-top:3px;}
        /* map */
        .pt-map{margin:0 22px 22px;height:162px;overflow:hidden;border:1px solid rgba(255,255,255,.08);}
        .pt-map iframe{width:100%;height:100%;border:none;filter:grayscale(100%) contrast(1.1);}
        .pt-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 22px 26px;padding:12px;border:1px solid rgba(255,255,255,.12);color:rgba(238,238,232,.6);font-family:'Raleway',sans-serif;font-size:9px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;transition:all .2s;}
        .pt-mapbtn:hover{border-color:rgba(238,238,232,.35);color:#EEEEE8;}
        /* rsvp */
        .pt-rsvp{margin:0 22px 32px;padding:26px 22px;border:1px solid rgba(255,255,255,.09);}
        .pt-rsvp-t{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:400;color:#EEEEE8;text-align:center;margin-bottom:4px;}
        .pt-rsvp-sub{font-family:'Raleway',sans-serif;font-size:8px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:rgba(238,238,232,.28);text-align:center;margin-bottom:24px;}
        .pt-lbl{font-family:'Raleway',sans-serif;font-size:8px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:rgba(238,238,232,.3);display:block;margin-bottom:6px;}
        .pt-field{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#EEEEE8;padding:11px 13px;font-family:'Raleway',sans-serif;font-size:13.5px;font-weight:300;outline:none;margin-bottom:14px;transition:border-color .15s;}
        .pt-field:focus{border-color:rgba(238,238,232,.35);}
        .pt-field::placeholder{color:rgba(238,238,232,.17);}
        .pt-field option{background:#0C0C0C;}
        .pt-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .pt-ab{padding:10px 4px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(238,238,232,.38);font-family:'Raleway',sans-serif;font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .15s;}
        .pt-ab.on{border-color:rgba(238,238,232,.45);color:#EEEEE8;background:rgba(255,255,255,.05);}
        .pt-sub{width:100%;padding:14px;background:#EEEEE8;color:#0C0C0C;font-family:'Raleway',sans-serif;font-size:10px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity .2s;}
        .pt-sub:hover{opacity:.88;}
        .pt-sub:disabled{opacity:.38;cursor:not-allowed;}
        /* footer */
        .pt-foot{border-top:1px solid rgba(255,255,255,.07);padding:26px 22px 34px;text-align:center;}
        .pt-foot-nm{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-style:italic;font-weight:300;color:rgba(238,238,232,.42);}
        .pt-foot-v{font-family:'Raleway',sans-serif;font-size:8.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(238,238,232,.22);margin-top:6px;}
        .pt-bot-red{height:3px;background:#B91C1C;}
        .pt-audio{position:fixed;top:14px;right:14px;z-index:100;background:rgba(12,12,12,.9);border:1px solid rgba(255,255,255,.18);color:rgba(238,238,232,.7);width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px);font-size:14px;}

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(238,238,232,.85); }
          50%      { text-shadow: 0 2px 40px rgba(238,238,232,.85), 0 0 80px rgba(238,238,232,.35); }
        }
        .pt-nm-script { animation: name-glow 3.5s ease-in-out infinite; }
      `}</style>

      <div className={`pt pt-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        {data.audioUrl&&<button className="pt-audio" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}

        <div className="pt-red"/>

        {/* Hero */}
        <div className="pt-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="pt-ov"/>
          {/* <div className="pt-pat" style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",position:absolute;inset:0;pointer-events:none;opacity:.04;background-image:linear-gradient(rgba(185,28,28,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(185,28,28,.5) 1px,transparent 1px);background-size:80px 80px;}}/> */}
          <div className="pt-vig" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 120px rgba(0,0,0,0.55)",pointerEvents:"none",zIndex:3}}/>
          <svg className="pt-cross-wm" viewBox="0 0 44 60" width="32" height="44" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="22" y2="58"/><line x1="4" y1="18" x2="40" y2="18"/></svg>
          <div className="pt-nm">
            <p className="pt-nm-script">{data.groomName} & {data.brideName}</p>
            <p className="pt-nm-tag">Save The Date</p>
          </div>
        </div>

        {/* Scripture */}
        {data.scripture&&(
          <div className="pt-scrip">
            <p className="pt-scrip-text">{data.scripture}</p>
            {data.scriptureRef&&<p className="pt-scrip-ref">{data.scriptureRef}</p>}
            <p className="pt-scrip-am">እግዚአብሔር ፍቅር ነው — ፍቅር ዘላለም ይኖራል።</p>
          </div>
        )}

        {/* Date */}
        <div className="pt-date">
          <p className="pt-date-day">{dayStr}</p>
          <p className="pt-date-num">{dayNum}</p>
          <p className="pt-date-month">{monthStr.toUpperCase()} · {yearStr}</p>
          <div className="pt-date-bar"/>
        </div>

        {/* Countdown */}
        <div className="pt-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="pt-cdc">
              <p className="pt-cdn">{String(n).padStart(2,"0")}</p>
              <p className="pt-cdl">{l}</p>
            </div>
          ))}
        </div>

        <div className="pt-hr"/>

        {/* Greeting */}
        <div className="pt-greet">
          <p className="pt-greet-t">{data.greetingTitle}</p>
          <p className="pt-greet-b">{data.messageBody}</p>
        </div>

        {/* Details */}
        <div className="pt-dets">
          {[
            {icon:<path d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" strokeLinecap="round"/>, k:"Date",     v:`${dayStr}, ${monthStr} ${dayNum}, ${yearStr}`},
            {icon:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></>,                                                   k:"Time",     v:`${data.timeEn}${data.timeAm?` (${data.timeAm})`:""}`},
            {icon:<path d="M3 11l9-9 9 9M5 9.5V20a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1V9.5" strokeLinecap="round"/>,                                   k:"Church",   v:data.venue},
            {icon:<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>,                                                                            k:"Location", v:data.venueAddress},
          ].map(row=>(
            <div key={row.k} className="pt-det">
              <div className="pt-det-ic">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(238,238,232,.38)" strokeWidth="1.5">{row.icon}</svg>
              </div>
              <div className="pt-det-bd">
                <p className="pt-det-k">{row.k}</p>
                <p className="pt-det-v">{row.v}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="pt-hr"/>
        <div style={{textAlign:"center",padding:"0 26px 16px"}}>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:"8px",fontWeight:700,letterSpacing:".3em",textTransform:"uppercase",color:"rgba(238,238,232,.3)"}}>Order of Service</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",fontWeight:400,color:"#EEEEE8",marginTop:6}}>Programme</p>
        </div>
        <div className="pt-prog">
          {prog.map(item=>(
            <div key={item.time} className="pt-pi">
              <div className="pt-pt">
                <p className="pt-pt-main">{item.time}</p>
                {item.timeAm&&<p className="pt-pt-am">{item.timeAm}</p>}
              </div>
              <div className="pt-pb">
                <div className="pt-pdot"/>
                <p className="pt-pb-t">{item.title}</p>
                {item.titleAm&&<p className="pt-pb-am">{item.titleAm}</p>}
                <p className="pt-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="pt-hr" style={{margin:"8px 26px 18px"}}/>
        <div style={{textAlign:"center",paddingBottom:14}}>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:"8px",fontWeight:700,letterSpacing:".28em",textTransform:"uppercase",color:"rgba(238,238,232,.28)"}}>Venue Location</p>
        </div>
        {data.venueMapUrl?(
          <div className="pt-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>
        ):(
          <div className="pt-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(238,238,232,.2)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{fontFamily:"'Raleway',sans-serif",fontSize:"9px",color:"rgba(238,238,232,.2)"}}>Provide venueMapUrl to embed map</p>
          </div>
        )}
        {data.venueMapLink&&(
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="pt-mapbtn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Get Directions
          </a>
        )}

        {/* RSVP */}
        <div className="pt-rsvp">
          {rsvp.submitted?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",fontStyle:"italic",fontWeight:300,color:"#EEEEE8",marginBottom:7}}>Thank You & God Bless</p>
              <p style={{fontFamily:"'Noto Serif Ethiopic',serif",fontSize:"12px",color:"rgba(238,238,232,.35)"}}>አስቀድሞ እናመሰግናለን!</p>
            </div>
          ):(
            <>
              <p className="pt-rsvp-t">RSVP</p>
              <p className="pt-rsvp-sub">Please reply by {gc.toLocaleDateString("en-US",{month:"long",day:"numeric"})}</p>
              <label className="pt-lbl">Full Name · ሙሉ ስም *</label>
              <input className="pt-field" placeholder="e.g. Mihret Ephraim" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="pt-lbl">Phone · ስልክ ቁጥር *</label>
              <input className="pt-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="pt-lbl">Attendance</label>
              <div className="pt-att">
                {(["yes","no","maybe"] as const).map(v=>(
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`pt-ab${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}
                  </button>
                ))}
              </div>
              <label className="pt-lbl">Number of Guests</label>
              <select className="pt-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="pt-lbl">Message to the Couple</label>
              <textarea className="pt-field" rows={3} style={{resize:"none"}} placeholder="Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="pt-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Sending…":"Confirm RSVP"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-foot">
          <svg viewBox="0 0 28 40" width="18" height="26" fill="none" stroke="rgba(238,238,232,.22)" strokeWidth="1.8" style={{display:"block",margin:"0 auto 14px"}}><line x1="14" y1="2" x2="14" y2="38"/><line x1="3" y1="13" x2="25" y2="13"/></svg>
          <p className="pt-foot-nm">{data.groomName} & {data.brideName}</p>
          <p className="pt-foot-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="pt-bot-red"/>
      </div>
    </>
  );
}