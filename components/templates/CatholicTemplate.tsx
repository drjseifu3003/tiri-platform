"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP } from "@/lib/hooks";

// ─── RELIGION TEMPLATE: Catholic ─────────────────────────────────────────────
// Faith identity only: deep navy + gold, Latin Missa, rosary bead dividers,
// formal Garamond, Catholic wedding rite programme. No ethnic culture.

const DEFAULT_PROGRAM = [
  { time:"9:00 AM",  timeAm:"3:00 ጠዋት",  title:"Holy Mass (Missa)",     titleLa:"Sancta Missa",     desc:"Nuptial Mass — Rite of Marriage" },
  { time:"10:30 AM", timeAm:"4:30 ጠዋት",  title:"Exchange of Vows",      titleLa:"Consensus Matrimonialis", desc:"I take you…in sickness and health" },
  { time:"11:00 AM", timeAm:"5:00 ጠዋት",  title:"Blessing of the Rings",  titleLa:"Benedictio Anulorum",desc:"Symbol of unending love" },
  { time:"11:30 AM", timeAm:"5:30 ጠዋት",  title:"Nuptial Blessing",       titleLa:"Benedictio Nuptialis",desc:"Pastoral blessing for the couple" },
  { time:"1:00 PM",  timeAm:"7:00 ቀን",   title:"Wedding Reception",      titleLa:"Convivium",         desc:"Celebratory feast with family" },
  { time:"3:30 PM",  timeAm:"9:30 ቀን",   title:"Speeches & Toasts",      titleLa:"Allocutiones",      desc:"Family tributes & toasts" },
  { time:"5:00 PM",  timeAm:"11:00 ቀን",  title:"Music & Celebration",    titleLa:"Laetitia",          desc:"Evening celebration" },
];

export default function CatholicTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const gc   = new Date(data.date);
  const gcStr= gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  const NAVY="#0E1B3A"; const GOLD="#B8963E"; const CREAM="#F6F0E4";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cinzel:wght@400;500;600&family=Noto+Serif+Ethiopic:wght@300;400;500&display=swap');
        .ca{background:${NAVY};color:${CREAM};font-family:'EB Garamond',Georgia,serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .ca *{box-sizing:border-box;}
        .ca-in{opacity:0;transition:opacity .7s ease;}
        .ca-in.go{opacity:1;}
        /* gold top border */
        .ca-top{height:4px;background:linear-gradient(90deg,transparent,${GOLD},transparent);}
        /* Latin top motto */
        .ca-motto{background:rgba(0,0,0,.3);padding:14px 24px;text-align:center;border-bottom:1px solid rgba(184,150,62,.18);}
        .ca-motto-la{font-family:'EB Garamond',serif;font-size:13px;font-style:italic;color:rgba(184,150,62,.65);letter-spacing:.05em;}
        /* hero */
        .ca-hero{position:relative;height:92vh;min-height:420px;}
        .ca-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .ca-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,27,58,.86) 0%,rgba(14,27,58,.22) 30%,rgba(14,27,58,.13) 50%,rgba(14,27,58,.64) 75%,${NAVY} 100%);z-index:1;}
        .ca-pat{position:absolute;inset:0;pointer-events:none;opacity:.045;background-image:radial-gradient(circle,rgba(184,150,62,1) 1px,transparent 1px);background-size:18px 18px;z-index:2;}
        .ca-vig{position:absolute;inset:0;box-shadow:inset 0 0 120px rgba(0,0,0,.58);pointer-events:none;z-index:3;}
        .ca-grain{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;}
        /* ornate frame */
        .ca-frame{position:absolute;inset:12px;pointer-events:none;}
        .ca-frame::before{content:'';position:absolute;inset:0;border:1px solid rgba(184,150,62,.28);}
        .ca-fc{position:absolute;width:28px;height:28px;}
        .ca-fc.tl{top:-1px;left:-1px;border-top:2px solid ${GOLD};border-left:2px solid ${GOLD};}
        .ca-fc.tr{top:-1px;right:-1px;border-top:2px solid ${GOLD};border-right:2px solid ${GOLD};}
        .ca-fc.bl{bottom:-1px;left:-1px;border-bottom:2px solid ${GOLD};border-left:2px solid ${GOLD};}
        .ca-fc.br{bottom:-1px;right:-1px;border-bottom:2px solid ${GOLD};border-right:2px solid ${GOLD};}
        .ca-nm{position:absolute;bottom:28px;left:0;right:0;text-align:center;padding:0 22px;z-index:2;}
        .ca-nm-en{font-family:'EB Garamond',serif;font-size:clamp(2rem,9.5vw,3.2rem);font-style:italic;font-weight:300;color:#fff;line-height:1.15;}
        .ca-nm-la{font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;color:rgba(184,150,62,.6);margin-top:9px;}
        /* rosary bead divider */
        .ca-rosary{display:flex;align-items:center;padding:0 24px;margin:22px 0;gap:4px;}
        .ca-rb-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(184,150,62,.38),transparent);}
        .ca-rb{width:5px;height:5px;border-radius:50%;background:${GOLD};opacity:.55;flex-shrink:0;}
        .ca-rb.big{width:7px;height:7px;opacity:.75;}
        /* date block */
        .ca-date{text-align:center;padding:28px 24px 22px;}
        .ca-date-la{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.28em;text-transform:uppercase;color:rgba(184,150,62,.55);margin-bottom:10px;}
        .ca-date-num{font-family:'EB Garamond',serif;font-size:5.5rem;font-weight:400;color:${CREAM};line-height:1;}
        .ca-date-month{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:rgba(246,240,228,.45);margin-top:5px;}
        .ca-date-bar{width:50px;height:1px;background:${GOLD};margin:12px auto;opacity:.5;}
        /* countdown */
        .ca-cd{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(184,150,62,.14);border-bottom:1px solid rgba(184,150,62,.14);}
        .ca-cdc{text-align:center;padding:17px 4px;background:rgba(0,0,0,.25);border-right:1px solid rgba(184,150,62,.08);}
        .ca-cdc:last-child{border-right:none;}
        .ca-cdn{font-family:'EB Garamond',serif;font-size:2.4rem;font-weight:400;color:${GOLD};line-height:1;}
        .ca-cdl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:.22em;text-transform:uppercase;color:rgba(246,240,228,.28);margin-top:5px;}
        /* greeting */
        .ca-greet{padding:0 26px 24px;text-align:center;}
        .ca-greet-la{font-family:'EB Garamond',serif;font-size:1.1rem;font-style:italic;color:rgba(184,150,62,.6);margin-bottom:12px;}
        .ca-greet-t{font-family:'EB Garamond',serif;font-size:1.45rem;font-weight:400;color:${CREAM};margin-bottom:13px;}
        .ca-greet-b{font-size:13.5px;font-weight:400;line-height:1.9;color:rgba(246,240,228,.65);}
        /* scripture */
        .ca-scrip{background:rgba(0,0,0,.22);border-top:1px solid rgba(184,150,62,.12);border-bottom:1px solid rgba(184,150,62,.12);padding:22px 28px;text-align:center;margin-bottom:4px;}
        .ca-scrip-text{font-family:'EB Garamond',serif;font-size:1rem;font-style:italic;color:rgba(246,240,228,.6);line-height:1.85;}
        .ca-scrip-ref{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,240,228,.28);margin-top:9px;}
        /* details */
        .ca-dets{background:rgba(0,0,0,.2);}
        .ca-det{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid rgba(184,150,62,.08);}
        .ca-det:last-child{border-bottom:none;}
        .ca-det-ic{display:flex;align-items:center;justify-content:center;padding:15px 0;border-right:1px solid rgba(184,150,62,.08);}
        .ca-det-bd{padding:13px 15px;}
        .ca-det-k{font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:.22em;text-transform:uppercase;color:rgba(184,150,62,.65);margin-bottom:3px;}
        .ca-det-v{font-family:'EB Garamond',serif;font-size:14.5px;color:${CREAM};line-height:1.4;}
        /* programme */
        .ca-prog{padding:0 22px 24px;}
        .ca-pi{display:grid;grid-template-columns:72px 1fr;margin-bottom:2px;}
        .ca-pt{padding:12px 11px 12px 0;text-align:right;border-right:1.5px solid rgba(184,150,62,.18);}
        .ca-pt-main{font-family:'Cinzel',serif;font-size:10px;color:rgba(184,150,62,.7);}
        .ca-pt-am{font-family:'Noto Serif Ethiopic',serif;font-size:9px;color:rgba(246,240,228,.3);margin-top:2px;}
        .ca-pb{padding:12px 0 12px 15px;position:relative;}
        .ca-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:${GOLD};border-radius:50%;}
        .ca-pb-t{font-family:'EB Garamond',serif;font-size:14px;font-weight:500;color:${CREAM};}
        .ca-pb-la{font-family:'EB Garamond',serif;font-size:12px;font-style:italic;color:rgba(184,150,62,.55);margin-top:1px;}
        .ca-pb-d{font-size:11.5px;color:rgba(246,240,228,.38);margin-top:3px;}
        /* map */
        .ca-map{margin:0 22px 22px;height:162px;overflow:hidden;border:1px solid rgba(184,150,62,.18);}
        .ca-map iframe{width:100%;height:100%;border:none;filter:sepia(20%) saturate(.85);}
        .ca-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 22px 26px;padding:12px;border:1px solid rgba(184,150,62,.3);color:${GOLD};font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;transition:background .2s;}
        .ca-mapbtn:hover{background:rgba(184,150,62,.07);}
        /* rsvp */
        .ca-rsvp{margin:0 22px 32px;padding:26px 22px;border:1px solid rgba(184,150,62,.2);background:rgba(0,0,0,.2);}
        .ca-rsvp-la{font-family:'EB Garamond',serif;font-size:1rem;font-style:italic;color:rgba(184,150,62,.6);text-align:center;margin-bottom:4px;}
        .ca-rsvp-t{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:rgba(184,150,62,.7);text-align:center;margin-bottom:22px;}
        .ca-lbl{font-family:'Cinzel',serif;font-size:7.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,240,228,.35);display:block;margin-bottom:6px;}
        .ca-field{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(184,150,62,.18);color:${CREAM};padding:11px 13px;font-family:'EB Garamond',serif;font-size:14px;outline:none;margin-bottom:14px;transition:border-color .15s;}
        .ca-field:focus{border-color:${GOLD};}
        .ca-field::placeholder{color:rgba(246,240,228,.18);}
        .ca-field option{background:${NAVY};}
        .ca-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .ca-ab{padding:10px 4px;border:1px solid rgba(184,150,62,.18);background:transparent;color:rgba(246,240,228,.38);font-family:'Cinzel',serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .15s;}
        .ca-ab.on{border-color:${GOLD};color:${GOLD};background:rgba(184,150,62,.06);}
        .ca-sub{width:100%;padding:13px;background:${GOLD};color:${NAVY};font-family:'Cinzel',serif;font-size:9.5px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity .2s;}
        .ca-sub:hover{opacity:.9;}
        .ca-sub:disabled{opacity:.42;cursor:not-allowed;}
        /* footer */
        .ca-foot{background:rgba(0,0,0,.35);border-top:1px solid rgba(184,150,62,.16);padding:24px 22px;text-align:center;}
        .ca-foot-nm{font-family:'EB Garamond',serif;font-size:1.1rem;font-style:italic;font-weight:300;color:rgba(184,150,62,.6);}
        .ca-foot-v{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.15em;text-transform:uppercase;color:rgba(246,240,228,.22);margin-top:5px;}
        .ca-bot{height:4px;background:linear-gradient(90deg,transparent,${GOLD},transparent);}
        .ca-audio{position:fixed;top:14px;right:14px;z-index:100;background:rgba(14,27,58,.9);border:1px solid rgba(184,150,62,.35);color:${GOLD};width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px);font-size:14px;}

        @keyframes name-glow {
          0%,100% { text-shadow: 0 2px 20px rgba(246,240,228,.85); }
          50%      { text-shadow: 0 2px 40px rgba(246,240,228,.85), 0 0 80px rgba(246,240,228,.35); }
        }
        .ca-nm-en { animation: name-glow 3.5s ease-in-out infinite; }
      `}</style>

      <div className={`ca ca-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        {data.audioUrl&&<button className="ca-audio" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}

        <div className="ca-top"/>
        <div className="ca-motto">
          <p className="ca-motto-la">Quod Deus conjunxit, homo non separet — What God has joined together, let no man separate</p>
        </div>

        {/* Hero */}
        <div className="ca-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="ca-ov"/>
          <div className="ca-pat" style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:.045,backgroundImage:"radial-gradient(circle,rgba(184,150,62,1) 1px,transparent 1px)",backgroundSize:"18px 18px"}}/>
          <div className="ca-vig" style={{position:"absolute",inset:0,boxShadow:"inset 0 0 120px rgba(0,0,0,0.58)",pointerEvents:"none",zIndex:3}}/>
          <div className="ca-frame">
            <div className="ca-fc tl"/><div className="ca-fc tr"/>
            <div className="ca-fc bl"/><div className="ca-fc br"/>
          </div>
          <div className="ca-nm">
            <p className="ca-nm-en">{data.groomName} & {data.brideName}</p>
            <p className="ca-nm-la">Holy Matrimony · Sanctum Matrimonium</p>
          </div>
        </div>

        {/* Date */}
        <div className="ca-date">
          <p className="ca-date-la">Dies Nuptiarum</p>
          <p className="ca-date-num">{gc.getDate()}</p>
          <p className="ca-date-month">{gc.toLocaleString("en-US",{month:"long"}).toUpperCase()} · {gc.getFullYear()}</p>
          <div className="ca-date-bar"/>
        </div>

        {/* Countdown */}
        <div className="ca-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="ca-cdc">
              <p className="ca-cdn">{String(n).padStart(2,"0")}</p>
              <p className="ca-cdl">{l}</p>
            </div>
          ))}
        </div>

        {/* Rosary divider */}
        <div className="ca-rosary">
          <div className="ca-rb-line"/>
          {[0,1,2,3,4].map(i=><div key={i} className={`ca-rb${i===2?" big":""}`}/>)}
          <div className="ca-rb-line"/>
        </div>

        {/* Greeting */}
        <div className="ca-greet">
          <p className="ca-greet-la">Carissimi Amici et Familiae</p>
          <p className="ca-greet-t">{data.greetingTitle}</p>
          <p className="ca-greet-b">{data.messageBody}</p>
        </div>

        {/* Scripture */}
        {data.scripture&&(
          <div className="ca-scrip">
            <p className="ca-scrip-text">{data.scripture}</p>
            {data.scriptureRef&&<p className="ca-scrip-ref">{data.scriptureRef}</p>}
          </div>
        )}

        {/* Rosary divider */}
        <div className="ca-rosary" style={{margin:"22px 0"}}>
          <div className="ca-rb-line"/>
          {[0,1,2,3,4,5,6].map(i=><div key={i} className={`ca-rb${i===3?" big":""}`}/>)}
          <div className="ca-rb-line"/>
        </div>

        {/* Details */}
        <div className="ca-dets">
          {[
            {icon:"📅",k:"Date",      v:gcStr},
            {icon:"🕐",k:"Time",      v:`${data.timeEn}${data.timeAm?` (${data.timeAm})`:""}`},
            {icon:"⛪",k:"Church",    v:data.venue},
            {icon:"📍",k:"Location",  v:data.venueAddress},
          ].map(row=>(
            <div key={row.k} className="ca-det">
              <div className="ca-det-ic"><span style={{fontSize:16}}>{row.icon}</span></div>
              <div className="ca-det-bd">
                <p className="ca-det-k">{row.k}</p>
                <p className="ca-det-v">{row.v}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="ca-rosary" style={{margin:"24px 0 18px"}}>
          <div className="ca-rb-line"/>
          {[0,1,2].map(i=><div key={i} className="ca-rb"/>)}
          <div className="ca-rb-line"/>
        </div>
        <div style={{textAlign:"center",padding:"0 24px 16px"}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:"8px",letterSpacing:".28em",textTransform:"uppercase",color:"rgba(184,150,62,.6)"}}>Ordo Celebrationis</p>
          <p style={{fontFamily:"'EB Garamond',serif",fontSize:"1.3rem",fontStyle:"italic",color:CREAM,marginTop:5}}>Order of Service</p>
        </div>
        <div className="ca-prog">
          {prog.map(item=>(
            <div key={item.time} className="ca-pi">
              <div className="ca-pt">
                <p className="ca-pt-main">{item.time}</p>
                {item.timeAm&&<p className="ca-pt-am">{item.timeAm}</p>}
              </div>
              <div className="ca-pb">
                <div className="ca-pdot"/>
                <p className="ca-pb-t">{item.title}</p>
                <p className="ca-pb-la">{(item as any).titleLa??""}</p>
                <p className="ca-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="ca-rosary" style={{margin:"8px 0 18px"}}>
          <div className="ca-rb-line"/>
          {[0,1,2].map(i=><div key={i} className="ca-rb"/>)}
          <div className="ca-rb-line"/>
        </div>
        <div style={{textAlign:"center",paddingBottom:14}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:"8px",letterSpacing:".24em",textTransform:"uppercase",color:"rgba(184,150,62,.55)"}}>Locus Celebrationis · Venue</p>
        </div>
        {data.venueMapUrl?(
          <div className="ca-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>
        ):(
          <div className="ca-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(184,150,62,.28)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:"9px",color:"rgba(184,150,62,.28)"}}>Provide venueMapUrl to embed map</p>
          </div>
        )}
        {data.venueMapLink&&(
          <a href={data.venueMapLink} target="_blank" rel="noreferrer" className="ca-mapbtn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Open in Google Maps
          </a>
        )}

        {/* RSVP */}
        <div className="ca-rsvp">
          {rsvp.submitted?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <p style={{fontFamily:"'EB Garamond',serif",fontSize:"1.3rem",fontStyle:"italic",color:GOLD,marginBottom:7}}>Gratias tibi agimus!</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:"8.5px",letterSpacing:".18em",textTransform:"uppercase",color:"rgba(246,240,228,.38)"}}>Your RSVP has been received</p>
            </div>
          ):(
            <>
              <p className="ca-rsvp-la">Responde, si placet</p>
              <p className="ca-rsvp-t">Confirm Your Attendance</p>
              <label className="ca-lbl">Full Name *</label>
              <input className="ca-field" placeholder="e.g. Selamawit Girma" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="ca-lbl">Phone · ስልክ ቁጥር *</label>
              <input className="ca-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="ca-lbl">Attendance</label>
              <div className="ca-att">
                {(["yes","no","maybe"] as const).map(v=>(
                  <button key={v} onClick={()=>rsvp.update("attending",v)} className={`ca-ab${rsvp.form.attending===v?" on":""}`}>
                    {v==="yes"?"✓ Attending":v==="no"?"✗ Decline":"? Maybe"}
                  </button>
                ))}
              </div>
              <label className="ca-lbl">Number of Guests</label>
              <select className="ca-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
              </select>
              <label className="ca-lbl">Message to the Couple</label>
              <textarea className="ca-field" rows={3} style={{resize:"none"}} placeholder="Share your blessing…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="ca-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>
                {rsvp.loading?"Sending…":"Confirm RSVP"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="ca-foot">
          <svg viewBox="0 0 28 42" width="18" height="27" fill="none" stroke="rgba(184,150,62,.3)" strokeWidth="1.5" style={{display:"block",margin:"0 auto 14px"}}><line x1="14" y1="2" x2="14" y2="40"/><line x1="3" y1="13" x2="25" y2="13"/></svg>
          <p className="ca-foot-nm">{data.groomName} & {data.brideName}</p>
          <p className="ca-foot-v">{data.venue} · Ethiopia</p>
        </div>
        <div className="ca-bot"/>
      </div>
    </>
  );
}