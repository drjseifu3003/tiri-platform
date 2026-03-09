"use client";

import {
  CalendarCheck2,
  Camera,
  Church,
  ClipboardList,
  MapPin,
  Phone,
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

  const services: Array<{ title: string; desc: string; icon: LucideIcon }> = [
    {
      title: "Full Wedding Planning",
      desc: "End-to-end planning from concept, budget, and timeline to final day delivery.",
      icon: ClipboardList,
    },
    {
      title: "Venue and Decor Design",
      desc: "Theme direction, floral styling, stage build, and detailed event atmosphere.",
      icon: Church,
    },
    {
      title: "Guest Management",
      desc: "Invitation flow, RSVP tracking, guest list cleanup, and check-in coordination.",
      icon: Users,
    },
    {
      title: "Photo and Video",
      desc: "Organized image and video delivery so couples can revisit memories anytime.",
      icon: Camera,
    },
    {
      title: "Vendor Coordination",
      desc: "One team managing communication with trusted makeup, decor, media, and venue partners.",
      icon: Phone,
    },
    {
      title: "Day-Of Operations",
      desc: "On-site team to run schedule, ceremony flow, and guest experience seamlessly.",
      icon: CalendarCheck2,
    },
  ];

  return (
    <main className="w-full overflow-x-hidden" style={{ background: "#ffffff" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b px-4 py-4 sm:px-8 lg:px-12" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Kebkab Events" className="h-10 w-10 rounded-lg object-contain" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Kebkab Events</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Orthodox Wedding Planner</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#home" className="text-sm font-medium transition" style={{ color: "var(--text-secondary)" }}>Home</a>
            <a href="#services" className="text-sm font-medium transition" style={{ color: "var(--text-secondary)" }}>Services</a>
            <a href="#process" className="text-sm font-medium transition" style={{ color: "var(--text-secondary)" }}>Process</a>
            <a href="#check" className="text-sm font-medium transition" style={{ color: "var(--text-secondary)" }}>Check Wedding</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "transparent" }}>
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Booking */}
      <section id="home" className="w-full px-4 py-16 sm:px-8 lg:px-12" style={{ background: "var(--primary)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            {/* Left: Headline */}
            <div className="text-white py-8 sm:py-12">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
                Orthodox Wedding Planning
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-5xl font-semibold leading-tight tracking-tight">
                Your wedding, beautifully orchestrated
              </h1>
              <p className="mt-6 text-lg leading-relaxed opacity-90">
                Complete event planning, guest management, and media delivery. Book your consultation today.
              </p>
            </div>

            {/* Right: Booking Form */}
            <div className="rounded-lg bg-white p-6 sm:p-8">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Book Your Wedding</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Share your details and we'll contact you shortly.
              </p>

              <form className="mt-5 space-y-3">
                <input
                  value={bookingForm.fullName}
                  onChange={(event) => setBookingForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Full name"
                  className="ui-input w-full"
                />
                <input
                  value={bookingForm.phone}
                  onChange={(event) => setBookingForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Phone number"
                  className="ui-input w-full"
                  required
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
                  <input
                    value={bookingForm.location}
                    onChange={(event) => setBookingForm((current) => ({ ...current, location: event.target.value }))}
                    placeholder="Wedding location"
                    className="ui-input"
                  />
                </div>

                <a href={whatsappHref} target="_blank" rel="noreferrer" className="block w-full text-center py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--primary)", color: "#ffffff" }}>
                  Send via WhatsApp
                </a>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full px-4 py-16 sm:px-8 lg:px-12" style={{ background: "var(--surface-muted)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Services</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Everything you need for your wedding
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
                <service.icon className="h-6 w-6" style={{ color: "var(--primary)" }} />
                <h3 className="mt-3 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="w-full px-4 py-16 sm:px-8 lg:px-12" style={{ background: "#ffffff" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>How It Works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Simple four-step process
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { step: "01", title: "Consultation", desc: "We align your vision, priorities, and budget." },
              { step: "02", title: "Planning", desc: "We prepare timeline, ceremony flow, and vendors." },
              { step: "03", title: "Execution", desc: "We run the full event on your wedding day." },
              { step: "04", title: "Memories", desc: "Access photos and videos with your phone number." },
            ].map((item) => (
              <div key={item.step} className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                <p className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>{item.step}</p>
                <h3 className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wedding Check Section */}
      <section id="check" className="w-full px-4 py-16 sm:px-8 lg:px-12" style={{ background: "#ffffff" }}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Check Your Wedding</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
              View your wedding and memories
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Use bride or groom phone number to access your event details, photos, and videos.
            </p>
          </div>

          <form onSubmit={handleWeddingCheckSubmit} className="flex flex-col gap-4 sm:flex-row">
            <input
              value={phoneToCheck}
              onChange={(event) => setPhoneToCheck(event.target.value)}
              placeholder="Bride or groom phone number"
              className="ui-input h-11 flex-1"
              required
            />
            <button type="submit" className="h-11 px-6 rounded-lg text-sm font-semibold" style={{ background: "var(--primary)", color: "#ffffff" }} disabled={lookupLoading}>
              {lookupLoading ? "Checking..." : "Check"}
            </button>
          </form>

          {lookupError ? (
            <p className="mt-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}>
              {lookupError}
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="mt-8 space-y-4">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Your Wedding{results.length > 1 ? 's' : ''} Found</p>
              {results.map((event) => (
                <Link key={event.id} href={`/gallery/${event.id}`} className="block rounded-lg border p-6 transition hover:border-opacity-100" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{event.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="flex items-center gap-2">
                      <CalendarCheck2 className="h-4 w-4" />
                      {formatDate(event.eventDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      {event._count.media} files
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--primary)" }}>View wedding →</p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t px-4 py-8 sm:px-8 lg:px-12" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            © 2024 Kebkab Events. Orthodox wedding planning platform.
          </p>
        </div>
      </footer>
    </main>
  );
}
