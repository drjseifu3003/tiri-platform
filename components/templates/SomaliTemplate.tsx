"use client";
import React, { useRef, useState, useEffect } from "react";
import { InviteData } from "@/lib/types";
import { useCountdown, useRSVP } from "@/lib/hooks";
import WeddingGallery from "@/components/templates/WeddingGallery";

// ─── CULTURE TEMPLATE: Somali Ethiopian ──────────────────────────────────────
// Visual identity: culture only — Somali flag sky blue + white, star motif,
// geometric border patterns, Somali language (af Soomaali), coastal/clean palette.
// NO religious symbols — religion-agnostic.

const DEFAULT_PROGRAM = [
  { time:"9:00 AM",  timeSo:"Subax 9",   titleSo:"Munaasabadda Arooska", title:"Wedding Ceremony",  desc:"Exchange of vows & celebration" },
  { time:"11:00 AM", timeSo:"Subax 11",  titleSo:"Sawirka Qoyska",       title:"Family Photos",     desc:"Portrait session" },
  { time:"12:00 PM", timeSo:"Duhur 12",  titleSo:"Cuntada Caruusta",     title:"Wedding Feast",     desc:"Traditional Somali banquet" },
  { time:"2:00 PM",  timeSo:"Galabnimo 2",titleSo:"Hees iyo Cayaar",     title:"Music & Dance",     desc:"Dhaanto & traditional songs" },
  { time:"4:00 PM",  timeSo:"Galabnimo 4",titleSo:"Hadallada Qoyska",    title:"Family Speeches",   desc:"Tributes from elders & family" },
  { time:"6:00 PM",  timeSo:"Fiidnimo 6", titleSo:"Xafladda Xusida",     title:"Evening Celebration",desc:"Closing festivities" },
];

export default function SomaliTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prog = data.program ?? DEFAULT_PROGRAM;
  const gc   = new Date(data.date);

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),60); return ()=>clearTimeout(t); },[]);
  const toggleAudio = () => { if(!audioRef.current)return; muted?audioRef.current.play():audioRef.current.pause(); setMuted(m=>!m); };

  const BLUE="#4189C7"; const DBLUE="#1A5276"; const WHITE="#F8FAFC"; const GOLD="#C5973A";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
        .so{background:${WHITE};color:#0A1F3A;font-family:'Nunito',sans-serif;max-width:430px;margin:0 auto;overflow-x:hidden;}
        .so *{box-sizing:border-box;}
        .so-in{opacity:0;transition:opacity .65s ease;}
        .so-in.go{opacity:1;}
        /* Somali flag top bar */
        .so-flag{height:14px;background:${BLUE};display:flex;align-items:center;justify-content:center;}
        .so-flag svg{opacity:.65;}
        /* hero */
        .so-hero{position:relative;height:64vh;min-height:400px;}
        .so-hero img{width:100%;height:100%;object-fit:cover;display:block;}
        .so-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(65,137,199,.15) 0%,rgba(26,82,118,.45) 60%,${DBLUE} 100%);}
        /* Somali star watermark */
        .so-star-wm{position:absolute;top:16px;left:50%;transform:translateX(-50%);opacity:.18;pointer-events:none;}
        /* names band */
        .so-band{background:${DBLUE};padding:26px 22px 22px;text-align:center;position:relative;}
        .so-band::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:${GOLD};}
        .so-nm{font-family:'Lora',serif;font-size:clamp(1.6rem,7.5vw,2.6rem);font-style:italic;font-weight:600;color:#fff;line-height:1.2;}
        .so-nm-so{font-family:'Nunito',sans-serif;font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-top:7px;}
        .so-save{font-family:'Nunito',sans-serif;font-size:9px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-top:7px;}
        /* Somali geometric pattern band */
        .so-geo{height:20px;background:${BLUE};position:relative;overflow:hidden;}
        .so-geo::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(90deg,transparent 0,transparent 18px,rgba(255,255,255,.3) 18px,rgba(255,255,255,.3) 20px),repeating-linear-gradient(0deg,transparent 0,transparent 8px,rgba(255,255,255,.1) 8px,rgba(255,255,255,.1) 10px);}
        /* date triple */
        .so-triple{display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;background:${DBLUE};border-bottom:1px solid rgba(255,255,255,.1);}
        .so-dc{text-align:center;padding:18px 8px;}
        .so-vs{background:rgba(255,255,255,.15);margin:14px 0;}
        .so-dc-lbl{font-family:'Nunito',sans-serif;font-size:7.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:5px;}
        .so-dc-big{font-family:'Lora',serif;font-size:2.2rem;font-weight:700;color:#fff;line-height:1;}
        .so-dc-sub{font-family:'Nunito',sans-serif;font-size:10px;color:rgba(255,255,255,.5);margin-top:3px;}
        /* countdown */
        .so-cd{display:grid;grid-template-columns:repeat(4,1fr);background:${WHITE};}
        .so-cdc{text-align:center;padding:17px 4px;border-right:1px solid rgba(65,137,199,.12);border-bottom:3px solid ${BLUE};}
        .so-cdc:last-child{border-right:none;}
        .so-cdn{font-family:'Lora',serif;font-size:2.1rem;font-weight:700;color:${DBLUE};line-height:1;}
        .so-cdl{font-family:'Nunito',sans-serif;font-size:8px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:rgba(26,82,118,.35);margin-top:5px;}
        /* rule */
        .so-rule{display:flex;align-items:center;gap:10px;padding:0 22px;margin:22px 0;}
        .so-rl{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(65,137,199,.3),transparent);}
        /* section */
        .so-sh{text-align:center;padding:0 24px 14px;}
        .so-sh-so{font-family:'Nunito',sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${DBLUE};margin-bottom:5px;}
        .so-sh-en{font-family:'Lora',serif;font-size:1.3rem;color:#0A1F3A;}
        /* message */
        .so-msg{padding:0 26px 24px;text-align:center;}
        .so-msg p{font-size:13.5px;font-weight:300;line-height:1.9;color:rgba(10,31,58,.62);}
        /* details */
        .so-dets{background:rgba(65,137,199,.05);}
        .so-det{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid rgba(65,137,199,.1);}
        .so-det:last-child{border-bottom:none;}
        .so-det-ic{display:flex;align-items:center;justify-content:center;padding:15px 0;border-right:1px solid rgba(65,137,199,.1);}
        .so-det-bd{padding:13px 15px;}
        .so-det-k{font-family:'Nunito',sans-serif;font-size:8px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,82,118,.42);margin-bottom:3px;}
        .so-det-v{font-family:'Lora',serif;font-size:14px;color:#0A1F3A;line-height:1.4;}
        /* programme */
        .so-prog{padding:0 20px 24px;}
        .so-pi{display:grid;grid-template-columns:76px 1fr;margin-bottom:2px;}
        .so-pt{padding:12px 11px 12px 0;text-align:right;border-right:2px solid rgba(65,137,199,.2);}
        .so-pt-so{font-family:'Nunito',sans-serif;font-size:11px;font-weight:600;color:${DBLUE};}
        .so-pt-en{font-family:'Nunito',sans-serif;font-size:9.5px;color:rgba(10,31,58,.35);margin-top:2px;}
        .so-pb{padding:12px 0 12px 14px;position:relative;}
        .so-pdot{position:absolute;left:-5px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:${GOLD};border-radius:50%;}
        .so-pb-so{font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#0A1F3A;}
        .so-pb-en{font-family:'Lora',serif;font-size:12px;color:${DBLUE};margin-top:1px;}
        .so-pb-d{font-family:'Nunito',sans-serif;font-size:11.5px;font-weight:300;color:rgba(10,31,58,.42);margin-top:3px;}
        /* map */
        .so-map{margin:0 20px 20px;height:162px;overflow:hidden;border:1px solid rgba(65,137,199,.2);}
        .so-map iframe{width:100%;height:100%;border:none;filter:hue-rotate(190deg) saturate(.8);}
        .so-mapbtn{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 20px 24px;padding:12px;border:1.5px solid ${DBLUE};color:${DBLUE};font-family:'Nunito',sans-serif;font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;transition:all .2s;}
        .so-mapbtn:hover{background:${DBLUE};color:#fff;}
        /* rsvp */
        .so-rsvp{margin:0 20px 32px;padding:24px 20px;border:1.5px solid rgba(65,137,199,.2);background:#fff;}
        .so-rsvp-t{font-family:'Lora',serif;font-size:1.35rem;color:#0A1F3A;text-align:center;margin-bottom:4px;}
        .so-rsvp-so{font-family:'Nunito',sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(26,82,118,.42);text-align:center;margin-bottom:22px;}
        .so-lbl{font-family:'Nunito',sans-serif;font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(26,82,118,.42);display:block;margin-bottom:6px;}
        .so-field{width:100%;background:${WHITE};border:1px solid rgba(65,137,199,.2);color:#0A1F3A;padding:11px 13px;font-family:'Nunito',sans-serif;font-size:13.5px;font-weight:300;outline:none;margin-bottom:14px;transition:border-color .15s;border-radius:3px;}
        .so-field:focus{border-color:${DBLUE};}
        .so-field::placeholder{color:rgba(26,82,118,.22);}
        .so-field option{background:${WHITE};}
        .so-att{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .so-ab{padding:10px 4px;border:1px solid rgba(65,137,199,.2);background:transparent;color:rgba(26,82,118,.4);font-family:'Nunito',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:all .15s;}
        .so-ab.on{border-color:${DBLUE};color:${DBLUE};background:rgba(26,82,118,.06);}
        .so-sub{width:100%;padding:13px;background:${DBLUE};color:#fff;font-family:'Nunito',sans-serif;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;border:none;cursor:pointer;border-radius:3px;transition:opacity .2s;}
        .so-sub:hover{opacity:.9;}
        .so-sub:disabled{opacity:.42;cursor:not-allowed;}
        /* footer */
        .so-foot{background:${DBLUE};padding:22px 20px;text-align:center;}
        .so-foot-nm{font-family:'Lora',serif;font-size:1rem;font-style:italic;color:rgba(255,255,255,.55);}
        .so-foot-v{font-family:'Nunito',sans-serif;font-size:8.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.25);margin-top:5px;}
        .so-audio{position:fixed;bottom:22px;right:16px;z-index:100;width:42px;height:42px;border-radius:50%;background:${BLUE};border:none;color:#fff;font-size:17px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.3);}
      `}</style>

      <div className={`so so-in${ready?" go":""}`}>
        {data.audioUrl&&<audio ref={audioRef} src={data.audioUrl} loop/>}
        {data.audioUrl&&<button className="so-audio" onClick={toggleAudio}>{muted?"🔇":"🔊"}</button>}

        {/* Somali flag top */}
        <div className="so-flag">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="#fff"><polygon points="10,1 12.5,7 19,7 14,11 16,18 10,13.5 4,18 6,11 1,7 7.5,7"/></svg>
        </div>

        {/* Hero */}
        <div className="so-hero">
          <img src={data.couplePhotoUrl} alt=""/>
          <div className="so-ov"/>
          <svg className="so-star-wm" viewBox="0 0 48 48" width="36" height="36" fill="#fff"><polygon points="24,2 28,16 42,16 31,25 35,40 24,31 13,40 17,25 6,16 20,16"/></svg>
        </div>

        {/* Names band */}
        <div className="so-band">
          <p className="so-nm">{data.groomName} & {data.brideName}</p>
          <p className="so-nm-so">Munaasabadda Arooska · Wedding Celebration</p>
          <p className="so-save">Taariikhda Xus · Save the Date</p>
        </div>
        <div className="so-geo"/>

        {/* Triple date */}
        <div className="so-triple">
          <div className="so-dc">
            <p className="so-dc-lbl">Month</p>
            <p className="so-dc-big" style={{fontSize:"1.5rem"}}>{gc.toLocaleString("en-US",{month:"short"}).toUpperCase()}</p>
            <p className="so-dc-sub">{gc.getFullYear()}</p>
          </div>
          <div className="so-vs"/>
          <div className="so-dc">
            <p className="so-dc-lbl">Day</p>
            <p className="so-dc-big">{gc.getDate()}</p>
            <p className="so-dc-sub">{gc.toLocaleString("en-US",{weekday:"short"}).toUpperCase()}</p>
          </div>
          <div className="so-vs"/>
          <div className="so-dc">
            <p className="so-dc-lbl">Somali</p>
            <p className="so-dc-big" style={{fontSize:"1rem",marginTop:4}}>
              {["Jannaayo","Febraayo","Maarso","Abriil","Maayo","Juun","Julaay","Ogost","Sebtembar","Oktoobar","Nofembar","Diseembar"][gc.getMonth()]}
            </p>
            <p className="so-dc-sub">{gc.getDate()}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="so-cd">
          {[{n:cd.days,l:"Days"},{n:cd.hours,l:"Hours"},{n:cd.minutes,l:"Min"},{n:cd.seconds,l:"Sec"}].map(({n,l})=>(
            <div key={l} className="so-cdc"><p className="so-cdn">{String(n).padStart(2,"0")}</p><p className="so-cdl">{l}</p></div>
          ))}
        </div>

        {/* Greeting */}
        <div className="so-rule" style={{marginTop:26}}>
          <div className="so-rl"/>
          <svg viewBox="0 0 24 24" width="18" height="18" fill={GOLD}><polygon points="12,2 14.5,8.5 21,8.5 16,12.5 18,19 12,15 6,19 8,12.5 3,8.5 9.5,8.5"/></svg>
          <div className="so-rl"/>
        </div>
        <div className="so-sh">
          <p className="so-sh-so">Saaxiibbada Qaaliga ah iyo Ehelka</p>
          <p className="so-sh-en">{data.greetingTitle}</p>
        </div>
        <div className="so-msg"><p>{data.messageBody}</p></div>

        {/* Details */}
        <div className="so-rule" style={{margin:"4px 0 16px"}}><div className="so-rl"/><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="rgba(65,137,199,.5)" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg><div className="so-rl"/></div>
        <div className="so-sh" style={{paddingBottom:12}}><p className="so-sh-so">Faahfaahinta Xafladda · Event Details</p></div>
        <div className="so-dets">
          {[
            {icon:"📅",k:"Date",    v:gc.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})},
            {icon:"⏰",k:"Time",    v:data.timeEn},
            {icon:"🏛️",k:"Venue",  v:data.venue},
            {icon:"📍",k:"Location",v:data.venueAddress},
          ].map(row=>(
            <div key={row.k} className="so-det">
              <div className="so-det-ic"><span style={{fontSize:17}}>{row.icon}</span></div>
              <div className="so-det-bd"><p className="so-det-k">{row.k}</p><p className="so-det-v">{row.v}</p></div>
            </div>
          ))}
        </div>

        {/* Programme */}
        <div className="so-rule" style={{margin:"22px 0 16px"}}><div className="so-rl"/><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="rgba(65,137,199,.5)" strokeWidth="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" strokeLinecap="round"/></svg><div className="so-rl"/></div>
        <div className="so-sh" style={{paddingBottom:14}}><p className="so-sh-so">Barnaamijka Maalinta · Programme</p></div>
        <div className="so-prog">
          {prog.map(item=>(
            <div key={item.time} className="so-pi">
              <div className="so-pt">
                <p className="so-pt-so">{(item as any).timeSo??item.time}</p>
                <p className="so-pt-en">{item.time}</p>
              </div>
              <div className="so-pb">
                <div className="so-pdot"/>
                <p className="so-pb-so">{(item as any).titleSo??item.title}</p>
                <p className="so-pb-en">{item.title}</p>
                <p className="so-pb-d">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="so-rule" style={{margin:"8px 0 16px"}}><div className="so-rl"/><svg viewBox="0 0 20 20" width="14" height="14" fill={DBLUE} opacity=".5"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.17 5 11 5 11s5-6.83 5-11c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 5.5 10 5.5 11.5 6.17 11.5 7 10.83 8.5 10 8.5z"/></svg><div className="so-rl"/></div>
        <div className="so-sh" style={{paddingBottom:13}}><p className="so-sh-so">Goobta Xafladda · Venue Location</p></div>
        {data.venueMapUrl?(<div className="so-map"><iframe src={data.venueMapUrl} allowFullScreen loading="lazy" title="Venue"/></div>):(<div className="so-map" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(65,137,199,.28)" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><p style={{fontSize:"9px",color:"rgba(65,137,199,.35)"}}>Provide venueMapUrl to embed map</p></div>)}
        {data.venueMapLink&&(<a href={data.venueMapLink} target="_blank" rel="noreferrer" className="so-mapbtn"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Open in Google Maps</a>)}

        {/* RSVP */}
        <WeddingGallery images={data.galleryImages??[]} telegramChannel={data.telegramChannel} telegramName={data.telegramChannelName} coupleNames={`${data.groomName} & ${data.brideName}`} accentColor="#C5973A" bgColor="#1A5276" textColor="#F8FAFC"/>
        <div className="so-rsvp">
          {rsvp.submitted?(<div style={{textAlign:"center",padding:"18px 0"}}><p style={{fontFamily:"'Lora',serif",fontSize:"1.1rem",fontStyle:"italic",color:DBLUE,marginBottom:6}}>Mahadsanid!</p><p style={{fontSize:"9px",letterSpacing:".18em",textTransform:"uppercase",color:"rgba(26,82,118,.42)"}}>Your RSVP has been received</p></div>):(
            <>
              <p className="so-rsvp-t">RSVP</p>
              <p className="so-rsvp-so">Xaqiiji Imaatinkaaga · Confirm Attendance</p>
              <label className="so-lbl">Full Name · Magacaaga *</label>
              <input className="so-field" placeholder="e.g. Fadumo Hassan" value={rsvp.form.name} onChange={e=>rsvp.update("name",e.target.value)}/>
              <label className="so-lbl">Phone · Telefoonka *</label>
              <input className="so-field" type="tel" placeholder="+251 9XX XXX XXX" value={rsvp.form.phone} onChange={e=>rsvp.update("phone",e.target.value)}/>
              <label className="so-lbl">Attendance · Imaatinka</label>
              <div className="so-att">{(["yes","no","maybe"] as const).map(v=>(<button key={v} onClick={()=>rsvp.update("attending",v)} className={`so-ab${rsvp.form.attending===v?" on":""}`}>{v==="yes"?"✓ Imaan":"✗ Imaan Mayo"}</button>))}</div>
              <label className="so-lbl">Number of Guests</label>
              <select className="so-field" value={rsvp.form.guests} onChange={e=>rsvp.update("guests",e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}</select>
              <label className="so-lbl">Message to the Couple</label>
              <textarea className="so-field" rows={3} style={{resize:"none"}} placeholder="Faalfaalkaaga kala wadaag…" value={rsvp.form.message} onChange={e=>rsvp.update("message",e.target.value)}/>
              <button className="so-sub" onClick={rsvp.submit} disabled={rsvp.loading||!rsvp.form.name||!rsvp.form.phone}>{rsvp.loading?"Sending…":"Confirm RSVP · Xaqiiji"}</button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="so-foot">
          <p className="so-foot-nm">{data.groomName} & {data.brideName}</p>
          <p className="so-foot-v">{data.venue} · Somali Region, Ethiopia</p>
        </div>
        <div className="so-geo"/>
        <div className="so-flag"><svg viewBox="0 0 20 20" width="14" height="14" fill="#fff"><polygon points="10,1 12.5,7 19,7 14,11 16,18 10,13.5 4,18 6,11 1,7 7.5,7"/></svg></div>
      </div>
    </>
  );
}