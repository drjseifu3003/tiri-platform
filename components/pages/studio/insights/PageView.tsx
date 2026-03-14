"use client";

import { NeoBarChart, NeoDonutChart } from "@/components/insights/NeoChart";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileFilterSheet } from "@/components/ui/mobile-filter-sheet";
import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type InsightsTab = "general" | "anniversary";
type ChartGranularity = "yearly" | "monthly";
type AnniversaryRangeFilter = "all" | "next-7" | "next-30" | "next-90" | "next-365" | "custom";
type AnniversaryMilestoneFilter = "all" | "1" | "5" | "10" | "15" | "20";

type GeneralInsightsResponse = {
  availableYears: number[];
  allTimeCounts: {
    total: number;
    completed: number;
    active: number;
    closed: number;
  };
  totals: {
    totalEvents: number;
    totalGuests: number;
    totalMedia: number;
  };
  barData: Array<{
    label: string;
    count: number;
  }>;
  statusSegments: Array<{
    label: string;
    value: number;
    color: string;
  }>;
};

type AnniversaryInsightsResponse = {
  cards: {
    next7: number;
    next30: number;
    next90: number;
    next180: number;
  };
  items: Array<{
    id: string;
    eventTitle: string;
    couple: string;
    weddingDate: string;
    nextAnniversary: string;
    daysUntil: number;
    years: number;
    location: string | null;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function monthLabel(index: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2026, index, 1));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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

function GeneralSkeleton() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`insights-stat-skeleton-${index}`} className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-24" />
          </article>
        ))}
      </section>

      <section className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="flex w-full flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <Skeleton className="h-10 w-44 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 xl:auto-rows-fr">
        <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="mt-2 h-4 w-72" />
          <Skeleton className="mt-6 h-64 w-full rounded-lg" />
        </div>
        <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-2 h-4 w-64" />
          <Skeleton className="mt-6 h-64 w-full rounded-lg" />
        </div>
      </section>
    </>
  );
}

function AnniversarySkeleton() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`anniv-card-skeleton-${index}`} className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-9 w-16" />
          </article>
        ))}
      </section>

      <section className="ui-page rounded-lg flex h-[calc(100dvh-18rem)] min-h-[32rem] flex-col overflow-hidden p-4">
        <div className="ui-page-header block">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-10 w-80 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
        <div className="mt-3 flex-1 rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`anniv-row-skeleton-${index}`} className="border-b py-3 last:border-b-0" style={{ borderColor: "var(--border-subtle)" }}>
              <Skeleton className="h-4 w-56" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default function DataInsightsPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [loadingGeneralGraphs, setLoadingGeneralGraphs] = useState(false);
  const [loadingAnniversary, setLoadingAnniversary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generalData, setGeneralData] = useState<GeneralInsightsResponse | null>(null);
  const [anniversaryData, setAnniversaryData] = useState<AnniversaryInsightsResponse | null>(null);

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
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (activeTab !== "general") return;

    let cancelled = false;

    async function loadGeneral() {
      if (!generalData) {
        setLoadingGeneral(true);
      } else {
        setLoadingGeneralGraphs(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          mode: "general",
          year: String(selectedYear),
          granularity: chartGranularity,
          month: String(selectedMonth),
        });

        const response = await fetch(`/api/studio/insights?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load insights");
        }

        const payload = (await response.json()) as GeneralInsightsResponse;
        if (!cancelled) {
          setGeneralData(payload);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load insights.");
          if (!generalData) {
            setGeneralData(null);
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingGeneral(false);
          setLoadingGeneralGraphs(false);
        }
      }
    }

    void loadGeneral();

    return () => {
      cancelled = true;
    };
  }, [activeTab, chartGranularity, selectedMonth, selectedYear, status]);

  useEffect(() => {
    if (!generalData?.availableYears?.length) return;
    if (generalData.availableYears.includes(selectedYear)) return;
    setSelectedYear(generalData.availableYears[0]);
  }, [generalData?.availableYears, selectedYear]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (activeTab !== "anniversary") return;

    let cancelled = false;

    async function loadAnniversary() {
      setLoadingAnniversary(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          mode: "anniversary",
          page: String(anniversaryPage),
          pageSize: String(anniversaryPageSize),
          range: anniversaryRange,
          milestone: anniversaryMilestone,
        });

        if (anniversarySearch.trim()) {
          params.set("search", anniversarySearch.trim());
        }

        if (anniversaryRange === "custom") {
          if (anniversaryDateFrom.trim()) {
            params.set("dateFrom", anniversaryDateFrom.trim());
          }
          if (anniversaryDateTo.trim()) {
            params.set("dateTo", anniversaryDateTo.trim());
          }
        }

        const response = await fetch(`/api/studio/insights?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load anniversary insights");
        }

        const payload = (await response.json()) as AnniversaryInsightsResponse;
        if (!cancelled) {
          setAnniversaryData(payload);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load anniversary insights.");
          setAnniversaryData(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingAnniversary(false);
        }
      }
    }

    void loadAnniversary();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    anniversaryDateFrom,
    anniversaryDateTo,
    anniversaryMilestone,
    anniversaryPage,
    anniversaryRange,
    anniversarySearch,
    status,
  ]);

  useEffect(() => {
    setAnniversaryPage(1);
  }, [anniversarySearch, anniversaryMilestone, anniversaryRange, anniversaryDateFrom, anniversaryDateTo]);

  const anniversaryHasFilters =
    anniversarySearch.trim().length > 0 ||
    anniversaryMilestone !== "all" ||
    anniversaryRange !== "all" ||
    anniversaryDateFrom.trim().length > 0 ||
    anniversaryDateTo.trim().length > 0;

  const anniversaryStartItem = useMemo(() => {
    if (!anniversaryData || anniversaryData.pagination.total === 0) return 0;
    return (anniversaryData.pagination.page - 1) * anniversaryData.pagination.pageSize + 1;
  }, [anniversaryData]);

  const anniversaryEndItem = useMemo(() => {
    if (!anniversaryData) return 0;
    return Math.min(
      anniversaryData.pagination.page * anniversaryData.pagination.pageSize,
      anniversaryData.pagination.total
    );
  }, [anniversaryData]);

  if (status === "loading" || status === "idle" || status === "unauthenticated") {
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

      {error ? (
        <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>
          {error}
        </p>
      ) : null}

      {activeTab === "general" ? (
        loadingGeneral || !generalData ? (
          <GeneralSkeleton />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Total Weddings</p>
                <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalData.allTimeCounts.total)}</p>
              </article>
              <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Completed</p>
                <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalData.allTimeCounts.completed)}</p>
              </article>
              <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Active</p>
                <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalData.allTimeCounts.active)}</p>
              </article>
              <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Closed</p>
                <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(generalData.allTimeCounts.closed)}</p>
              </article>
            </section>

            <section className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
              <div className="md:hidden">
                <MobileFilterSheet title="General Insight Filters" triggerLabel="Filters">
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <select
                      value={selectedYear}
                      onChange={(event) => setSelectedYear(Number(event.target.value))}
                      className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                      aria-label="Filter general insights by year"
                    >
                      {generalData.availableYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="7" y1="12" x2="17" y2="12" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                    </svg>
                    <select
                      value={chartGranularity}
                      onChange={(event) => setChartGranularity(event.target.value as ChartGranularity)}
                      className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                      aria-label="Filter chart granularity"
                    >
                      <option value="yearly">Yearly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  {chartGranularity === "monthly" ? (
                    <div className="relative">
                      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <select
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(Number(event.target.value))}
                        className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                        aria-label="Filter monthly chart by month"
                      >
                        {Array.from({ length: 12 }, (_, monthIndex) => (
                          <option key={monthIndex} value={monthIndex}>{monthLabel(monthIndex)}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </MobileFilterSheet>
              </div>

              <div className="hidden w-full flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 md:flex" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                <div className="relative min-w-44 shrink-0">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                    aria-label="Filter general insights by year"
                  >
                    {generalData.availableYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
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
                      value={selectedMonth}
                      onChange={(event) => setSelectedMonth(Number(event.target.value))}
                      className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                      aria-label="Filter monthly chart by month"
                    >
                      {Array.from({ length: 12 }, (_, monthIndex) => (
                        <option key={monthIndex} value={monthIndex}>{monthLabel(monthIndex)}</option>
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
              <div className="rounded-2xl border p-5 flex h-full min-h-[24rem] flex-col" style={{ borderColor: "var(--border-subtle)", background: "linear-gradient(180deg, color-mix(in srgb, var(--surface) 86%, var(--primary-lighter)) 0%, #ffffff 100%)" }}>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {chartGranularity === "yearly" ? "Wedding Volume by Month" : `Wedding Volume by Week (${monthLabel(selectedMonth)})`}
                </h3>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {chartGranularity === "yearly"
                    ? `Monthly distribution for ${selectedYear}`
                    : `4-week view for ${monthLabel(selectedMonth)} ${selectedYear}`}
                </p>
                <div className="mt-4 min-h-0 flex-1">
                  {loadingGeneralGraphs ? (
                    <div className="h-full w-full rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                  ) : (
                    <NeoBarChart
                      data={generalData.barData.map((bucket) => ({ label: bucket.label, value: bucket.count }))}
                      tone="primary"
                      xAxisLabel={chartGranularity === "yearly" ? "Month Of Year" : "Week Of Month"}
                    />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border p-5 flex h-full min-h-[24rem] flex-col" style={{ borderColor: "var(--border-subtle)", background: "linear-gradient(180deg, #ffffff 0%, color-mix(in srgb, var(--surface) 88%, var(--secondary-lighter)) 100%)" }}>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Status Breakdown</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {chartGranularity === "yearly"
                    ? `Lifecycle mix for ${selectedYear}`
                    : `Lifecycle mix for ${monthLabel(selectedMonth)} ${selectedYear}`}
                </p>
                <div className="mt-4 min-h-0 flex-1">
                  {loadingGeneralGraphs ? (
                    <div className="h-full w-full rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                  ) : (
                    <NeoDonutChart
                      segments={generalData.statusSegments}
                      centerLabel="Events"
                      centerValue={formatNumber(generalData.totals.totalEvents)}
                    />
                  )}
                </div>
              </div>
            </section>
          </>
        )
      ) : loadingAnniversary || !anniversaryData ? (
        <AnniversarySkeleton />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 7 Days</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryData.cards.next7)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 30 Days</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryData.cards.next30)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 3 Month</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryData.cards.next90)}</p>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>In 6 Month</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(anniversaryData.cards.next180)}</p>
            </article>
          </section>

          <section className="ui-page rounded-lg flex h-[calc(100dvh-18rem)] min-h-[32rem] flex-col overflow-hidden p-4">
            <div className="ui-page-header block">
              <div className="min-w-0">
                <h3 className="ui-title">Anniversary Events</h3>
                <p className="ui-subtitle">Browse anniversary records and upcoming celebrations.</p>
              </div>

              <div className="mt-2 md:hidden">
                <MobileFilterSheet title="Anniversary Filters" triggerLabel="Filters">
                  <div className="relative">
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

                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="7" y1="12" x2="17" y2="12" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                    </svg>
                    <select
                      value={anniversaryMilestone}
                      onChange={(event) => setAnniversaryMilestone(event.target.value as AnniversaryMilestoneFilter)}
                      className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                      aria-label="Filter anniversaries by anniversary year"
                    >
                      <option value="all">All anniversary years</option>
                      <option value="1">1 year</option>
                      <option value="5">5 years</option>
                      <option value="10">10 years</option>
                      <option value="15">15 years</option>
                      <option value="20">20 years</option>
                    </select>
                  </div>

                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <select
                      value={anniversaryRange}
                      onChange={(event) => setAnniversaryRange(event.target.value as AnniversaryRangeFilter)}
                      className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                      aria-label="Filter anniversaries by date"
                    >
                      <option value="all">Any date</option>
                      <option value="next-7">Next week</option>
                      <option value="next-30">Next month</option>
                      <option value="next-90">Next 90 days</option>
                      <option value="next-365">Next year</option>
                      <option value="custom">Custom range</option>
                    </select>
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
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}
                  >
                    Reset
                  </button>
                </MobileFilterSheet>
              </div>

              <div className="hidden w-full flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 md:flex" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
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
              {anniversaryData.items.length === 0 ? (
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
                  <div className="min-h-0 flex-1 overflow-auto md:hidden">
                    <div className="grid gap-3 p-3">
                      {anniversaryData.items.map((item) => (
                        <article
                          key={`${item.id}-${item.nextAnniversary}-mobile`}
                          className="cursor-pointer rounded-lg border p-3 transition hover:bg-zinc-50"
                          style={{ borderColor: "var(--border-subtle)" }}
                          role="link"
                          tabIndex={0}
                          onClick={() => router.push(`/studio/events/${item.id}`)}
                          onKeyDown={(keyboardEvent) => {
                            if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                              keyboardEvent.preventDefault();
                              router.push(`/studio/events/${item.id}`);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-zinc-800">{item.eventTitle}</p>
                              <p className="mt-1 truncate text-xs text-zinc-500">Next: {formatShortDate(item.nextAnniversary)}</p>
                            </div>
                            <span className="inline-flex rounded-full border px-2 py-1 text-xs font-medium" style={{ borderColor: "var(--secondary-light)", background: "var(--secondary-lighter)", color: "var(--secondary)" }}>
                              {item.years}y
                            </span>
                          </div>

                          <div className="mt-3 text-sm text-zinc-600">
                            <p>{item.couple}</p>
                            <p className="mt-1">{item.location ?? "No location provided"}</p>
                            <p className="mt-1">Wedding: {formatDate(item.weddingDate)}</p>
                            <p className="mt-1">Left time: {formatTimeLeft(item.daysUntil)}</p>
                          </div>

                          <div className="mt-4">
                            <Link
                              href={`/studio/events/${item.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-px"
                              style={{ borderColor: "var(--border-subtle)", color: "var(--primary)" }}
                              onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                            >
                              View Detail
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="min-h-0 hidden flex-1 overflow-auto md:block">
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
                        {anniversaryData.items.map((item) => (
                          <tr
                            key={`${item.id}-${item.nextAnniversary}`}
                            className="cursor-pointer border-t align-middle transition hover:bg-zinc-50"
                            style={{ borderColor: "var(--border-subtle)" }}
                            onClick={() => router.push(`/studio/events/${item.id}`)}
                          >
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
                                onClick={(mouseEvent) => mouseEvent.stopPropagation()}
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
                        Showing {anniversaryStartItem} to {anniversaryEndItem} of {anniversaryData.pagination.total} entries
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAnniversaryPage((current) => Math.max(1, current - 1))}
                          disabled={!anniversaryData.pagination.hasPrev}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                        >
                          Previous
                        </button>

                        <span>
                          Page {anniversaryData.pagination.page} of {anniversaryData.pagination.totalPages}
                        </span>

                        <button
                          type="button"
                          onClick={() => setAnniversaryPage((current) => current + 1)}
                          disabled={!anniversaryData.pagination.hasNext}
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
