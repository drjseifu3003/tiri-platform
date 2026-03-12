"use client";

import { NeoBarChart, NeoDonutChart } from "@/components/insights/NeoChart";
import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  _count?: {
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

type InsightsTab = "general" | "anniversary";
type ChartGranularity = "yearly" | "monthly";
type AnniversaryRangeFilter = "all" | "next-7" | "next-30" | "next-90" | "next-365" | "custom";
type AnniversaryMilestoneFilter = "all" | "1" | "5" | "10" | "15" | "20";

type AnniversaryItem = {
  id: string;
  eventTitle: string;
  couple: string;
  weddingDate: Date;
  nextAnniversary: Date;
  daysUntil: number;
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
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function initialsForCouple(value: string) {
  const parts = value
    .split(/\s+|&/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) return "EV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function parseDateBoundary(value: string, endOfDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  return endOfDay
    ? new Date(year, month - 1, day + 1, 0, 0, 0, 0)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
}

function formatTimeLeft(totalDays: number) {
  if (totalDays <= 0) return "Today";

  const months = Math.floor(totalDays / 30);
  const remainingAfterMonths = totalDays % 30;
  const weeks = Math.floor(remainingAfterMonths / 7);
  const days = remainingAfterMonths % 7;

  const parts: string[] = [];
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
  if (weeks > 0) parts.push(`${weeks} week${weeks !== 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);

  return parts.length > 0 ? parts.join(" ") : `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
}

export default function DataInsightsPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<InsightsTab>("general");

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [chartGranularity, setChartGranularity] = useState<ChartGranularity>("yearly");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const [anniversarySearch, setAnniversarySearch] = useState("");
  const [anniversaryRange, setAnniversaryRange] = useState<AnniversaryRangeFilter>("all");
  const [anniversaryMilestone, setAnniversaryMilestone] = useState<AnniversaryMilestoneFilter>("all");
  const [anniversaryDateFrom, setAnniversaryDateFrom] = useState("");
  const [anniversaryDateTo, setAnniversaryDateTo] = useState("");
  const [anniversaryPage, setAnniversaryPage] = useState(1);
  const anniversaryPageSize = 10;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "anniversary") {
      setActiveTab("anniversary");
      return;
    }

    if (tab === "general") {
      setActiveTab("general");
    }
  }, [searchParams]);

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

  const generalYearEvents = useMemo(
    () => events.filter((event) => new Date(event.eventDate).getFullYear() === selectedYear),
    [events, selectedYear]
  );

  const generalChartEvents = useMemo(() => {
    if (chartGranularity === "yearly") {
      return generalYearEvents;
    }

    return generalYearEvents.filter((event) => new Date(event.eventDate).getMonth() === selectedMonth);
  }, [chartGranularity, generalYearEvents, selectedMonth]);

  const generalTotals = useMemo(() => {
    const totalEvents = generalChartEvents.length;
    const totalGuests = generalChartEvents.reduce((sum, event) => sum + (event._count?.guests ?? 0), 0);
    const totalMedia = generalChartEvents.reduce((sum, event) => sum + (event._count?.media ?? 0), 0);

    return {
      totalEvents,
      totalGuests,
      totalMedia,
    };
  }, [generalChartEvents]);

  const yearlyBarData = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, monthIndex) => ({
      label: monthLabel(monthIndex),
      count: 0,
    }));

    for (const event of generalYearEvents) {
      const month = new Date(event.eventDate).getMonth();
      buckets[month].count += 1;
    }

    return buckets;
  }, [generalYearEvents]);

  const monthlyBarData = useMemo(() => {
    const monthEvents = generalYearEvents.filter((event) => new Date(event.eventDate).getMonth() === selectedMonth);
    const year = selectedYear;
    const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
    const weekBuckets = [
      { label: "Week 1", from: 1, to: 7, count: 0 },
      { label: "Week 2", from: 8, to: 14, count: 0 },
      { label: "Week 3", from: 15, to: 21, count: 0 },
      { label: "Week 4", from: 22, to: lastDay, count: 0 },
    ];

    for (const event of monthEvents) {
      const day = new Date(event.eventDate).getDate();
      if (day <= 7) weekBuckets[0].count += 1;
      else if (day <= 14) weekBuckets[1].count += 1;
      else if (day <= 21) weekBuckets[2].count += 1;
      else weekBuckets[3].count += 1;
    }

    return weekBuckets.map((bucket) => ({
      label: bucket.label,
      count: bucket.count,
    }));
  }, [generalYearEvents, selectedMonth, selectedYear]);

  const generalBarData = chartGranularity === "yearly" ? yearlyBarData : monthlyBarData;

  const generalStatusSegments = useMemo(() => {
    const counts: Record<EventStatus, number> = {
      DRAFT: 0,
      SCHEDULED: 0,
      LIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      ARCHIVED: 0,
    };

    for (const event of generalChartEvents) {
      counts[resolveEventStatus(event)] += 1;
    }

    return [
      { label: "Completed", value: counts.COMPLETED, color: "#1f6f7f" },
      { label: "Scheduled", value: counts.SCHEDULED, color: "#5ba8b8" },
      { label: "Live", value: counts.LIVE, color: "#a0365c" },
      { label: "Draft", value: counts.DRAFT, color: "#c28099" },
      { label: "Cancelled", value: counts.CANCELLED, color: "#7a1a53" },
      { label: "Archived", value: counts.ARCHIVED, color: "#8c7a84" },
    ].filter((segment) => segment.value > 0);
  }, [generalChartEvents]);

  const generalAllTimeCounts = useMemo(() => {
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
      completed: counts.COMPLETED,
      active: counts.SCHEDULED + counts.LIVE,
      closed: counts.CANCELLED + counts.ARCHIVED,
    };
  }, [events]);

  const anniversaryBaseList = useMemo(() => {
    const now = new Date();

    return events
      .filter((event) => resolveEventStatus(event) === "COMPLETED")
      .map((event) => {
        const weddingDate = new Date(event.eventDate);
        const nextAnniversary = getNextAnniversary(weddingDate, now);
        const daysUntil = Math.ceil((nextAnniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const years = nextAnniversary.getFullYear() - weddingDate.getFullYear();

        return {
          id: event.id,
          eventTitle: event.title,
          couple: coupleLabel(event),
          weddingDate,
          nextAnniversary,
          daysUntil,
          years,
          location: event.location,
        } satisfies AnniversaryItem;
      })
      .filter((item) => item.years >= 1 && item.daysUntil >= 0)
      .sort((a, b) => a.nextAnniversary.getTime() - b.nextAnniversary.getTime());
  }, [events]);

  const anniversaryCards = useMemo(() => {
    return {
      next7: anniversaryBaseList.filter((item) => item.daysUntil <= 7).length,
      next30: anniversaryBaseList.filter((item) => item.daysUntil <= 30).length,
      next90: anniversaryBaseList.filter((item) => item.daysUntil <= 90).length,
      next180: anniversaryBaseList.filter((item) => item.daysUntil <= 180).length,
    };
  }, [anniversaryBaseList]);

  const filteredAnniversaries = useMemo(() => {
    const maxDays = anniversaryRange === "all"
      ? Number.POSITIVE_INFINITY
      : anniversaryRange === "next-7"
        ? 7
        : anniversaryRange === "next-30"
          ? 30
          : anniversaryRange === "next-90"
            ? 90
            : anniversaryRange === "next-365"
              ? 365
              : Number.POSITIVE_INFINITY;

    const query = anniversarySearch.trim().toLowerCase();

    return anniversaryBaseList.filter((item) => {
      const searchable = `${item.couple} ${item.eventTitle} ${item.location ?? ""}`.toLowerCase();
      const matchesSearch = query.length === 0 || searchable.includes(query);

      const matchesRange = anniversaryRange === "custom"
        ? (() => {
          const from = anniversaryDateFrom.trim();
          const to = anniversaryDateTo.trim();
          const at = item.nextAnniversary;

          if (!from && !to) return true;

          const fromBoundary = from ? parseDateBoundary(from, false) : undefined;
          const toBoundary = to ? parseDateBoundary(to, true) : undefined;
          if (fromBoundary && at < fromBoundary) return false;
          if (toBoundary && at >= toBoundary) return false;
          return true;
        })()
        : item.daysUntil <= maxDays;

      const matchesMilestone = anniversaryMilestone === "all" || item.years === Number(anniversaryMilestone);
      return matchesSearch && matchesRange && matchesMilestone;
    });
  }, [anniversaryBaseList, anniversaryDateFrom, anniversaryDateTo, anniversaryMilestone, anniversaryRange, anniversarySearch]);

  const anniversaryTotalPages = Math.max(1, Math.ceil(filteredAnniversaries.length / anniversaryPageSize));

  const paginatedAnniversaries = useMemo(() => {
    const start = (anniversaryPage - 1) * anniversaryPageSize;
    return filteredAnniversaries.slice(start, start + anniversaryPageSize);
  }, [anniversaryPage, filteredAnniversaries]);

  useEffect(() => {
    setAnniversaryPage(1);
  }, [anniversarySearch, anniversaryMilestone, anniversaryRange, anniversaryDateFrom, anniversaryDateTo]);

  useEffect(() => {
    if (anniversaryPage > anniversaryTotalPages) {
      setAnniversaryPage(anniversaryTotalPages);
    }
  }, [anniversaryPage, anniversaryTotalPages]);

  const anniversaryHasFilters =
    anniversarySearch.trim().length > 0 ||
    anniversaryMilestone !== "all" ||
    anniversaryRange !== "all" ||
    anniversaryDateFrom.trim().length > 0 ||
    anniversaryDateTo.trim().length > 0;

  const anniversaryStartItem = filteredAnniversaries.length === 0 ? 0 : (anniversaryPage - 1) * anniversaryPageSize + 1;
  const anniversaryEndItem = Math.min(anniversaryPage * anniversaryPageSize, filteredAnniversaries.length);

  if (status === "loading" || status === "idle" || status === "unauthenticated" || loadingData) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading insight data...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6">
      <section className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Data Insight
            </p>
            <h2 className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Studio Wedding Intelligence
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              General yearly analytics and future anniversary planning.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className="relative py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "general" ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === "general" ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            General Insight
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("anniversary")}
            className="relative py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "anniversary" ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === "anniversary" ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            Anniversary
          </button>
        </div>
      </section>

      {activeTab === "general" ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Total Weddings</p>
              <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalAllTimeCounts.total)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Completed</p>
              <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalAllTimeCounts.completed)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Active</p>
              <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalAllTimeCounts.active)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Closed</p>
              <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalAllTimeCounts.closed)}</p>
            </article>
          </section>

          <section className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
            <div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto rounded-lg border px-2 py-1.5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <div className="relative min-w-44 shrink-0">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <select
                  id="insights-year-filter"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                  aria-label="Filter general insights by year"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              <div className="relative min-w-44 shrink-0">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                <select
                  id="insights-granularity-filter"
                  value={chartGranularity}
                  onChange={(event) => setChartGranularity(event.target.value as ChartGranularity)}
                  className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                  aria-label="Filter chart granularity"
                >
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {chartGranularity === "monthly" ? (
                <div className="relative min-w-44 shrink-0">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <select
                    id="insights-month-filter"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(Number(event.target.value))}
                    className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                    aria-label="Filter monthly chart by month"
                  >
                    {Array.from({ length: 12 }, (_, monthIndex) => (
                      <option key={monthIndex} value={monthIndex}>
                        {monthLabel(monthIndex)}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2 xl:auto-rows-fr">
            <div className="rounded-2xl border p-5 flex h-full min-h-[24rem] flex-col" style={{ borderColor: "var(--border-subtle)", background: "linear-gradient(180deg, #ffffff 0%, #fcf8fa 100%)" }}>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {chartGranularity === "yearly" ? "Wedding Volume by Month" : `Wedding Volume by Week (${monthLabel(selectedMonth)})`}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {chartGranularity === "yearly"
                  ? `Monthly distribution for ${selectedYear}`
                  : `4-week view for ${monthLabel(selectedMonth)} ${selectedYear}`}
              </p>
              <div className="mt-4 min-h-0 flex-1">
                <NeoBarChart data={generalBarData.map((bucket) => ({ label: bucket.label, value: bucket.count }))} tone="primary" />
              </div>
            </div>

            <div className="rounded-2xl border p-5 flex h-full min-h-[24rem] flex-col" style={{ borderColor: "var(--border-subtle)", background: "linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%)" }}>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Status Breakdown</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {chartGranularity === "yearly"
                  ? `Lifecycle mix for ${selectedYear}`
                  : `Lifecycle mix for ${monthLabel(selectedMonth)} ${selectedYear}`}
              </p>
              <div className="mt-4 min-h-0 flex-1">
                <NeoDonutChart
                  segments={generalStatusSegments}
                  centerLabel="Events"
                  centerValue={formatNumber(generalTotals.totalEvents)}
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 7 Days</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryCards.next7)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 30 Days</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryCards.next30)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 3 Month</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryCards.next90)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 6 Month</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryCards.next180)}</p>
            </article>
          </section>

          <section className="ui-page rounded-lg flex h-[calc(100dvh-18rem)] min-h-[32rem] flex-col overflow-hidden p-4">
            <div className="ui-page-header block">
              <div className="min-w-0">
                <h3 className="ui-title">Anniversary Events</h3>
                <p className="ui-subtitle">Browse anniversary records and upcoming celebrations.</p>
              </div>

              <div className="mt-2 flex w-full flex-nowrap items-center gap-2 overflow-x-auto rounded-lg border px-2 py-1.5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                <div className="relative w-80 min-w-80 shrink-0">
                  <input
                    value={anniversarySearch}
                    onChange={(event) => setAnniversarySearch(event.target.value)}
                    placeholder="Search by event, couple, or location..."
                    className="ui-input h-10 w-full rounded-lg pl-10"
                  />
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="relative min-w-44">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="7" y1="12" x2="17" y2="12" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                    </svg>
                    <select
                      value={anniversaryMilestone}
                      onChange={(event) => setAnniversaryMilestone(event.target.value as AnniversaryMilestoneFilter)}
                      className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                      aria-label="Filter anniversaries by anniversary year"
                    >
                      <option value="all">All anniversary years</option>
                      <option value="1">1 year</option>
                      <option value="5">5 years</option>
                      <option value="10">10 years</option>
                      <option value="15">15 years</option>
                      <option value="20">20 years</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>

                  <div className="relative min-w-44">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <select
                      value={anniversaryRange}
                      onChange={(event) => setAnniversaryRange(event.target.value as AnniversaryRangeFilter)}
                      className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                      aria-label="Filter anniversaries by date"
                    >
                      <option value="all">Any date</option>
                      <option value="next-7">Next week</option>
                      <option value="next-30">Next month</option>
                      <option value="next-90">Next 90 days</option>
                      <option value="next-365">Next year</option>
                      <option value="custom">Custom range</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {anniversaryRange === "custom" ? (
                  <>
                    <input
                      type="date"
                      value={anniversaryDateFrom}
                      onChange={(event) => setAnniversaryDateFrom(event.target.value)}
                      className="ui-input h-10 rounded-lg px-2 text-sm"
                      aria-label="Custom anniversary date from"
                    />
                    <input
                      type="date"
                      value={anniversaryDateTo}
                      onChange={(event) => setAnniversaryDateTo(event.target.value)}
                      className="ui-input h-10 rounded-lg px-2 text-sm"
                      aria-label="Custom anniversary date to"
                    />
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setAnniversarySearch("");
                    setAnniversaryRange("all");
                    setAnniversaryMilestone("all");
                    setAnniversaryDateFrom("");
                    setAnniversaryDateTo("");
                  }}
                  disabled={!anniversaryHasFilters}
                  title="Reset filters"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v4h4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-2 min-h-0 flex-1">
              {paginatedAnniversaries.length === 0 ? (
                <div className="flex h-full min-h-[18rem] items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                  <div className="flex max-w-sm flex-col items-center text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
                        <path d="M8 2v4" />
                        <path d="M16 2v4" />
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M3 10h18" />
                        <path d="m9 15 2 2 4-4" />
                      </svg>
                    </span>
                    <p className="mt-4 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      No anniversaries found
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      Try changing search terms or adjusting anniversary year and date filters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="ui-table mt-0 rounded-lg flex h-full min-h-0 flex-col overflow-hidden">
                  <div className="min-h-0 flex-1 overflow-auto">
                    <table className="min-w-full table-fixed text-left text-sm">
                      <colgroup>
                        <col className="w-[24%]" />
                        <col className="w-[18%]" />
                        <col className="w-[18%]" />
                        <col className="w-[12%]" />
                        <col className="w-[10%]" />
                        <col className="w-[18%]" />
                      </colgroup>
                      <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                        <tr>
                          <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Event</th>
                          <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Couple</th>
                          <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Wedding Date</th>
                          <th className="sticky top-0 z-10 px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Anniversary Year</th>
                          <th className="sticky top-0 z-10 px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Left Time</th>
                          <th className="sticky top-0 z-10 px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAnniversaries.map((item) => (
                          <tr key={`${item.id}-${item.nextAnniversary.toISOString()}`} className="border-t align-middle transition" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                            <td className="px-4 py-3">
                              <p className="truncate font-medium text-zinc-800">{item.eventTitle}</p>
                              <p className="mt-1 truncate text-xs text-zinc-500">Next: {formatShortDate(item.nextAnniversary)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-700">
                                  {initialsForCouple(item.couple)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-zinc-700">{item.couple}</p>
                                  <p className="truncate text-xs text-zinc-500">{item.location ?? "No location provided"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-zinc-600">{formatDate(item.weddingDate)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex rounded-full border px-2 py-1 text-xs font-medium" style={{ borderColor: "var(--secondary-light)", background: "var(--secondary-lighter)", color: "var(--secondary)" }}>
                                {item.years} year{item.years !== 1 ? "s" : ""}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-zinc-700">{formatTimeLeft(item.daysUntil)}</td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/studio/events/${item.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-px"
                                style={{ borderColor: "var(--border-subtle)", color: "var(--primary)" }}
                              >
                                View Detail
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t px-4 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span>
                        Showing {anniversaryStartItem} to {anniversaryEndItem} of {filteredAnniversaries.length} entries
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAnniversaryPage((current) => Math.max(1, current - 1))}
                          disabled={anniversaryPage <= 1}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                        >
                          Previous
                        </button>

                        <span>
                          Page {anniversaryPage} of {anniversaryTotalPages}
                        </span>

                        <button
                          type="button"
                          onClick={() => setAnniversaryPage((current) => Math.min(anniversaryTotalPages, current + 1))}
                          disabled={anniversaryPage >= anniversaryTotalPages}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
