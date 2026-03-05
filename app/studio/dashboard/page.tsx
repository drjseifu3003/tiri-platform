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
  isPublished: boolean;
  _count: {
    guests: number;
    media: number;
  };
};

type EventsResponse = {
  events: EventListItem[];
};

type GuestCategory = "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";

type GuestListItem = {
  id: string;
  eventId?: string;
  name: string;
  category: GuestCategory;
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
  };
};

type GuestsResponse = {
  guests: GuestListItem[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function DashboardPage() {
  const { status, session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [guests, setGuests] = useState<GuestListItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      try {
        const [eventsRes, guestsRes] = await Promise.all([
          fetch("/api/studio/events", { credentials: "include" }),
          fetch("/api/studio/guests?scope=studio", { credentials: "include" }),
        ]);

        if (!eventsRes.ok || !guestsRes.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const eventsJson = (await eventsRes.json()) as EventsResponse;
        const guestsJson = (await guestsRes.json()) as GuestsResponse;

        if (!cancelled) {
          setEvents(eventsJson.events ?? []);
          setGuests(guestsJson.guests ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load dashboard data");
        }
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

  const coreStats = useMemo(() => {
    const totalEvents = events.length;
    const now = new Date();
    const inThirtyDays = new Date();
    inThirtyDays.setDate(inThirtyDays.getDate() + 30);
    const upcomingThirtyDays = events.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= now && date <= inThirtyDays;
    }).length;

    const guestsCheckedInToday = guests.filter((guest) => {
      if (!guest.checkedInAt) return false;
      return isSameDate(new Date(guest.checkedInAt), now);
    }).length;

    const totalGuestsInvited = guests.length;
    const totalMedia = events.reduce((sum, event) => sum + event._count.media, 0);

    return [
      { label: "Total events", value: totalEvents },
      { label: "Upcoming events (30 days)", value: upcomingThirtyDays },
      { label: "Total guests invited", value: totalGuestsInvited },
      { label: "Guests checked-in today", value: guestsCheckedInToday },
      { label: "Total media files uploaded", value: totalMedia },
    ];
  }, [events, guests]);

  const checkedInCount = useMemo(() => guests.filter((guest) => guest.checkedIn).length, [guests]);
  const publishedCount = useMemo(() => events.filter((event) => event.isPublished).length, [events]);
  const draftCount = useMemo(() => events.length - publishedCount, [events.length, publishedCount]);

  const eventsToday = useMemo(() => {
    const now = new Date();
    return events.filter((event) => isSameDate(new Date(event.eventDate), now));
  }, [events]);

  const eventsThisWeek = useMemo(() => {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return events.filter((event) => {
      const date = new Date(event.eventDate);
      return date >= now && date <= end;
    });
  }, [events]);

  const attentionItems = useMemo(() => {
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    const items: Array<{ id: string; message: string; actionHref: string; actionLabel: string }> = [];

    for (const event of events) {
      const date = new Date(event.eventDate);

      if (date >= now && date <= inSevenDays) {
        if (event._count.guests === 0) {
          items.push({
            id: `${event.id}-missing-guests`,
            message: `${event.title}: upcoming in less than 7 days with no guests added.`,
            actionHref: "/studio/guests",
            actionLabel: "Add guests",
          });
        }

        if (!event.isPublished) {
          items.push({
            id: `${event.id}-not-published`,
            message: `${event.title}: invitation is not published.`,
            actionHref: "/studio/events",
            actionLabel: "Review event",
          });
        }
      }

      if (date < now && event._count.media === 0) {
        items.push({
          id: `${event.id}-missing-media`,
          message: `${event.title}: event completed but no media uploaded.`,
          actionHref: "/studio/media",
          actionLabel: "Upload media",
        });
      }
    }

    return items.slice(0, 8);
  }, [events]);

  const upcomingWeddings = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => new Date(event.eventDate).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);

  const recentWeddings = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => new Date(event.eventDate).getTime() < now.getTime())
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [events]);

  const nextWedding = upcomingWeddings[0];
  const lastWedding = recentWeddings[0];

  const publishedRatio = useMemo(() => {
    if (events.length === 0) return "0%";
    const published = events.filter((event) => event.isPublished).length;
    return `${Math.round((published / events.length) * 100)}%`;
  }, [events]);

  if (status === "loading" || status === "idle" || status === "unauthenticated") {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white px-4 sm:px-6">
        <div className="py-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_280px]">
            <article className="rounded-2xl border p-6" style={{ background: "linear-gradient(135deg, var(--primary-rose-lighter) 0%, var(--primary-green-lighter) 100%)", borderColor: "var(--border-subtle)" }}>
              <p className="text-lg font-semibold" style={{ color: "var(--primary-green)" }}>Guest Operations</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm" style={{ color: "#8b8680" }}>Total guests</p>
                  <p className="mt-1 text-4xl font-semibold" style={{ color: "var(--primary-rose)" }}>{formatNumber(guests.length)}</p>
                </div>
                <div className="border-l pl-4" style={{ borderColor: "rgba(61, 55, 50, 0.1)" }}>
                  <p className="text-sm" style={{ color: "#8b8680" }}>Checked in</p>
                  <p className="mt-1 text-4xl font-semibold" style={{ color: "var(--primary-green)" }}>{formatNumber(checkedInCount)}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border p-6" style={{ background: "linear-gradient(135deg, #e8d4d1 0%, #d0dcd4 100%)", borderColor: "var(--border-subtle)" }}>
              <p className="text-lg font-semibold" style={{ color: "var(--primary-green)" }}>Event Pipeline</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm" style={{ color: "#8b8680" }}>Published</p>
                  <p className="mt-1 text-4xl font-semibold" style={{ color: "var(--primary-green)" }}>{formatNumber(publishedCount)}</p>
                </div>
                <div className="border-l pl-4" style={{ borderColor: "rgba(61, 55, 50, 0.1)" }}>
                  <p className="text-sm" style={{ color: "#8b8680" }}>Draft</p>
                  <p className="mt-1 text-4xl font-semibold" style={{ color: "var(--primary-rose)" }}>{formatNumber(draftCount)}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}>
              <p className="text-2xl font-semibold" style={{ color: "var(--primary-green)" }}>Operational Snapshot</p>
              <p className="mt-4 text-lg font-semibold" style={{ color: "var(--primary-rose)" }}>
                Next: {nextWedding ? nextWedding.title : "No upcoming wedding"}
              </p>
              <p className="text-sm" style={{ color: "#8b8680" }}>
                Last: {lastWedding ? lastWedding.title : "No completed wedding yet"}
              </p>
              <div className="mt-6 h-20 w-full">
                <svg viewBox="0 0 220 80" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                  <path
                    d="M0 52 C24 42, 42 32, 64 36 C88 40, 105 58, 128 50 C150 42, 170 24, 194 30 C205 33, 213 40, 220 45"
                    fill="none"
                    stroke="currentColor"
                    style={{ color: "var(--primary-rose-light)" }}
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}