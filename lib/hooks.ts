"use client";
import { useState, useEffect, useCallback } from "react";

// ─── Countdown ────────────────────────────────────────────────────────────────
export function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return time;
}

// ─── RSVP ─────────────────────────────────────────────────────────────────────
export type RSVPForm = {
  name: string;
  phone: string;
  attending: "yes" | "no" | "maybe";
  guests: string;
  message: string;
};

export function useRSVP(slug: string) {
  const [form, setForm] = useState<RSVPForm>({
    name: "", phone: "", attending: "yes", guests: "1", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const update = (k: keyof RSVPForm, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    // TODO: replace with your real API call:
    // await fetch("/api/rsvp", { method: "POST", body: JSON.stringify({ slug, ...form }) });
    await new Promise(r => setTimeout(r, 900));
    console.log("RSVP submitted:", { slug, ...form });
    setLoading(false);
    setSubmitted(true);
  };

  return { form, update, submit, submitted, loading };
}

// ─── Language toggle ──────────────────────────────────────────────────────────
export function useLang() {
  const [lang, setLang] = useState<"en" | "am">("en");
  const toggle = () => setLang(l => l === "en" ? "am" : "en");
  return { lang, toggle };
}

// ─── Gregorian calendar grid ──────────────────────────────────────────────────
// Used by: EthiopianCelebration (03), OrthodoxMinimal (05), DiasporaTemplate
export function getCalendarDays(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth();
  const weddingDay  = d.getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  return { year, month, weddingDay, firstDay, daysInMonth, monthName: MONTHS[month] };
}

// ─── Ethiopian calendar ───────────────────────────────────────────────────────
// Used by: HasbeshaClassic (01), HasbeshaRoyal (02), EthiopianCelebration (03),
//          OrthodoxHolyUnion (04), OrthodoxMinimal (05), ElegantUniversal (10),
//          StoryPhoto (09), HasbeshaTemplate, TigraiTemplate
export function getEthiopianDate(dateStr: string) {
  const d = new Date(dateStr);
  const AM = ["መስከረም","ጥቅምት","ህዳር","ታህሳስ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];
  const EN = ["Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit","Megabit","Miazia","Ginbot","Sene","Hamle","Nehase","Pagume"];
  const i  = ((d.getMonth() + 4) % 13);
  return {
    day:     d.getDate(),
    monthAm: AM[i] ?? AM[0],
    monthEn: EN[i] ?? EN[0],
    year:    d.getFullYear() - 7,
  };
}

// ─── Hijri calendar ───────────────────────────────────────────────────────────
// Used by: NikahElegant (06), NikahMinimal (07), MuslimTemplate
export function getHijriDate(dateStr: string) {
  const d = new Date(dateStr);
  const AR = [
    "محرم","صفر","ربيع الأول","ربيع الثاني",
    "جمادى الأولى","جمادى الآخرة","رجب","شعبان",
    "رمضان","شوال","ذو القعدة","ذو الحجة",
  ];
  const EN = [
    "Muharram","Safar","Rabi Al-Awwal","Rabi Al-Thani",
    "Jumada Al-Awwal","Jumada Al-Thani","Rajab","Sha'ban",
    "Ramadan","Shawwal","Dhu Al-Qi'dah","Dhu Al-Hijjah",
  ];
  const i = ((d.getMonth() + 2) % 12);
  return {
    day:     d.getDate(),
    monthAr: AR[i],
    monthEn: EN[i],
    year:    d.getFullYear() - 579,
  };
}

// ─── Somali months ────────────────────────────────────────────────────────────
// Used by: SomaliTemplate, NikahMinimal (07)
export function getSomaliDate(dateStr: string) {
  const d = new Date(dateStr);
  const SO = [
    "Jannaayo","Febraayo","Maarso","Abriil",
    "Maayo","Juun","Julaay","Ogost",
    "Sebtembar","Oktoobar","Nofembar","Diseembar",
  ];
  const WEEKDAY_SO = ["Axad","Isniin","Talaado","Arbaco","Khamiis","Jimco","Sabti"];
  return {
    day:       d.getDate(),
    monthSo:   SO[d.getMonth()],
    year:      d.getFullYear(),
    weekdaySo: WEEKDAY_SO[d.getDay()],
  };
}

// ─── Oromo date ───────────────────────────────────────────────────────────────
// Used by: OromoTemplate, EthiopianCelebration (03)
export function getOromoDate(dateStr: string) {
  const d = new Date(dateStr);
  const OR = [
    "Amajjii","Guraandhala","Bitooteessa","Elba",
    "Caamsa","Waxabajjii","Adoolessa","Hagayya",
    "Fuulbana","Onkoloolessa","Sadaasa","Muddee",
  ];
  return {
    day:       d.getDate(),
    monthOr:   OR[d.getMonth()],
    year:      d.getFullYear(),
    weekdayEn: d.toLocaleString("en-US", { weekday: "long" }),
  };
}

// ─── Template tier map ────────────────────────────────────────────────────────
export type TemplateTier = "free" | "paid" | "premium";

export const TEMPLATE_TIERS: Record<string, TemplateTier> = {
  "habesha-classic":   "paid",
  "habesha-royal":     "premium",
  "eth-celebration":   "paid",
  "orthodox-holy":     "premium",
  "orthodox-minimal":  "paid",
  "nikah-elegant":     "premium",
  "nikah-minimal":     "free",
  "diaspora-luxury":   "premium",
  "story-photo":       "paid",
  "elegant-universal": "free",
};

export function getTemplateTier(key: string): TemplateTier {
  return TEMPLATE_TIERS[key] ?? "free";
}