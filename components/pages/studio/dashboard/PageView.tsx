"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

type EventListItem = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  eventDate: string;
  location: string | null;
  status?: EventStatus;
  isPublished: boolean;
  _count: {
    guests: number;
    media: number;
  };
};

type EventsResponse = {
  events: EventListItem[];
  pagination?: {
    page: number;
    totalPages: number;
    hasNext: boolean;
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

function statusLabel(status: ReturnType<typeof resolveEventStatus>) {
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "LIVE") return "Live";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

function statusClasses(status: ReturnType<typeof resolveEventStatus>) {
  if (status === "LIVE") return "border-rose-300 bg-rose-50 text-rose-800";
  if (status === "SCHEDULED") return "border-sky-300 bg-sky-50 text-sky-800";
  if (status === "COMPLETED") return "border-slate-300 bg-slate-100 text-slate-700";
  if (status === "CANCELLED") return "border-red-300 bg-red-50 text-red-700";
  if (status === "ARCHIVED") return "border-zinc-300 bg-zinc-100 text-zinc-700";
  return "border-amber-300 bg-amber-50 text-amber-800";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function coupleLabel(event: EventListItem) {
  const bride = event.brideName?.trim();
  const groom = event.groomName?.trim();
  if (bride && groom) return `${bride} & ${groom}`;
  if (bride) return bride;
  if (groom) return groom;
  return "Pending names";
}

function initialsForCouple(event: EventListItem) {
  const first = (event.brideName ?? event.groomName ?? event.title).trim().charAt(0).toUpperCase();
  const second = (event.groomName ?? event.brideName ?? "").trim().charAt(0).toUpperCase();
  return `${first}${second || ""}`;
}

type HighlightSlide = {
  id: string;
  kind: "next" | "live";
  title: string;
  subtitle: string;
  eventId: string;
};

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadDashboard() {
      setLoadingData(true);

      try {
        const allEvents: EventListItem[] = [];
        let page = 1;
        let hasNext = true;
        let guard = 0;

        while (hasNext && guard < 50) {
          const response = await fetch(`/api/studio/events?page=${page}&pageSize=100&filter=all`, {
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Unable to load dashboard data");
          }

          const json = (await response.json()) as EventsResponse;
          allEvents.push(...(json.events ?? []));
          hasNext = !!json.pagination?.hasNext;
          page += 1;
          guard += 1;
        }

        if (!cancelled) {
          setEvents(allEvents);
        }
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  const allCounts = useMemo(() => {
    const counts: Record<EventStatus, number> = {
      DRAFT: 0,
      SCHEDULED: 0,
      LIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      ARCHIVED: 0,
    };

    for (const event of events) {
      counts[resolveEventStatus(event)] += 1;
    }

    return {
      total: events.length,
      active: counts.SCHEDULED + counts.LIVE,
      completed: counts.COMPLETED,
      closed: counts.CANCELLED + counts.ARCHIVED,
    };
  }, [events]);

  const nearTermCounts = useMemo(() => {
    const now = new Date();
    const inSevenDays = new Date(now);
    const inThirtyDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    inThirtyDays.setDate(inThirtyDays.getDate() + 30);

    const in7Days = events.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= now && date <= inSevenDays;
    }).length;

    const in30Days = events.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= now && date <= inThirtyDays;
    }).length;

    return { in7Days, in30Days };
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => {
        const status = resolveEventStatus(event);
        if (status === "CANCELLED" || status === "ARCHIVED") return false;
        return new Date(event.eventDate).getTime() >= now.getTime();
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);

  const liveEvents = useMemo(() => {
    return [...events]
      .filter((event) => resolveEventStatus(event) === "LIVE")
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [events]);

  const slides = useMemo<HighlightSlide[]>(() => {
    const output: HighlightSlide[] = [];

    if (liveEvents[0]) {
      const liveEvent = liveEvents[0];
      output.push({
        id: `live-${liveEvent.id}`,
        kind: "live",
        title: liveEvent.title,
        subtitle: `${formatEventDate(liveEvent.eventDate)} - ${liveEvent.location ?? "Location TBD"}`,
        eventId: liveEvent.id,
      });
    }

    if (upcomingEvents[0]) {
      const nextEvent = upcomingEvents[0];
      output.push({
        id: `next-${nextEvent.id}`,
        kind: "next",
        title: nextEvent.title,
        subtitle: `${formatEventDate(nextEvent.eventDate)} - ${nextEvent.location ?? "Location TBD"}`,
        eventId: nextEvent.id,
      });
    }

    return output;
  }, [liveEvents, upcomingEvents]);

  useEffect(() => {
    if (slides.length <= 1) {
      setActiveSlide(0);
      return;
    }

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, slides.length]);

  if (status === "loading" || status === "idle" || status === "unauthenticated" || loadingData) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading dashboard...</p>
      </main>
    );
  }

  const activeHighlight = slides[activeSlide];
  const isLiveHighlight = activeHighlight?.kind === "live";

  return (
    <main className="flex min-h-full flex-col gap-6">
      <section className="grid gap-4 xl:grid-cols-3">
        {slides.length > 0 && activeHighlight ? (
          <section
            className="relative overflow-hidden rounded-2xl border p-6 xl:col-span-2"
            style={{
              borderColor: "var(--border-subtle)",
              background: isLiveHighlight
                ? "linear-gradient(135deg, var(--secondary-lighter) 0%, var(--surface) 55%, var(--primary-lighter) 100%)"
                : "linear-gradient(135deg, var(--primary-lighter) 0%, var(--surface) 55%, var(--secondary-lighter) 100%)",
            }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full" style={{ background: isLiveHighlight ? "var(--secondary-light)" : "var(--primary-lighter)", opacity: 0.28 }} />
            <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full" style={{ background: isLiveHighlight ? "var(--primary-light)" : "var(--secondary-light)", opacity: 0.2 }} />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{
                    borderColor: isLiveHighlight ? "var(--secondary-light)" : "var(--primary-lighter)",
                    color: isLiveHighlight ? "var(--secondary)" : "var(--primary)",
                    background: "color-mix(in srgb, var(--surface) 78%, transparent)",
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: isLiveHighlight ? "var(--secondary)" : "var(--primary)" }} />
                  {isLiveHighlight ? "Live Event" : "Upcoming"}
                </span>

                <h2 className="mt-3 truncate text-2xl font-semibold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
                  {activeHighlight.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
                  {activeHighlight.subtitle}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {slides.length > 1 ? (
                  <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1" style={{ borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface) 82%, transparent)" }}>
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className="h-2.5 rounded-full transition-all"
                        style={{
                          width: activeSlide === index ? "1.5rem" : "0.5rem",
                          background: activeSlide === index ? "var(--primary)" : "var(--border-subtle)",
                        }}
                        aria-label={`Show highlight ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : null}

                <Link href={`/studio/events/${activeHighlight.eventId}`} className="ui-button-primary h-10 shrink-0">
                  Open Event
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border p-6 xl:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Welcome to Dashboard</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Your event highlights will appear here once upcoming or live events are available.
            </p>
          </section>
        )}

        <aside className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
            Pipeline Snapshot
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>In 7 Days</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(nearTermCounts.in7Days)}</p>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>In 30 Days</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(nearTermCounts.in30Days)}</p>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Live Right Now</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(liveEvents.length)}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Total Weddings</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(allCounts.total)}</p>
        </article>
        <article className="rounded-xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Active</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(allCounts.active)}</p>
        </article>
        <article className="rounded-xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Completed</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(allCounts.completed)}</p>
        </article>
        <article className="rounded-xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Closed</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(allCounts.closed)}</p>
        </article>
      </section>

      <section className="ui-page rounded-lg flex h-[calc(100dvh-28rem)] min-h-[26rem] flex-col overflow-hidden p-4">
        <div className="ui-page-header block">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="ui-title">Upcoming Events</h3>
              <p className="ui-subtitle">Track scheduled pipeline and quickly open event details.</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/studio/events" className="ui-button-secondary h-10 shrink-0">
                View All
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-2 min-h-0 flex-1">
          {upcomingEvents.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No upcoming events available.</p>
            </div>
          ) : (
            <div className="ui-table mt-0 rounded-lg flex h-full min-h-0 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-auto md:hidden">
                <div className="grid gap-3 p-3 sm:grid-cols-2">
                  {upcomingEvents.slice(0, 5).map((event) => {
                    const status = resolveEventStatus(event);

                    return (
                      <article
                        key={event.id}
                        className="cursor-pointer rounded-lg border p-3 transition hover:-translate-y-px"
                        style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                        role="link"
                        tabIndex={0}
                        onClick={() => router.push(`/studio/events/${event.id}`)}
                        onKeyDown={(keyboardEvent) => {
                          if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                            keyboardEvent.preventDefault();
                            router.push(`/studio/events/${event.id}`);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-800">{event.title}</p>
                            <p className="mt-1 truncate text-xs text-zinc-500">{event.location ?? "No location provided"}</p>
                          </div>
                          <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(status)}`}>{statusLabel(status)}</span>
                        </div>
                        <p className="mt-3 text-sm text-zinc-600">{formatEventDate(event.eventDate)}</p>
                        <p className="mt-1 text-sm text-zinc-600">{coupleLabel(event)} · {formatNumber(event._count.guests)} guests</p>
                        <div className="mt-4">
                          <Link
                            href={`/studio/events/${event.id}`}
                            className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-semibold transition hover:opacity-90"
                            style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "var(--surface)" }}
                            onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                          >
                            View Detail
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 hidden flex-1 overflow-auto md:block">
                <table className="min-w-full table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[23%]" />
                    <col className="w-[21%]" />
                    <col className="w-[12%]" />
                    <col className="w-[16%]" />
                  </colgroup>
                  <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                    <tr>
                      <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Event</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Couple</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Date</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Status</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.slice(0, 5).map((event) => {
                      const status = resolveEventStatus(event);

                      return (
                        <tr
                          key={event.id}
                          className="cursor-pointer border-t align-middle transition hover:bg-zinc-50"
                          style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                          onClick={() => router.push(`/studio/events/${event.id}`)}
                        >
                          <td className="px-4 py-3">
                            <p className="truncate font-medium text-zinc-800">{event.title}</p>
                            <p className="mt-1 truncate text-xs text-zinc-500">{event.location ?? "No location provided"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-700">
                                {initialsForCouple(event)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-zinc-700">{coupleLabel(event)}</p>
                                <p className="truncate text-xs text-zinc-500">{formatNumber(event._count.guests)} guests</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-600">{formatEventDate(event.eventDate)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(status)}`}>{statusLabel(status)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/studio/events/${event.id}`}
                              className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-semibold transition hover:opacity-90"
                              style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "var(--surface)" }}
                              onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                            >
                              View Detail
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

