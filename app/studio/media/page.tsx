"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
};

type MediaItem = {
  id: string;
  eventId: string;
  createdAt: string;
};

type MediaResponse = { media: MediaItem[] };
type EventsResponse = { events: EventListItem[] };

export default function StudioMediaPage() {
  const { status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [eventsRes, mediaRes] = await Promise.all([
        fetch("/api/studio/events", { credentials: "include" }),
        fetch("/api/studio/media?scope=studio", { credentials: "include" }),
      ]);

      if (!eventsRes.ok || !mediaRes.ok) {
        throw new Error("Unable to load media folders");
      }

      const eventsJson = (await eventsRes.json()) as EventsResponse;
      const mediaJson = (await mediaRes.json()) as MediaResponse;

      setEvents(eventsJson.events ?? []);
      setMedia(mediaJson.media ?? []);
    } catch {
      setError("Unable to load media folders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;
    void loadData();
  }, [loadData, router, status]);

  const mediaCountByEvent = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const item of media) {
      counts[item.eventId] = (counts[item.eventId] ?? 0) + 1;
    }

    return counts;
  }, [media]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) => event.title.toLowerCase().includes(query));
  }, [events, search]);

  if (status === "idle" || status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading media folders...</p>
      </main>
    );
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <h2 className="ui-title">Media</h2>
          <p className="ui-subtitle">Open an event folder to manage wedding media.</p>
        </div>

        <div className="relative w-full max-w-xs">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search event folder"
            className="ui-input w-full pl-10"
          />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading media folders...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/studio/events/${event.id}?tab=media`}
              className="rounded-xl border p-4 transition hover:opacity-85"
              style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "var(--surface-muted)", color: "var(--primary)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{event.title}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {mediaCountByEvent[event.id] ?? 0} media item(s)
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && filteredEvents.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-600">No event folders match your search.</p>
      ) : null}
    </main>
  );
}
