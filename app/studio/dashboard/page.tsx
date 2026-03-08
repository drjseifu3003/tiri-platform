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
    <main className="flex min-h-full flex-col gap-6">
      <section
        className="overflow-hidden rounded-3xl border p-5 shadow-sm sm:p-6"
        style={{
          borderColor: "var(--border-subtle)",
          background:
            "radial-gradient(circle at 12% 15%, rgba(95,18,63,0.1), transparent 35%), radial-gradient(circle at 85% 10%, rgba(91,168,184,0.15), transparent 28%), var(--surface)",
        }}
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
            Studio Pulse
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--primary)" }}>
            {nextWedding ? `Next event: ${nextWedding.title}` : "No upcoming event scheduled"}
          </h2>
          <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
            {nextWedding
              ? `${formatShortDate(new Date(nextWedding.eventDate))} - Keep your next delivery timeline healthy.`
              : "Create or publish events to start filling your upcoming pipeline."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Draft events</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(draftCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Need publishing before they enter schedule</p>
        </article>
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Scheduled</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(scheduledCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Planned events awaiting execution</p>
        </article>
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Live now</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(liveCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Events currently in progress</p>
        </article>
        <article className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>Completed events</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatNumber(completedCount)}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Finished events ready for follow-up</p>
        </article>
      </section>

      <section>
        <article className="rounded-2xl border p-5 shadow-sm sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Upcoming Events</h3>
            <Link
              href="/studio/events"
              className="rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--primary)" }}
            >
              View full event list
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Couple</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Guests</th>
                </tr>
              </thead>
              <tbody>
                {upcomingScheduledEvents.slice(0, 10).map((event) => (
                  <tr key={event.id} className="border-t border-zinc-100 align-top hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-800">{event.title}</td>
                    <td className="px-4 py-3 text-zinc-700">{[event.brideName, event.groomName].filter(Boolean).join(" & ") || "-"}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatShortDate(new Date(event.eventDate))}</td>
                    <td className="px-4 py-3 text-zinc-600">{event.location || "-"}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatNumber(event._count.guests)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {upcomingScheduledEvents.length === 0 ? (
              <p className="mt-3 rounded-xl border px-3 py-5 text-center text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                No upcoming events found.
              </p>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
