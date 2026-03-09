"use client";

import {
  CalendarCheck2,
  Camera,
  Church,
  ClipboardList,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type WeddingMedia = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  createdAt: string;
};

type WeddingResult = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  eventDate: string;
  location: string | null;
  description: string | null;
  coverImage: string | null;
  status: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  media: WeddingMedia[];
  _count: {
    media: number;
    guests: number;
  };
};

type WeddingCheckResponse = {
  events: WeddingResult[];
  error?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

function coupleName(event: WeddingResult) {
  const bride = event.brideName?.trim();
  const groom = event.groomName?.trim();
  if (bride && groom) return `${bride} & ${groom}`;
  if (bride) return bride;
  if (groom) return groom;
  return event.title;
}

export default function Home() {
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    phone: "",
    eventDate: "",
    eventTime: "18:00",
    location: "",
    guestCount: "",
  });
  const [phoneToCheck, setPhoneToCheck] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [results, setResults] = useState<WeddingResult[]>([]);

  const minEventDate = toDateInputValue(new Date());
  const eventDateTime = bookingForm.eventDate && bookingForm.eventTime
    ? new Date(`${bookingForm.eventDate}T${bookingForm.eventTime}`)
    : null;
  const eventDateTimePreview = eventDateTime && isValidDate(eventDateTime)
    ? new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(eventDateTime)
    : null;

  const bookingMessage = useMemo(() => {
    const dateText = eventDateTimePreview ?? "Not set";
    return [
      "Hello Kebkab Events, I want to book my wedding.",
      `Name: ${bookingForm.fullName || "-"}`,
      `Phone: ${bookingForm.phone || "-"}`,
      `Wedding date: ${dateText}`,
      `Location: ${bookingForm.location || "-"}`,
      `Estimated guests: ${bookingForm.guestCount || "-"}`,
    ].join("\n");
  }, [bookingForm, eventDateTimePreview]);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(bookingMessage)}`;

  async function handleWeddingCheckSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupError(null);
    setLookupLoading(true);
    setResults([]);

    try {
      const response = await fetch(`/api/public/wedding-check?phone=${encodeURIComponent(phoneToCheck)}`);
      const payload = (await response.json()) as WeddingCheckResponse;

      if (!response.ok) {
        setLookupError(payload.error ?? "Unable to check your wedding right now.");
        return;
      }

      setResults(payload.events ?? []);
      if ((payload.events ?? []).length === 0) {
        setLookupError("No wedding found for this phone number. Try bride or groom phone number.");
      }
    } catch {
      setLookupError("Unable to check your wedding right now.");
    } finally {
      setLookupLoading(false);
    }
  }

  const services: Array<{ title: string; desc: string; bg: string; color: string; icon: LucideIcon }> = [
    {
      title: "Full Wedding Planning",
      desc: "End-to-end planning from concept, budget, and timeline to final day delivery.",
      bg: "var(--primary-lighter)",
      color: "var(--primary)",
      icon: ClipboardList,
    },
    {
      title: "Venue and Decor Design",
      desc: "Theme direction, floral styling, stage build, and detailed event atmosphere.",
      bg: "var(--secondary-lighter)",
      color: "var(--secondary)",
      icon: Church,
    },
    {
      title: "Guest and RSVP Management",
      desc: "Invitation flow, RSVP tracking, guest list cleanup, and check-in coordination.",
      bg: "var(--accent-lighter)",
      color: "#1f6f7f",
      icon: Users,
    },
    {
      title: "Photo and Video Memories",
      desc: "Organized image/video delivery so couples can revisit memories anytime.",
      bg: "var(--surface-muted)",
      color: "var(--primary)",
      icon: Camera,
    },
    {
      title: "Vendor Coordination",
      desc: "One team managing communication with trusted makeup, decor, media, and venue partners.",
      bg: "var(--primary-lighter)",
      color: "var(--primary)",
      icon: MessageCircle,
    },
    {
      title: "Day-Of Operations",
      desc: "On-site team to run schedule, ceremony flow, and guest experience without stress.",
      bg: "var(--accent-lighter)",
      color: "#1f6f7f",
      icon: Sparkles,
    },
  ];

  const stats: Array<{ value: string; label: string; icon: LucideIcon }> = [
    { value: "500+", label: "Weddings planned", icon: CalendarCheck2 },
    { value: "1,200+", label: "Orthodox couples served", icon: Users },
    { value: "20k+", label: "Media delivered", icon: Camera },
  ];

  const processItems: Array<{ step: string; title: string; text: string; icon: LucideIcon }> = [
    { step: "01", title: "Consultation", text: "We align your vision, priorities, and budget.", icon: Phone },
    { step: "02", title: "Planning", text: "We prepare timeline, ceremony flow, and vendors.", icon: ClipboardList },
    { step: "03", title: "Execution", text: "We run the full event on your wedding day.", icon: Church },
    { step: "04", title: "Memories", text: "You access photos and videos with your phone number.", icon: ShieldCheck },
  ];

  return (
    <main className="w-full overflow-x-hidden" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-40 w-full border-b px-4 py-3 sm:px-8 lg:px-12" style={{ borderColor: "#ece3e8", background: "#ffffff" }}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Kebkab Events" className="h-10 w-10 rounded-lg object-contain" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Kebkab Events</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Orthodox Wedding Planner</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            <a href="#home" className="rounded-md px-3 py-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Home</a>
            <a href="#services" className="rounded-md px-3 py-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Services</a>
            <a href="#process" className="rounded-md px-3 py-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Process</a>
            <a href="#check" className="rounded-md px-3 py-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Check Wedding</a>
            <a href="#book" className="rounded-md px-3 py-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Book</a>
          </nav>

          <div className="flex items-center gap-2">
            <a href="#services" className="hidden rounded-md border px-3 py-2 text-sm font-medium sm:inline-flex lg:hidden" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "#ffffff" }}>
              Services
            </a>
            <Link href="/login" className="rounded-md border px-3 py-2 text-sm font-medium" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "#ffffff" }}>
              Studio Login
            </Link>
          </div>
        </div>
      </header>

      <section
        id="home"
        className="relative min-h-screen w-full px-4 pb-12 pt-6 sm:px-8 lg:px-12"
        style={{
          background: "linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 58%, var(--background) 100%)",
        }}
      >
        <div className="mt-4 grid min-h-[82vh] items-center gap-8 lg:grid-cols-[1.1fr_0.95fr]">
          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.8)" }}>
              Orthodox Wedding Planner Platform
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-[1.2] sm:text-4xl lg:text-[2.9rem]" style={{ color: "#ffffff" }}>
              Orthodox wedding planning,
              <br />
              beautifully managed.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(255,255,255,0.9)" }}>
              Book your wedding and check event details, photos, and videos anytime by bride or groom phone number.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book" className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold" style={{ background: "#ffffff", color: "var(--primary)" }}>
                Book Your Wedding
              </a>
              <a href="#check" className="inline-flex items-center justify-center rounded-md border px-5 py-3 text-sm font-semibold" style={{ borderColor: "rgba(255,255,255,0.7)", color: "#ffffff", background: "transparent" }}>
                Check Wedding by Phone
              </a>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-md border px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.1)" }}>
                  <item.icon className="mb-2 h-4 w-4" style={{ color: "rgba(255,255,255,0.9)" }} />
                  <p className="text-2xl font-semibold" style={{ color: "#ffffff" }}>{item.value}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.86)" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </article>

          <article id="book" className="rounded-2xl border p-6 sm:p-7" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>Start Here</p>
            <h2 className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>Book your wedding consultation</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Send your details in one click.
            </p>

            <form className="mt-5 space-y-3">
              <input
                value={bookingForm.fullName}
                onChange={(event) => setBookingForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Full name"
                className="ui-input"
              />
              <input
                value={bookingForm.phone}
                onChange={(event) => setBookingForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Phone number"
                className="ui-input"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={bookingForm.eventDate}
                  onChange={(event) => setBookingForm((current) => ({ ...current, eventDate: event.target.value }))}
                  className="ui-input"
                  min={minEventDate}
                />
                <input
                  type="time"
                  value={bookingForm.eventTime}
                  onChange={(event) => setBookingForm((current) => ({ ...current, eventTime: event.target.value }))}
                  className="ui-input"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={bookingForm.guestCount}
                  onChange={(event) => setBookingForm((current) => ({ ...current, guestCount: event.target.value }))}
                  placeholder="Estimated guests"
                  className="ui-input"
                />
                <div className="flex items-center rounded-md border px-3 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                  {eventDateTimePreview ?? "Select date and time"}
                </div>
              </div>
              <input
                value={bookingForm.location}
                onChange={(event) => setBookingForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Wedding location"
                className="ui-input"
              />

              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-md py-2.5 text-sm font-semibold" style={{ background: "var(--primary)", color: "#ffffff" }}>
                Send Booking Request via WhatsApp
              </a>
            </form>
          </article>
        </div>
      </section>

      <section id="services" className="w-full px-4 py-14 sm:px-8 lg:px-12" style={{ background: "#ffffff" }}>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
            Services
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl" style={{ color: "var(--primary)" }}>
            Services for Orthodox weddings
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="rounded-md border p-5" style={{ borderColor: "var(--border-subtle)", background: service.bg }}>
              <service.icon className="h-5 w-5" style={{ color: service.color }} />
              <h3 className="text-base font-semibold" style={{ color: service.color }}>{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {service.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="w-full px-4 pb-14 sm:px-8 lg:px-12" style={{ background: "#ffffff" }}>
        <div className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
            How It Works
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--primary)" }}>
            Simple journey
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {processItems.map((item) => (
              <article key={item.step} className="rounded-md border p-4" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold" style={{ color: "var(--secondary)" }}>{item.step}</p>
                  <item.icon className="h-4 w-4" style={{ color: "var(--secondary)" }} />
                </div>
                <h3 className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="check" className="w-full px-4 pb-14 sm:px-8 lg:px-12" style={{ background: "var(--background)" }}>
        <div className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
            Couple Access
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--primary)" }}>
            Check your wedding and media by phone number
          </h2>
          <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
            Use bride or groom phone number to view your wedding.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Bride or groom phone</span>
            <span className="inline-flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" /> Photos and videos</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Private access</span>
          </div>

          <form onSubmit={handleWeddingCheckSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={phoneToCheck}
              onChange={(event) => setPhoneToCheck(event.target.value)}
              placeholder="Bride or groom phone number"
              className="ui-input h-11 flex-1"
              required
            />
            <button type="submit" className="h-11 rounded-md px-6 text-sm font-semibold" style={{ background: "var(--primary)", color: "#ffffff" }} disabled={lookupLoading}>
              {lookupLoading ? "Checking..." : "Check Wedding"}
            </button>
          </form>

          {lookupError ? (
            <p className="mt-3 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}>
              {lookupError}
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="mt-6 space-y-5">
              {results.map((event) => (
                <article key={event.id} className="rounded-md border p-4 sm:p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>{event.title}</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{coupleName(event)}</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <CalendarCheck2 className="h-3.5 w-3.5" />
                        {formatDate(event.eventDate)}
                        <span>|</span>
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location || "Location pending"}
                      </p>
                    </div>
                    <div className="text-right text-xs" style={{ color: "var(--text-secondary)" }}>
                      <p className="inline-flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> {event._count.media} media files</p>
                      <p className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {event._count.guests} guests</p>
                    </div>
                  </div>

                  {event.media.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {event.media.map((media) => (
                        <a key={media.id} href={media.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-md border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                          {media.type === "IMAGE" ? (
                            <img src={media.url} alt="Wedding media" className="h-24 w-full object-cover transition duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-24 items-center justify-center text-xs font-medium" style={{ color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
                              Video
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      No media uploaded yet for this wedding.
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="w-full border-t px-4 py-10 sm:px-8 lg:px-12" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Kebkab Events" className="h-8 w-8 rounded-md object-contain" />
              <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Kebkab Events</p>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              Orthodox wedding planner for booking, operations, and memory delivery.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>Navigation</p>
            <div className="mt-2 space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p><a href="#home">Home</a></p>
              <p><a href="#services">Services</a></p>
              <p><a href="#process">Process</a></p>
              <p><a href="#check">Check Wedding</a></p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>Contact</p>
            <div className="mt-2 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +251 970 515 050</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>Quick Action</p>
            <a href="#book" className="mt-2 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold" style={{ background: "var(--primary)", color: "#ffffff" }}>
              Book Consultation
            </a>
          </div>
        </div>

        <p className="mt-8 border-t pt-4 text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
          {new Date().getFullYear()} Kebkab Events. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
