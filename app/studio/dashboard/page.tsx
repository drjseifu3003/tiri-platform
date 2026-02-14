"use client";

import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
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
  name: string;
  category: GuestCategory;
  checkedIn: boolean;
  createdAt: string;
  event: {
    id: string;
    title: string;
  };
};

type GuestsResponse = {
  guests: GuestListItem[];
};

type TemplatesResponse = {
  templates: Array<{ id: string }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function DashboardPage() {
  const { status, session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [guests, setGuests] = useState<GuestListItem[]>([]);
  const [templateCount, setTemplateCount] = useState(0);
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
        const [eventsRes, templatesRes, guestsRes] = await Promise.all([
          fetch("/api/studio/events", { credentials: "include" }),
          fetch("/api/studio/templates", { credentials: "include" }),
          fetch("/api/studio/guests?scope=studio", { credentials: "include" }),
        ]);

        if (!eventsRes.ok || !templatesRes.ok || !guestsRes.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const eventsJson = (await eventsRes.json()) as EventsResponse;
        const templatesJson = (await templatesRes.json()) as TemplatesResponse;
        const guestsJson = (await guestsRes.json()) as GuestsResponse;

        if (!cancelled) {
          setEvents(eventsJson.events ?? []);
          setGuests(guestsJson.guests ?? []);
          setTemplateCount(templatesJson.templates?.length ?? 0);
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
    const publishedEvents = events.filter((event) => event.isPublished).length;
    const totalGuests = guests.length;
    const totalMedia = events.reduce((sum, event) => sum + event._count.media, 0);
    const draftEvents = totalEvents - publishedEvents;

    return [
      { label: "Wedding Events", value: totalEvents },
      { label: "Published", value: publishedEvents },
      { label: "Draft Events", value: draftEvents },
      { label: "Total Guests", value: totalGuests },
      { label: "Media Assets", value: totalMedia },
      { label: "Active Templates", value: templateCount },
    ];
  }, [events, guests.length, templateCount]);

  const checkedInCount = useMemo(() => guests.filter((guest) => guest.checkedIn).length, [guests]);
  const pendingCount = useMemo(() => guests.length - checkedInCount, [checkedInCount, guests.length]);
  const publishedCount = useMemo(() => events.filter((event) => event.isPublished).length, [events]);
  const draftCount = useMemo(() => events.length - publishedCount, [events.length, publishedCount]);

  const recentGuests = useMemo(() => guests.slice(0, 3), [guests]);

  const guestTrafficBuckets = useMemo(() => {
    const labels = ["10m", "20m", "40m", "60m", "80m", "120m", "140m"];
    const now = Date.now();
    const stepMs = 20 * 60 * 1000;

    const buckets = labels.map((label, index) => {
      const minAge = index === 0 ? 0 : index * stepMs;
      const maxAge = (index + 1) * stepMs;

      const inBucket = guests.filter((guest) => {
        const age = now - new Date(guest.createdAt).getTime();
        return age >= minAge && age < maxAge;
      });

      return {
        label,
        total: inBucket.length,
        checkedIn: inBucket.filter((guest) => guest.checkedIn).length,
        pending: inBucket.filter((guest) => !guest.checkedIn).length,
      };
    });

    return buckets.reverse();
  }, [guests]);

  const maxTraffic = useMemo(
    () => Math.max(...guestTrafficBuckets.map((bucket) => bucket.total), 1),
    [guestTrafficBuckets]
  );

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
        <div className="flex items-center gap-8 border-b border-zinc-200">
          <button type="button" className="border-b-2 border-cyan-400 pb-3 text-sm font-semibold text-cyan-700">
            Overview
          </button>
          <button type="button" className="pb-3 text-sm text-zinc-500">
            Guest list
          </button>
          <button type="button" className="pb-3 text-sm text-zinc-500">
            Studio insights
          </button>
        </div>

        <div className="py-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_280px]">
            <article className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-200 via-cyan-100 to-cyan-300 p-6 text-cyan-900">
              <p className="text-lg font-semibold">Guest Operations</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-700">Total guests</p>
                  <p className="mt-1 text-4xl font-semibold">{formatNumber(guests.length)}</p>
                </div>
                <div className="border-l border-zinc-400/30 pl-4">
                  <p className="text-sm text-zinc-700">Checked in</p>
                  <p className="mt-1 text-4xl font-semibold">{formatNumber(checkedInCount)}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-200 via-fuchsia-100 to-violet-300 p-6 text-violet-900">
              <p className="text-lg font-semibold">Event Pipeline</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-700">Published</p>
                  <p className="mt-1 text-4xl font-semibold">{formatNumber(publishedCount)}</p>
                </div>
                <div className="border-l border-zinc-400/30 pl-4">
                  <p className="text-sm text-zinc-700">Draft</p>
                  <p className="mt-1 text-4xl font-semibold">{formatNumber(draftCount)}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-violet-100 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-5">
              <p className="text-2xl font-semibold text-violet-700">Studio Activity</p>
              <p className="mt-4 text-3xl font-semibold text-cyan-700">{formatNumber(guests.length)}</p>
              <p className="text-sm text-zinc-500">Pending check-in: {formatNumber(pendingCount)}</p>
              <div className="mt-6 h-20 w-full">
                <svg viewBox="0 0 220 80" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                  <path
                    d="M0 52 C24 42, 42 32, 64 36 C88 40, 105 58, 128 50 C150 42, 170 24, 194 30 C205 33, 213 40, 220 45"
                    fill="none"
                    stroke="currentColor"
                    className="text-violet-400"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-violet-700">Recent Guests</h2>
            <p className="text-sm text-zinc-500">See more</p>
          </div>

          {loadingData ? (
            <p className="mt-6 text-sm text-zinc-600">Loading guests...</p>
          ) : error ? (
            <p className="mt-6 text-sm text-red-700">{error}</p>
          ) : recentGuests.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-600">No guests yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {recentGuests.map((guest) => {
                const initial = guest.name.slice(0, 1).toUpperCase();
                const categoryLabel =
                  guest.category === "BRIDE_GUEST"
                    ? "Bride side"
                    : guest.category === "GROOM_GUEST"
                      ? "Groom side"
                      : "General guest";

                return (
                  <article key={guest.id} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-base font-semibold text-zinc-700">
                        {initial}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-700">{guest.name}</p>
                        <p className="text-xs text-zinc-500">
                          {guest.event.title} • {categoryLabel}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          guest.checkedIn ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {guest.checkedIn ? "Checked in" : "Pending"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-violet-700">Guest Flow Timeline</h2>
            <p className="text-sm text-zinc-500">See more</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />Total guests
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />Checked in
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-violet-300" />Pending
            </span>
          </div>

          {loadingData ? (
            <p className="mt-6 text-sm text-zinc-600">Loading traffic...</p>
          ) : (
            <div className="mt-6 grid grid-cols-7 gap-3">
              {guestTrafficBuckets.map((bucket) => {
                const totalHeight = Math.max((bucket.total / maxTraffic) * 100, bucket.total > 0 ? 14 : 0);
                const checkedInHeight = bucket.total > 0 ? (bucket.checkedIn / bucket.total) * totalHeight : 0;
                const pendingHeight = bucket.total > 0 ? (bucket.pending / bucket.total) * totalHeight : 0;

                return (
                  <div key={bucket.label} className="flex flex-col items-center gap-2">
                    <div className="relative h-44 w-full rounded-lg bg-zinc-50">
                      <div
                        className="absolute inset-x-2 bottom-2 rounded-t-sm bg-cyan-500"
                        style={{ height: `${totalHeight}%` }}
                      />
                      <div
                        className="absolute inset-x-2 rounded-t-sm bg-cyan-300"
                        style={{ height: `${checkedInHeight}%`, bottom: `calc(8px + ${totalHeight - checkedInHeight}%)` }}
                      />
                      <div
                        className="absolute inset-x-2 rounded-t-sm bg-violet-300"
                        style={{ height: `${pendingHeight}%`, bottom: `calc(8px + ${totalHeight - pendingHeight}%)` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">{bucket.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {coreStats.map((stat) => (
          <article key={stat.label} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-700">{formatNumber(stat.value)}</p>
          </article>
        ))}
        <article className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Publishing Progress</p>
          <p className="mt-2 text-2xl font-semibold text-violet-700">{publishedRatio}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Studio Role</p>
          <p className="mt-2 text-2xl font-semibold text-violet-700">{session?.user.role}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Studio Contact</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-700">{session?.user.phone}</p>
        </article>
      </section>
    </main>
  );
}
