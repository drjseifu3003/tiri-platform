"use client";

import { InsightsTabs } from "@/components/insights/InsightsTabs";
import { NeoBarChart } from "@/components/insights/NeoChart";
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
      .filter((item) => item.years >= 1 && item.daysUntil >= 0 && item.anniversary <= inNinetyDays)
      .sort((a, b) => a.anniversary.getTime() - b.anniversary.getTime())
      .slice(0, 6);
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
      <section
        className="rounded-3xl border p-5 shadow-sm sm:p-6"
        style={{
          borderColor: "var(--border-subtle)",
          background:
            "radial-gradient(circle at right top, rgba(91, 168, 184, 0.12), transparent 48%), radial-gradient(circle at left bottom, rgba(160, 54, 92, 0.12), transparent 45%), var(--surface)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
              Data Insight
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--primary)" }}>
              Seasonal demand, customer milestones, and growth signals
            </h2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Live analytics for {selectedYear} based on your real event records.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <label
              className="text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--text-tertiary)" }}
              htmlFor="insights-year-filter"
            >
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

        <div className="mt-4">
          <InsightsTabs activeTab="overview" anniversaryCount={upcomingAnniversaries.length} />
        </div>

        <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold" style={{ color: "var(--primary)" }}>Anniversary Insight Priority</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {formatNumber(upcomingAnniversaries.length)} upcoming anniversaries in the next 90 days.
              </p>
            </div>
            <Link
              href="/studio/insights/anniversary"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ border: "1px solid var(--primary)", background: "var(--primary)", color: "white" }}
            >
              Open Anniversary List
            </Link>
          </div>
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
        </article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Peak wedding month</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{seasonality.peakMonth.label}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{formatNumber(seasonality.peakMonth.count)} events</p>
        </article>
      </section>

      <section>
        <article className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Wedding Season Insights</h3>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                Peak: {seasonality.peakMonth.label} ({seasonality.peakMonth.count}) | Slow: {seasonality.slowMonth.label} ({seasonality.slowMonth.count})
              </p>
            </div>
          </div>

          <div className="mt-4">
            <NeoBarChart data={seasonality.buckets.map((bucket) => ({ label: bucket.label, value: bucket.count }))} tone="primary" />
          </div>
        </article>
      </section>

      <section>
        <article className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Relationship Opportunities</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            Upcoming wedding anniversaries in the next 90 days.
          </p>
          {upcomingAnniversaries.length === 0 ? (
            <p className="mt-4 rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
              No anniversaries in the next 90 days yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {upcomingAnniversaries.map((item) => (
                <Link
                  key={item.id}
                  href={`/studio/events/${item.id}`}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 transition hover:shadow-sm"
                  style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>{item.couple}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.eventTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: "var(--secondary)" }}>{formatDate(item.anniversary)}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {item.daysUntil} days | {item.years} year
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
