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
};

type EventsPageResponse = {
  events: EventListItem[];
  pagination?: {
    page: number;
    totalPages: number;
    hasNext: boolean;
  };
};

type AnniversaryItem = {
  id: string;
  couple: string;
  eventTitle: string;
  anniversaryDate: Date;
  years: number;
  location: string | null;
};

function resolveEventStatus(event: Pick<EventListItem, "eventDate" | "isPublished" | "status">) {
  if (event.status) return event.status;

  const now = new Date();
  const date = new Date(event.eventDate);
  if (date < now) return "COMPLETED" as const;
  if (event.isPublished) return "SCHEDULED" as const;
  return "DRAFT" as const;
}

function coupleLabel(event: EventListItem) {
  const bride = event.brideName?.trim();
  const groom = event.groomName?.trim();
  if (bride && groom) return `${bride} & ${groom}`;
  if (bride) return bride;
  if (groom) return groom;
  return event.title;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function monthLabel(index: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2026, index, 1));
}

export default function AnniversaryInsightsPage() {
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
            throw new Error("Unable to load anniversary data");
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
    const baseYear = new Date().getFullYear();
    let oldestYear = baseYear;

    for (const event of events) {
      const eventYear = new Date(event.eventDate).getFullYear();
      oldestYear = Math.min(oldestYear, eventYear + 1);
    }

    const years: number[] = [];
    for (let year = baseYear + 1; year >= oldestYear; year -= 1) {
      years.push(year);
    }

    if (years.length === 0) {
      years.push(baseYear);
    }

    return years;
  }, [events]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const anniversaryList = useMemo(() => {
    return events
      .filter((event) => resolveEventStatus(event) === "COMPLETED")
      .map((event) => {
        const eventDate = new Date(event.eventDate);
        const years = selectedYear - eventDate.getFullYear();
        const anniversaryDate = new Date(selectedYear, eventDate.getMonth(), eventDate.getDate());

        return {
          id: event.id,
          couple: coupleLabel(event),
          eventTitle: event.title,
          anniversaryDate,
          years,
          location: event.location,
        } satisfies AnniversaryItem;
      })
      .filter((item) => item.years >= 1)
      .sort((a, b) => a.anniversaryDate.getTime() - b.anniversaryDate.getTime());
  }, [events, selectedYear]);

  const monthlyAnniversaryCounts = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, monthIndex) => ({
      month: monthLabel(monthIndex),
      count: 0,
    }));

    for (const item of anniversaryList) {
      buckets[item.anniversaryDate.getMonth()].count += 1;
    }

    return buckets;
  }, [anniversaryList]);

  const next90DaysCount = useMemo(() => {
    const now = new Date();
    const inNinetyDays = new Date(now);
    inNinetyDays.setDate(inNinetyDays.getDate() + 90);

    return anniversaryList.filter((item) => item.anniversaryDate >= now && item.anniversaryDate <= inNinetyDays).length;
  }, [anniversaryList]);

  if (status === "loading" || status === "idle" || status === "unauthenticated" || loadingData) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading anniversary insights...</p>
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
              Full-Year Anniversary Insight
            </h2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              High-priority retention view for {selectedYear}: every anniversary date across your completed wedding history.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }} htmlFor="anniversary-year-filter">
              Year
            </label>
            <select
              id="anniversary-year-filter"
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
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            Overview
          </Link>
          <Link
            href="/studio/insights/anniversary"
            className="rounded-lg border px-3 py-2 text-sm font-medium"
            style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "white" }}
          >
            Anniversary
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Total anniversaries</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryList.length)}</p>
        </article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Upcoming in 90 days</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(next90DaysCount)}</p>
        </article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Campaign-ready months</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>
            {formatNumber(monthlyAnniversaryCounts.filter((item) => item.count > 0).length)}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Anniversary Distribution by Month ({selectedYear})</h3>
        <div className="mt-4 grid grid-cols-6 gap-3 sm:grid-cols-12">
          {monthlyAnniversaryCounts.map((bucket) => {
            const peak = Math.max(1, ...monthlyAnniversaryCounts.map((item) => item.count));
            const height = Math.max(8, Math.round((bucket.count / peak) * 120));

            return (
              <div key={bucket.month} className="flex flex-col items-center gap-2">
                <div className="flex h-32 items-end">
                  <div
                    className="w-4 rounded-t-md"
                    style={{
                      height,
                      background: "var(--primary)",
                    }}
                    title={`${bucket.month}: ${bucket.count}`}
                  />
                </div>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{bucket.month}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Full-Year Anniversary List ({selectedYear})</h3>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Sorted from Jan to Dec for planning campaigns
          </p>
        </div>

        {anniversaryList.length === 0 ? (
          <p className="mt-4 rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
            No anniversary records found for {selectedYear}. Add completed wedding history to unlock this view.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Anniversary date</th>
                  <th className="px-4 py-3 font-medium">Couple</th>
                  <th className="px-4 py-3 font-medium">Wedding</th>
                  <th className="px-4 py-3 font-medium">Year milestone</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {anniversaryList.map((item) => (
                  <tr key={`${item.id}-${item.anniversaryDate.toISOString()}`} className="border-t border-zinc-100 align-top hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-800">{formatDate(item.anniversaryDate)}</td>
                    <td className="px-4 py-3 text-zinc-700">{item.couple}</td>
                    <td className="px-4 py-3 text-zinc-700">{item.eventTitle}</td>
                    <td className="px-4 py-3 text-zinc-700">{item.years} year</td>
                    <td className="px-4 py-3 text-zinc-600">{item.location ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
