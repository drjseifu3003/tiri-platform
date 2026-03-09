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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

      try {
        const eventsRes = await fetch("/api/studio/events", { credentials: "include" });

        if (!eventsRes.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const eventsJson = (await eventsRes.json()) as EventsResponse;

        if (!cancelled) {
          setEvents(eventsJson.events ?? []);
        }
      } catch {
        if (!cancelled) setEvents([]);
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

  const draftCount = useMemo(() => events.filter((event) => resolveEventStatus(event) === "DRAFT").length, [events]);
  const scheduledCount = useMemo(() => events.filter((event) => resolveEventStatus(event) === "SCHEDULED").length, [events]);
  const liveCount = useMemo(() => events.filter((event) => resolveEventStatus(event) === "LIVE").length, [events]);
  const completedCount = useMemo(() => events.filter((event) => resolveEventStatus(event) === "COMPLETED").length, [events]);

  const nearTermLoad = useMemo(() => {
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

  const upcomingWeddings = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => new Date(event.eventDate).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);

  const nextWedding = upcomingWeddings[0];
  const upcomingScheduledEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => resolveEventStatus(event) === "SCHEDULED" && new Date(event.eventDate).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);

  if (status === "loading" || status === "idle" || status === "unauthenticated" || loadingData) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-8">
      {/* Featured Event */}
      <section className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            Next Event
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {nextWedding ? nextWedding.title : "No upcoming events"}
          </h2>
          {nextWedding && (
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              {formatShortDate(new Date(nextWedding.eventDate))} • {nextWedding.location || "Location TBD"}
            </p>
          )}
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Draft</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(draftCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Events waiting to be published</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Scheduled</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(scheduledCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Upcoming weddings</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Live</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(liveCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Events in progress</p>
        </div>
        <div className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Completed</p>
          <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(completedCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Delivered events</p>
        </div>
      </section>

      {/* Upcoming Events Table */}
      <section className="rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="border-b p-6 flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Upcoming Events</h3>
          <Link
            href="/studio/events"
            className="rounded-lg border px-4 py-2 text-sm font-medium"
            style={{ borderColor: "var(--border-subtle)", color: "var(--primary)" }}
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border-subtle)`, background: "var(--surface-muted)" }}>
                <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Event</th>
                <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Couple</th>
                <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Date</th>
                <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Location</th>
                <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Guests</th>
              </tr>
            </thead>
            <tbody>
              {upcomingScheduledEvents.length > 0 ? (
                upcomingScheduledEvents.slice(0, 8).map((event) => (
                  <tr key={event.id} style={{ borderBottom: `1px solid var(--border-subtle)` }}>
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--text-primary)" }}>{event.title}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{[event.brideName, event.groomName].filter(Boolean).join(" & ") || "-"}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{formatShortDate(new Date(event.eventDate))}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{event.location || "-"}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{formatNumber(event._count.guests)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                    No upcoming events scheduled
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
