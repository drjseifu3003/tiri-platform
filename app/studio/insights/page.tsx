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
  bridePhone?: string | null;
  groomPhone?: string | null;
  eventDate: string;
  location: string | null;
  status?: EventStatus;
  isPublished: boolean;
  _count: {
    guests: number;
    media: number;
  };
};

type EventsPageResponse = {
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function monthLabel(index: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2026, index, 1));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function getNextAnniversary(eventDate: Date, fromDate: Date) {
  const next = new Date(fromDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  if (next < fromDate) {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

function coupleLabel(event: EventListItem) {
  const bride = event.brideName?.trim();
  const groom = event.groomName?.trim();
  if (bride && groom) return `${bride} & ${groom}`;
  if (bride) return bride;
  if (groom) return groom;
  return event.title;
}

export default function DataInsightsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadAllEvents() {
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
            throw new Error("Unable to load insight data");
          }

          const json = (await response.json()) as EventsPageResponse;
          allEvents.push(...(json.events ?? []));

          hasNext = !!json.pagination?.hasNext;
          page += 1;
          guard += 1;
        }

        if (!cancelled) {
          setEvents(allEvents);
        }
      } catch {
        if (!cancelled) {
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    void loadAllEvents();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const event of events) {
      years.add(new Date(event.eventDate).getFullYear());
    }

    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }

    return [...years].sort((a, b) => b - a);
  }, [events]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const filteredEvents = useMemo(
    () => events.filter((event) => new Date(event.eventDate).getFullYear() === selectedYear),
    [events, selectedYear]
  );

  const totals = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const completedWeddings = filteredEvents.filter((event) => resolveEventStatus(event) === "COMPLETED").length;

    return {
      totalEvents,
      completedWeddings,
    };
  }, [filteredEvents]);

  const seasonality = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, monthIndex) => ({
      label: monthLabel(monthIndex),
      count: 0,
    }));

    for (const event of filteredEvents) {
      const month = new Date(event.eventDate).getMonth();
      buckets[month].count += 1;
    }

    const maxCount = Math.max(1, ...buckets.map((item) => item.count));
    const sorted = [...buckets].sort((a, b) => b.count - a.count);

    return {
      buckets,
      maxCount,
      peakMonth: sorted[0],
      slowMonth: sorted[sorted.length - 1],
    };
  }, [filteredEvents]);

  const upcomingAnniversaries = useMemo(() => {
    const now = new Date();
    const inNinetyDays = addDays(now, 90);

    return filteredEvents
      .map((event) => {
        const eventDate = new Date(event.eventDate);
        const anniversary = getNextAnniversary(eventDate, now);
        const daysUntil = Math.ceil((anniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const years = anniversary.getFullYear() - eventDate.getFullYear();

        return {
          id: event.id,
          couple: coupleLabel(event),
          eventTitle: event.title,
          anniversary,
          daysUntil,
          years,
        };
      })
      .filter((item) => item.daysUntil >= 0 && item.anniversary <= inNinetyDays)
      .sort((a, b) => a.anniversary.getTime() - b.anniversary.getTime())
      .slice(0, 6);
  }, [filteredEvents]);

  const growth = useMemo(() => {
    const firstHalfStart = new Date(selectedYear, 0, 1);
    const secondHalfStart = new Date(selectedYear, 6, 1);
    const nextYearStart = new Date(selectedYear + 1, 0, 1);

    const firstHalf = filteredEvents.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= firstHalfStart && date < secondHalfStart;
    }).length;

    const secondHalf = filteredEvents.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= secondHalfStart && date < nextYearStart;
    }).length;

    const thisYear = filteredEvents.length;
    const lastYear = events.filter((event) => new Date(event.eventDate).getFullYear() === selectedYear - 1).length;

    const yoyChange = lastYear > 0 ? Math.round(((thisYear - lastYear) / lastYear) * 100) : thisYear > 0 ? 100 : 0;

    const locationCounts = new Map<string, number>();
    for (const event of filteredEvents) {
      const location = event.location?.trim();
      if (!location) continue;
      locationCounts.set(location, (locationCounts.get(location) ?? 0) + 1);
    }

    const topLocations = [...locationCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      firstHalf,
      secondHalf,
      thisYear,
      lastYear,
      yoyChange,
      topLocations,
    };
  }, [events, filteredEvents, selectedYear]);

  const statusMix = useMemo(() => {
    const counts: Record<EventStatus, number> = {
      DRAFT: 0,
      SCHEDULED: 0,
      LIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      ARCHIVED: 0,
    };

    for (const event of filteredEvents) {
      counts[resolveEventStatus(event)] += 1;
    }

    const ordered: Array<{ label: string; value: number; color: string }> = [
      { label: "Completed", value: counts.COMPLETED, color: "#2f7d69" },
      { label: "Scheduled", value: counts.SCHEDULED, color: "#1f6f7f" },
      { label: "Live", value: counts.LIVE, color: "#8a1f44" },
      { label: "Draft", value: counts.DRAFT, color: "#a16f30" },
      { label: "Cancelled", value: counts.CANCELLED, color: "#9f3355" },
      { label: "Archived", value: counts.ARCHIVED, color: "#6b7280" },
    ];

    const total = Math.max(1, ordered.reduce((sum, item) => sum + item.value, 0));
    let cursor = 0;
    const segments = ordered.map((item) => {
      const start = cursor;
      const ratio = item.value / total;
      cursor += ratio;
      return `${item.color} ${Math.round(start * 360)}deg ${Math.round(cursor * 360)}deg`;
    });

    return {
      ordered,
      ringStyle: `conic-gradient(${segments.join(",")})`,
    };
  }, [filteredEvents]);

  if (status === "loading" || status === "idle" || status === "unauthenticated" || loadingData) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading insight data...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6">
      <section className="rounded-3xl border p-5 shadow-sm sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
              Data Insight
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--primary)" }}>
              Seasonal demand, customer milestones, and growth signals
            </h2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Showing business insights for {selectedYear} based on your real wedding records.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }} htmlFor="insights-year-filter">
              Year
            </label>
            <select
              id="insights-year-filter"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm sm:w-36"
              style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-primary)" }}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href="/studio/insights"
            className="rounded-lg border px-3 py-2 text-sm font-medium"
            style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "white" }}
          >
            Overview
          </Link>
          <Link
            href="/studio/insights/anniversary"
            className="rounded-lg border px-3 py-2 text-sm font-medium"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            Anniversary
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Anniversary Insight Priority</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {formatNumber(upcomingAnniversaries.length)} upcoming anniversaries in the next 90 days for {selectedYear}.
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              Open the full-year anniversary page to plan monthly outreach campaigns and retention offers.
            </p>
          </div>
          <Link
            href="/studio/insights/anniversary"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ border: "1px solid var(--primary)", background: "var(--primary)", color: "white" }}
          >
            View Full-Year Anniversary List
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Total weddings</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(totals.totalEvents)}</p>
        </article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Completed weddings</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(totals.completedWeddings)}</p>
        </article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Anniversaries in 90 days</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(upcomingAnniversaries.length)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            Relationship opportunities to re-engage couples
          </p>
        </article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Peak wedding month</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{seasonality.peakMonth.label}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            {formatNumber(seasonality.peakMonth.count)} weddings in your strongest month
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <article className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Wedding Season Insights</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            Peak month: {seasonality.peakMonth.label} ({seasonality.peakMonth.count}) | Slow month: {seasonality.slowMonth.label} ({seasonality.slowMonth.count})
          </p>
          <div className="mt-5 grid grid-cols-6 gap-3 sm:grid-cols-12">
            {seasonality.buckets.map((bucket) => {
              const height = Math.max(8, Math.round((bucket.count / seasonality.maxCount) * 120));
              return (
                <div key={bucket.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-32 items-end">
                    <div
                      className="w-4 rounded-t-md"
                      style={{
                        height,
                        background: "var(--primary)",
                      }}
                      title={`${bucket.label}: ${bucket.count}`}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{bucket.label}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Event Lifecycle Mix</h3>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative h-28 w-28 rounded-full" style={{ background: statusMix.ringStyle }}>
              <div
                className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
              />
            </div>
            <div className="space-y-2">
              {statusMix.ordered.map((item) => (
                <p key={item.label} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  {item.label}: {formatNumber(item.value)}
                </p>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Customer Relationship Opportunities</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            Upcoming wedding anniversaries in the next 90 days for reconnect campaigns.
          </p>
          {upcomingAnniversaries.length === 0 ? (
            <p className="mt-4 rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
              No anniversaries in the next 90 days yet. Keep adding completed events to unlock lifecycle outreach opportunities.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {upcomingAnniversaries.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border px-3 py-2"
                  style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>{item.couple}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.eventTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: "var(--secondary)" }}>{formatDate(item.anniversary)}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {item.daysUntil} days | {item.years} year anniversary
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Marketing and Growth Signals</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border px-3 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Jan-Jun {selectedYear}</p>
              <p className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(growth.firstHalf)} weddings</p>
            </div>
            <div className="rounded-xl border px-3 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Jul-Dec {selectedYear}</p>
              <p className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(growth.secondHalf)} weddings</p>
            </div>
            <div className="rounded-xl border px-3 py-3 sm:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Year-over-year volume</p>
              <p className="mt-1 text-xl font-semibold" style={{ color: growth.yoyChange >= 0 ? "#1f6f7f" : "#9f3355" }}>
                {growth.yoyChange >= 0 ? "+" : ""}{growth.yoyChange}%
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {formatNumber(growth.thisYear)} in {selectedYear} vs {formatNumber(growth.lastYear)} in {selectedYear - 1}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>
              Top locations by demand
            </p>
            {growth.topLocations.length === 0 ? (
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                Event locations are not populated yet.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {growth.topLocations.map((location) => (
                  <div key={location.name} className="flex items-center justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span>{location.name}</span>
                    <span className="font-medium" style={{ color: "var(--primary)" }}>{formatNumber(location.count)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
