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
      <section
        className="rounded-3xl border p-5 shadow-sm sm:p-6"
        style={{
          borderColor: "var(--border-subtle)",
          background:
            "radial-gradient(circle at right top, rgba(122, 26, 83, 0.12), transparent 48%), radial-gradient(circle at left bottom, rgba(91, 168, 184, 0.1), transparent 50%), var(--surface)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
              Data Insight
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--primary)" }}>
              Full-Year Anniversary Insight
            </h2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Campaign-ready anniversary planning for {selectedYear} across your completed wedding history.
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

        <div className="mt-4">
          <InsightsTabs activeTab="anniversary" anniversaryCount={anniversaryList.length} />
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
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          Use this NeoChart view to schedule outreach and offers before high-volume months.
        </p>
        <div className="mt-4">
          <NeoBarChart data={monthlyAnniversaryCounts.map((item) => ({ label: item.month, value: item.count }))} tone="accent" />
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
          <div className="mt-4 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <table className="min-w-full text-left text-sm">
              <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                <tr>
                  <th className="px-4 py-3 font-medium">Anniversary date</th>
                  <th className="px-4 py-3 font-medium">Couple</th>
                  <th className="px-4 py-3 font-medium">Wedding</th>
                  <th className="px-4 py-3 font-medium">Year milestone</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {anniversaryList.map((item) => (
                  <tr
                    key={`${item.id}-${item.anniversaryDate.toISOString()}`}
                    className="align-top transition"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{formatDate(item.anniversaryDate)}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.couple}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.eventTitle}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      <span
                        className="rounded-full border px-2 py-1 text-xs font-medium"
                        style={{ borderColor: "var(--secondary-light)", background: "var(--secondary-lighter)", color: "var(--secondary)" }}
                      >
                        {item.years} year
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.location ?? "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/studio/events/${item.id}`}
                        className="inline-flex rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                        style={{ borderColor: "var(--border-subtle)", color: "var(--primary)", background: "var(--surface-muted)" }}
                      >
                        View event
                      </Link>
                    </td>
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
