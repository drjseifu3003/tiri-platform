"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone?: string | null;
  groomPhone?: string | null;
  eventDate: string;
  location: string | null;
  status?: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  isPublished: boolean;
  _count: {
    guests: number;
    media: number;
  };
};

function resolveEventStatus(event: Pick<EventListItem, "eventDate" | "isPublished" | "status">) {
  if (event.status) return event.status;

  const now = new Date();
  const date = new Date(event.eventDate);
  if (date < now) return "COMPLETED" as const;
  if (event.isPublished) return "SCHEDULED" as const;
  return "DRAFT" as const;
}

type EventsResponse = {
  events: EventListItem[];
};

type GuestCategory = "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";

type GuestListItem = {
  id: string;
  eventId?: string;
  name: string;
  category: GuestCategory;
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
  };
};

type GuestsResponse = {
  guests: GuestListItem[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function nextAnniversaryDate(eventDate: Date, fromDate: Date) {
  const month = eventDate.getMonth();
  const day = eventDate.getDate();
  const year = fromDate.getFullYear();

  const thisYear = new Date(year, month, day);
  if (thisYear >= fromDate) return thisYear;
  return new Date(year + 1, month, day);
}

export default function DashboardPage() {
  const { status, session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [guests, setGuests] = useState<GuestListItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setLoadingData(true);
      setError(null);

      try {
        const [eventsRes, guestsRes] = await Promise.all([
          fetch("/api/studio/events", { credentials: "include" }),
          fetch("/api/studio/guests?scope=studio", { credentials: "include" }),
        ]);

        if (!eventsRes.ok || !guestsRes.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const eventsJson = (await eventsRes.json()) as EventsResponse;
        const guestsJson = (await guestsRes.json()) as GuestsResponse;

        if (!cancelled) {
          setEvents(eventsJson.events ?? []);
          setGuests(guestsJson.guests ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  const coreStats = useMemo(() => {
    const totalEvents = events.length;
    const now = new Date();
    const inThirtyDays = new Date();
    inThirtyDays.setDate(inThirtyDays.getDate() + 30);
    const upcomingThirtyDays = events.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= now && date <= inThirtyDays;
    }).length;

    const guestsCheckedInToday = guests.filter((guest) => {
      if (!guest.checkedInAt) return false;
      return isSameDate(new Date(guest.checkedInAt), now);
    }).length;

    const totalGuestsInvited = guests.length;
    const totalMedia = events.reduce((sum, event) => sum + event._count.media, 0);

    return [
      { label: "Total events", value: totalEvents },
      { label: "Upcoming events (30 days)", value: upcomingThirtyDays },
      { label: "Total guests invited", value: totalGuestsInvited },
      { label: "Guests checked-in today", value: guestsCheckedInToday },
      { label: "Total media files uploaded", value: totalMedia },
    ];
  }, [events, guests]);

  const scheduledCount = useMemo(() => events.filter((event) => resolveEventStatus(event) === "SCHEDULED").length, [events]);
  const liveCount = useMemo(() => events.filter((event) => resolveEventStatus(event) === "LIVE").length, [events]);

  const eventsToday = useMemo(() => {
    const now = new Date();
    return events.filter((event) => isSameDate(new Date(event.eventDate), now));
  }, [events]);

  const eventsThisWeek = useMemo(() => {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return events.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= now && date <= end;
    });
  }, [events]);

  const attentionItems = useMemo(() => {
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    const items: Array<{ id: string; message: string; actionHref: string; actionLabel: string }> = [];

    for (const event of events) {
      const date = new Date(event.eventDate);

      if (date >= now && date <= inSevenDays) {
        if (event._count.guests === 0) {
          items.push({
            id: `${event.id}-missing-guests`,
            message: `${event.title}: upcoming in less than 7 days with no guests added.`,
            actionHref: "/studio/guests",
            actionLabel: "Add guests",
          });
        }

        if (resolveEventStatus(event) === "DRAFT") {
          items.push({
            id: `${event.id}-not-published`,
            message: `${event.title}: event is still in draft status.`,
            actionHref: "/studio/events",
            actionLabel: "Review event",
          });
        }
      }

      if (date < now && event._count.media === 0) {
        items.push({
          id: `${event.id}-missing-media`,
          message: `${event.title}: event completed but no media uploaded.`,
          actionHref: "/studio/media",
          actionLabel: "Upload media",
        });
      }
    }

    return items.slice(0, 8);
  }, [events]);

  const upcomingWeddings = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => new Date(event.eventDate).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);

  const recentWeddings = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => new Date(event.eventDate).getTime() < now.getTime())
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [events]);

  const nextWedding = upcomingWeddings[0];
  const lastWedding = recentWeddings[0];

  const anniversaryPipeline = useMemo(() => {
    const now = new Date();
    const inNinetyDays = new Date();
    inNinetyDays.setDate(inNinetyDays.getDate() + 90);

    const items = events
      .filter((event) => new Date(event.eventDate) < now)
      .map((event) => {
        const eventDate = new Date(event.eventDate);
        const nextDate = nextAnniversaryDate(eventDate, now);
        const daysAway = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const years = nextDate.getFullYear() - eventDate.getFullYear();

        return {
          eventId: event.id,
          title: event.title,
          couple: [event.brideName, event.groomName].filter(Boolean).join(" & ") || "Couple not set",
          anniversaryDate: nextDate,
          daysAway,
          years,
          hasContact: Boolean(event.bridePhone || event.groomPhone),
        };
      })
      .filter((item) => item.anniversaryDate <= inNinetyDays)
      .sort((a, b) => a.daysAway - b.daysAway);

    return {
      items: items.slice(0, 12),
      withinThirty: items.filter((item) => item.daysAway <= 30).length,
      withinNinety: items.length,
      contactable: items.filter((item) => item.hasContact).length,
    };
  }, [events]);

  const monthlyEventTrend = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const buckets = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: monthLabel(date),
        count: 0,
      };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    for (const event of events) {
      const date = new Date(event.eventDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = bucketMap.get(key);
      if (!bucket) continue;
      bucket.count += 1;
    }

    return {
      buckets,
      peak: Math.max(1, ...buckets.map((bucket) => bucket.count)),
    };
  }, [events]);

  const dataHealth = useMemo(() => {
    return {
      missingCouplePhone: events.filter((event) => !event.bridePhone && !event.groomPhone).length,
      missingLocation: events.filter((event) => !event.location).length,
      eventsWithoutGuests: events.filter((event) => event._count.guests === 0).length,
    };
  }, [events]);

  const marketingCarouselCards = useMemo(() => {
    const now = new Date();
    const inFortyFiveDays = new Date();
    inFortyFiveDays.setDate(inFortyFiveDays.getDate() + 45);

    const live = events
      .filter((event) => resolveEventStatus(event) === "LIVE")
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 6)
      .map((event) => ({
        id: `live-${event.id}`,
        eventId: event.id,
        bucket: "LIVE WEDDING",
        headline: event.title,
        subtitle: [event.brideName, event.groomName].filter(Boolean).join(" & ") || "Couple details not set",
        meta: `Happening ${formatShortDate(new Date(event.eventDate))}`,
        cta: "Open live command center",
        tone: "linear-gradient(135deg, var(--secondary-lighter) 0%, var(--accent-lighter) 100%)",
      }));

    const scheduled = events
      .filter((event) => {
        const date = new Date(event.eventDate);
        return resolveEventStatus(event) === "SCHEDULED" && date >= now && date <= inFortyFiveDays;
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 6)
      .map((event) => ({
        id: `scheduled-${event.id}`,
        eventId: event.id,
        bucket: "NEAR FUTURE SCHEDULED",
        headline: event.title,
        subtitle: [event.brideName, event.groomName].filter(Boolean).join(" & ") || "Couple details not set",
        meta: `Launching ${formatShortDate(new Date(event.eventDate))}`,
        cta: "Prepare timeline and checklist",
        tone: "linear-gradient(135deg, var(--primary-lighter) 0%, var(--secondary-lighter) 100%)",
      }));

    const completed = events
      .filter((event) => resolveEventStatus(event) === "COMPLETED")
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, 6)
      .map((event) => ({
        id: `completed-${event.id}`,
        eventId: event.id,
        bucket: "COMPLETED WEDDING",
        headline: event.title,
        subtitle: [event.brideName, event.groomName].filter(Boolean).join(" & ") || "Couple details not set",
        meta: `Delivered ${formatShortDate(new Date(event.eventDate))}`,
        cta: "Launch anniversary follow-up",
        tone: "linear-gradient(135deg, var(--accent-lighter) 0%, var(--secondary-lighter) 100%)",
      }));

    const fallbackCards = [
      {
        id: "fallback-live",
        eventId: "",
        bucket: "LIVE WEDDING",
        headline: "No live wedding right now",
        subtitle: "When a wedding goes live, this card turns into command mode.",
        meta: "Monitor operations in real time",
        cta: "Open event board",
        tone: "linear-gradient(135deg, var(--secondary-lighter) 0%, var(--accent-lighter) 100%)",
      },
      {
        id: "fallback-scheduled",
        eventId: "",
        bucket: "NEAR FUTURE SCHEDULED",
        headline: "No near-future scheduled wedding",
        subtitle: "Your next scheduled event will be promoted here.",
        meta: "Keep the pipeline warm",
        cta: "Create new event",
        tone: "linear-gradient(135deg, var(--primary-lighter) 0%, var(--secondary-lighter) 100%)",
      },
      {
        id: "fallback-completed",
        eventId: "",
        bucket: "COMPLETED WEDDING",
        headline: "No completed weddings yet",
        subtitle: "Completed weddings unlock anniversary marketing opportunities.",
        meta: "Build long-term retention",
        cta: "Review delivered events",
        tone: "linear-gradient(135deg, var(--accent-lighter) 0%, var(--secondary-lighter) 100%)",
      },
    ];

    const cards = [...live, ...scheduled, ...completed];
    return cards.length > 0 ? cards : fallbackCards;
  }, [events]);

  const visibleMarketingCards = useMemo(() => {
    const cardCount = marketingCarouselCards.length;
    const visibleCount = Math.min(3, cardCount);

    return Array.from({ length: visibleCount }, (_, index) => {
      const currentIndex = (carouselStartIndex + index) % cardCount;
      return marketingCarouselCards[currentIndex];
    });
  }, [carouselStartIndex, marketingCarouselCards]);

  useEffect(() => {
    if (marketingCarouselCards.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCarouselStartIndex((prev) => (prev + 1) % marketingCarouselCards.length);
    }, 4500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [marketingCarouselCards.length]);

  if (status === "loading" || status === "idle" || status === "unauthenticated") {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white px-4 sm:px-6">
        <div className="py-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_280px]">

            <article className="rounded-2xl border p-6" style={{ background: "linear-gradient(135deg, #e8d4d1 0%, #d0dcd4 100%)", borderColor: "var(--border-subtle)" }}>
              <p className="text-lg font-semibold" style={{ color: "var(--primary-green)" }}>Event Pipeline</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm" style={{ color: "#8b8680" }}>Scheduled</p>
                  <p className="mt-1 text-4xl font-semibold" style={{ color: "var(--primary-green)" }}>{formatNumber(scheduledCount)}</p>
                </div>
                <div className="border-l pl-4" style={{ borderColor: "rgba(61, 55, 50, 0.1)" }}>
                  <p className="text-sm" style={{ color: "#8b8680" }}>Live</p>
                  <p className="mt-1 text-4xl font-semibold" style={{ color: "var(--primary-rose)" }}>{formatNumber(liveCount)}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}>
              <p className="text-2xl font-semibold" style={{ color: "var(--primary-green)" }}>Operational Snapshot</p>
              <p className="mt-4 text-lg font-semibold" style={{ color: "var(--primary-rose)" }}>
                Next: {nextWedding ? nextWedding.title : "No upcoming wedding"}
              </p>
              <p className="text-sm" style={{ color: "#8b8680" }}>
                Last: {lastWedding ? lastWedding.title : "No completed wedding yet"}
              </p>
              <div className="mt-6 h-20 w-full">
                <svg viewBox="0 0 220 80" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                  <path
                    d="M0 52 C24 42, 42 32, 64 36 C88 40, 105 58, 128 50 C150 42, 170 24, 194 30 C205 33, 213 40, 220 45"
                    fill="none"
                    stroke="currentColor"
                    style={{ color: "var(--primary-rose-light)" }}
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>Campaign Spotlight</p>
            <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>Wedding Pipeline Carousel</h2>
          </div>
          <div className="flex items-center gap-2">
            {marketingCarouselCards.map((card, index) => {
              const isActive = index === carouselStartIndex;
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-label={`Show card ${index + 1}`}
                  onClick={() => setCarouselStartIndex(index)}
                  className={isActive ? "h-2.5 w-6 rounded-full" : "h-2.5 w-2.5 rounded-full"}
                  style={{ background: isActive ? "var(--primary)" : "var(--border-subtle)" }}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {visibleMarketingCards.map((card) => {
            const href = card.eventId ? `/studio/events/${card.eventId}` : "/studio/events";

            return (
              <article
                key={`${card.id}-${carouselStartIndex}`}
                className="group overflow-hidden rounded-2xl border p-5 shadow-sm transition-transform duration-500 hover:-translate-y-1"
                style={{ background: card.tone, borderColor: "var(--border-subtle)" }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-secondary)" }}>{card.bucket}</p>
                <h3 className="mt-3 line-clamp-2 text-lg font-semibold" style={{ color: "var(--primary)" }}>{card.headline}</h3>
                <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--text-secondary)" }}>{card.subtitle}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>{card.meta}</p>
                <Link
                  href={href}
                  className="mt-5 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)" }}
                >
                  {card.cta}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Anniversaries in 30 Days</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--primary)" }}>{anniversaryPipeline.withinThirty}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Couples you can re-engage this month</p>
        </article>
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Anniversaries in 90 Days</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--primary)" }}>{anniversaryPipeline.withinNinety}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Upcoming yearly touchpoints in the quarter</p>
        </article>
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Contactable Couples</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--primary)" }}>{anniversaryPipeline.contactable}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Anniversary pipeline with phone contact available</p>
        </article>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Anniversary Opportunities</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Next 90 days from completed weddings</p>
        </div>
        {anniversaryPipeline.items.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>No anniversary opportunities in the upcoming 90 days.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide" style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
                  <th className="py-2 pr-3">Event</th>
                  <th className="py-2 pr-3">Couple</th>
                  <th className="py-2 pr-3">Anniversary</th>
                  <th className="py-2 pr-3">In</th>
                  <th className="py-2">Contact</th>
                </tr>
              </thead>
              <tbody>
                {anniversaryPipeline.items.map((item) => (
                  <tr key={item.eventId} className="border-b last:border-0" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                    <td className="py-2 pr-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</td>
                    <td className="py-2 pr-3">{item.couple}</td>
                    <td className="py-2 pr-3">{formatShortDate(item.anniversaryDate)}</td>
                    <td className="py-2 pr-3">{item.daysAway} days ({item.years}y)</td>
                    <td className="py-2">{item.hasContact ? "Ready" : "Missing phone"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Event Trend (Last 12 Months)</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Count of weddings by month</p>
        </div>
        <div className="mt-5 grid gap-3">
          {monthlyEventTrend.buckets.map((bucket) => {
            const width = (bucket.count / monthlyEventTrend.peak) * 100;

            return (
              <div key={bucket.key} className="grid grid-cols-[52px_1fr_40px] items-center gap-3 text-sm">
                <span style={{ color: "var(--text-secondary)" }}>{bucket.label}</span>
                <div className="h-2 rounded-full" style={{ background: "var(--secondary-lighter)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", width: `${Math.max(width, bucket.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <span className="text-right font-medium" style={{ color: "var(--text-primary)" }}>{bucket.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Missing Couple Phone</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--primary)" }}>{dataHealth.missingCouplePhone}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Events where both bride and groom phone are empty</p>
        </article>
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Missing Location</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--primary)" }}>{dataHealth.missingLocation}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Events without mapped venue/location details</p>
        </article>
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No Guest Data</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--primary)" }}>{dataHealth.eventsWithoutGuests}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Events that have zero guests recorded</p>
        </article>
      </section>
    </main>
  );
}