"use client";
import { useState, useEffect } from "react";

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
    await new Promise(r => setTimeout(r, 900));
    console.log("RSVP:", { slug, ...form });
    setLoading(false);
    setSubmitted(true);
  };

  return { form, update, submit, submitted, loading };
}

export function useLang() {
  const [lang, setLang] = useState<"en" | "am">("en");
  const toggle = () => setLang(l => l === "en" ? "am" : "en");
  return { lang, toggle };
}

export function getCalendarDays(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear(), month = d.getMonth();
  const weddingDay = d.getDate();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth= new Date(year, month + 1, 0).getDate();
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return { year, month, weddingDay, firstDay, daysInMonth, monthName: MONTHS[month] };
}

export function getEthiopianDate(dateStr: string) {
  const d = new Date(dateStr);
  const AM = ["መስከረም","ጥቅምት","ህዳር","ታህሳስ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];
  const EN = ["Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit","Megabit","Miazia","Ginbot","Sene","Hamle","Nehase","Pagume"];
  const i  = ((d.getMonth() + 4) % 13);
  return { day: d.getDate(), monthAm: AM[i] ?? AM[0], monthEn: EN[i] ?? EN[0], year: d.getFullYear() - 7 };
}

export function getHijriDate(dateStr: string) {
  const d = new Date(dateStr);
  const AR = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
  const EN = ["Muharram","Safar","Rabi Al-Awwal","Rabi Al-Thani","Jumada Al-Awwal","Jumada Al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhu Al-Qi'dah","Dhu Al-Hijjah"];
  const i  = ((d.getMonth() + 2) % 12);
  return { day: d.getDate(), monthAr: AR[i], monthEn: EN[i], year: d.getFullYear() - 579 };
}