"use client";

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
    <main className="flex min-h-full flex-col gap-8">
      {/* Header */}
      <section className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Wedding Analytics
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Insights for {selectedYear}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Seasonal trends, upcoming anniversaries, and key metrics from your events.
            </p>
          </div>

          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
              htmlFor="insights-year-filter"
            >
              Year
            </label>
            <select
              id="insights-year-filter"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border-subtle)", background: "#ffffff", color: "var(--text-primary)" }}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Total Weddings</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(totals.totalEvents)}</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Completed</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(totals.completedWeddings)}</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Anniversaries (90d)</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(upcomingAnniversaries.length)}</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Peak Month</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{seasonality.peakMonth.label}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{formatNumber(seasonality.peakMonth.count)} weddings</p>
        </div>
      </section>

      {/* Seasonality Chart */}
      <section className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Wedding Season</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Monthly distribution of weddings through {selectedYear}
          </p>
        </div>

        <div className="mt-6">
          <NeoBarChart data={seasonality.buckets.map((bucket) => ({ label: bucket.label, value: bucket.count }))} tone="primary" />
        </div>
      </section>

      {/* Anniversaries */}
      <section className="rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="border-b p-6" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Upcoming Anniversaries</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Next 90 days • {formatNumber(upcomingAnniversaries.length)} celebrations
              </p>
            </div>
            {upcomingAnniversaries.length > 0 && (
              <Link
                href="/studio/insights/anniversary"
                className="rounded-lg border px-4 py-2 text-sm font-medium"
                style={{ borderColor: "var(--border-subtle)", color: "var(--primary)" }}
              >
                View All
              </Link>
            )}
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {upcomingAnniversaries.length === 0 ? (
            <p className="p-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              No anniversaries in the next 90 days
            </p>
          ) : (
            upcomingAnniversaries.map((item) => (
              <Link
                key={item.id}
                href={`/studio/events/${item.id}`}
                className="flex items-center justify-between p-6 transition hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{item.couple}</p>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>{item.eventTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>{formatDate(item.anniversary)}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {item.daysUntil} days • {item.years} year{item.years !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
