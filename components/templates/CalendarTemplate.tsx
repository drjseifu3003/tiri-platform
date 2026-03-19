"use client";
import React, { useRef, useState } from "react";
import { InviteData } from "../../lib/types";
import { useCountdown, useRSVP, useLang, getCalendarDays } from "../../lib/hooks";

export default function CalendarTemplate({ data }: { data: InviteData }) {
  const cd   = useCountdown(data.date);
  const rsvp = useRSVP(data.slug);
  const { lang, toggle } = useLang();
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const warm   = data.primaryColor ?? "#6b4c2a";
  const accent = data.accentColor  ?? "#f0d080";

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (muted) { audioRef.current.play(); setMuted(false); }
    else       { audioRef.current.pause(); setMuted(true); }
  };

  const { year, weddingDay, firstDay, daysInMonth, monthName } = getCalendarDays(data.date);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="relative max-w-[480px] mx-auto overflow-x-hidden min-h-screen"
      style={{ background: "#f5ede0", color: "#2c1a0a", fontFamily: "'DM Sans', sans-serif" }}>

      {data.audioUrl && <audio ref={audioRef} src={data.audioUrl} loop />}

      {/* Controls */}
      <div className="fixed top-3.5 right-3.5 flex gap-2 z-50">
        {data.audioUrl && (
          <button onClick={toggleAudio}
            className="w-[34px] h-[34px] rounded-full border-none text-white text-xs flex items-center justify-center cursor-pointer"
            style={{ background: `${warm}D9` }}>
            {muted ? "🔇" : "🔊"}
          </button>
        )}
        {data.messageBodyAm && (
          <button onClick={toggle}
            className="w-[34px] h-[34px] rounded-full border-none text-white text-xs flex items-center justify-center cursor-pointer"
            style={{ background: `${warm}D9` }}>
            {lang === "en" ? "አማ" : "EN"}
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[360px]">
        <img src={data.couplePhotoUrl} alt={`${data.groomName} & ${data.brideName}`}
          className="w-full h-full object-cover block" />
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(107,76,42,0.35) 65%, ${warm} 100%)` }} />
        {data.scripture && (
          <div className="absolute top-0 left-0 right-0 px-6 pt-5 text-center z-10"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)" }}>
            <p className="text-xs italic leading-[1.6] text-white/75" style={{ fontFamily: "'Playfair Display', serif" }}>
              {data.scripture}
            </p>
            {data.scriptureRef && (
              <p className="text-[10px] tracking-[0.12em] uppercase text-white/45 mt-1 font-medium">
                {data.scriptureRef}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Warm band — names */}
      <div className="text-center px-6 py-7" style={{ background: warm }}>
        <p className="text-[clamp(2rem,9vw,2.8rem)] italic font-semibold leading-none text-white"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === "am" && data.groomNameAm
            ? `${data.groomNameAm} & ${data.brideNameAm}`
            : `${data.groomName} & ${data.brideName}`}
        </p>
        <p className="text-[10px] tracking-[0.25em] uppercase text-white/55 mt-2 font-medium">
          Save the Date
        </p>
      </div>

      {/* Calendar */}
      <div className="px-6 pb-7" style={{ background: warm }}>
        <div className="text-center mb-5">
          <span className="text-[2rem] font-bold tracking-[0.06em] text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {monthName}
          </span>
          <span className="text-lg text-white/50 ml-2.5">{year}</span>
        </div>
        <div className="grid grid-cols-7 mb-1.5">
          {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => (
            <div key={d} className="text-center text-[9px] font-medium tracking-[0.12em] text-white/40 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => (
            <div key={i}
              className={`aspect-square flex items-center justify-center text-[13px] rounded-full relative
                ${day === null ? "text-transparent" : "text-white/70"}
                ${day === weddingDay ? "bg-white/12" : ""}`}
              style={day === weddingDay ? { border: `2px solid ${accent}CC` } : {}}>
              {day === weddingDay ? (
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill={accent} stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              ) : day !== null ? day : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 border-b" style={{ background: "#f5ede0", borderColor: `${warm}1F` }}>
        {[
          { n: cd.days, l: "Days" }, { n: cd.hours, l: "Hours" },
          { n: cd.minutes, l: "Min" }, { n: cd.seconds, l: "Sec" },
        ].map(({ n, l }, i) => (
          <div key={l} className={`text-center py-4.5 ${i < 3 ? "border-r" : ""}`}
            style={{ borderColor: `${warm}1A` }}>
            <p className="text-[2rem] font-bold leading-none" style={{ fontFamily: "'Playfair Display', serif", color: warm }}>
              {String(n).padStart(2, "0")}
            </p>
            <p className="text-[8px] tracking-[0.15em] uppercase mt-1.5 font-medium" style={{ color: `${warm}66` }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="px-7 py-9" style={{ background: "#f5ede0" }}>
        <p className="text-[1.5rem] italic text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: warm }}>
          {lang === "am" && data.greetingTitleAm ? data.greetingTitleAm : data.greetingTitle}
        </p>
        <p className="text-sm leading-[1.85] text-center font-light" style={{ color: "rgba(44,26,10,0.7)" }}>
          {lang === "am" && data.messageBodyAm ? data.messageBodyAm : data.messageBody}
        </p>

        {/* Details */}
        <div className="mt-7">
          {[
            { key: "Date",     val: new Date(data.date).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}) },
            { key: "Time",     val: `${data.timeInt} (${data.timeET})` },
            { key: "Venue",    val: data.venue },
            { key: "Location", val: data.venueAddress },
          ].map((row, i) => (
            <div key={row.key} className={`flex items-start gap-3.5 py-3 ${i < 3 ? "border-b" : ""}`}
              style={{ borderColor: `${warm}1A` }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 opacity-60" style={{ background: warm }} />
              <div>
                <p className="text-[9px] font-semibold tracking-[0.18em] uppercase mb-0.5" style={{ color: `${warm}59` }}>
                  {row.key}
                </p>
                <p className="text-[15px]" style={{ fontFamily: "'Playfair Display', serif", color: "#2c1a0a" }}>
                  {row.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        {data.venueMapLink && (
          <a href={data.venueMapLink} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 mt-7 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase no-underline transition-colors"
            style={{ border: `1.5px solid ${warm}`, color: warm }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = warm; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = warm; }}>
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Open in Google Maps
          </a>
        )}

        {/* RSVP */}
        <div className="mt-7 p-7 border bg-white" style={{ borderColor: `${warm}33` }}>
          {rsvp.submitted ? (
            <div className="text-center py-5">
              <p className="text-[1.3rem] italic font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: warm }}>
                Thank You!
              </p>
              <p className="text-sm font-light" style={{ color: "rgba(44,26,10,0.5)" }}>
                Your RSVP has been received. We can't wait to celebrate with you!
              </p>
            </div>
          ) : (
            <>
              <p className="text-[1.4rem] font-semibold text-center mb-1.5" style={{ fontFamily: "'Playfair Display', serif", color: "#2c1a0a" }}>
                RSVP
              </p>
              <p className="text-[10px] tracking-[0.15em] uppercase text-center mb-5 font-medium" style={{ color: `${warm}59` }}>
                Please confirm your attendance
              </p>
              <input
                className="w-full px-3.5 py-2.5 text-sm outline-none mb-3 rounded-sm transition-colors"
                style={{ background: "#f5ede0", border: `1px solid ${warm}26`, color: "#2c1a0a" }}
                placeholder="Your full name"
                onFocus={e => (e.currentTarget.style.borderColor = warm)}
                onBlur={e => (e.currentTarget.style.borderColor = `${warm}26`)}
                value={rsvp.form.name} onChange={e => rsvp.update("name", e.target.value)} />
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(["yes","no","maybe"] as const).map(v => (
                  <button key={v} onClick={() => rsvp.update("attending", v)}
                    className="py-2.5 text-[10px] font-medium tracking-[0.1em] uppercase cursor-pointer rounded-sm transition-all"
                    style={{
                      border: `1px solid ${rsvp.form.attending === v ? warm : `${warm}26`}`,
                      color: rsvp.form.attending === v ? warm : `${warm}66`,
                      background: rsvp.form.attending === v ? `${warm}0F` : "transparent",
                    }}>
                    {v === "yes" ? "Attending" : v === "no" ? "Decline" : "Maybe"}
                  </button>
                ))}
              </div>
              <input type="number" min="1"
                className="w-full px-3.5 py-2.5 text-sm outline-none mb-3 rounded-sm"
                style={{ background: "#f5ede0", border: `1px solid ${warm}26`, color: "#2c1a0a" }}
                placeholder="Number of guests"
                value={rsvp.form.guests} onChange={e => rsvp.update("guests", e.target.value)} />
              <textarea rows={3}
                className="w-full px-3.5 py-2.5 text-sm outline-none mb-3 resize-none rounded-sm"
                style={{ background: "#f5ede0", border: `1px solid ${warm}26`, color: "#2c1a0a" }}
                placeholder="Leave a message (optional)"
                value={rsvp.form.message} onChange={e => rsvp.update("message", e.target.value)} />
              <button onClick={rsvp.submit} disabled={rsvp.loading || !rsvp.form.name}
                className="w-full py-3.5 border-none text-xs font-bold tracking-[0.2em] uppercase cursor-pointer rounded-sm transition-opacity hover:opacity-88 disabled:opacity-50"
                style={{ background: warm, color: "#fff" }}>
                {rsvp.loading ? "Sending..." : "Confirm RSVP"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center px-6 pb-10 pt-6" style={{ background: warm }}>
        <p className="text-base italic text-white/50" style={{ fontFamily: "'Playfair Display', serif" }}>
          {data.groomName} & {data.brideName}
        </p>
        <p className="text-[11px] text-white/35 mt-1.5">📍 {data.venue}</p>
      </div>
    </div>
  );
}
