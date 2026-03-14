"use client";

import { useSession } from "@/lib/session-context";
import { PhoneInput } from "@/components/ui/phone-input";
import { MobileFilterSheet } from "@/components/ui/mobile-filter-sheet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone: string | null;
  groomPhone: string | null;
  eventDate: string;
};

type MediaItem = {
  id: string;
  eventId: string;
  createdAt: string;
};

type MediaResponse = { media: MediaItem[] };
type EventsResponse = { events: EventListItem[] };

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function StudioMediaPage() {
  const { status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const pageSize = viewMode === "grid" ? 16 : 12;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const mediaRes = await fetch("/api/studio/media?scope=studio", { credentials: "include" });
      if (!mediaRes.ok) {
        throw new Error("Unable to load media folders");
      }

      const allEvents: EventListItem[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const eventsRes = await fetch(`/api/studio/events?page=${page}&pageSize=100&filter=all`, { credentials: "include" });
        if (!eventsRes.ok) {
          throw new Error("Unable to load media folders");
        }

        const eventsJson = (await eventsRes.json()) as EventsResponse & { pagination?: { hasNext?: boolean } };
        allEvents.push(...(eventsJson.events ?? []));
        hasNext = eventsJson.pagination?.hasNext ?? false;
        page += 1;
      }

      const mediaJson = (await mediaRes.json()) as MediaResponse;

      setEvents(allEvents);
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
    const nameQuery = nameSearch.trim().toLowerCase();
    const phoneQuery = phoneSearch.replace(/\D/g, "");

    if (!nameQuery && !phoneQuery) return events;

    return events.filter((event) => {
      const nameHaystack = `${event.title} ${event.brideName ?? ""} ${event.groomName ?? ""}`.toLowerCase();
      const phoneHaystack = `${event.bridePhone ?? ""} ${event.groomPhone ?? ""}`.replace(/\D/g, "");

      const matchesName = !nameQuery || nameHaystack.includes(nameQuery);
      const matchesPhone = !phoneQuery || phoneHaystack.includes(phoneQuery);

      return matchesName && matchesPhone;
    });
  }, [events, nameSearch, phoneSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [nameSearch, phoneSearch, viewMode]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
          <p className="ui-subtitle">Search couples by name or phone number.</p>
        </div>

          <div className="flex w-full items-center justify-between gap-3">
            <div className="md:hidden">
              <MobileFilterSheet title="Media Filters" triggerLabel="Filters">
                <div className="relative">
                  <input
                    value={nameSearch}
                    onChange={(event) => {
                      setNameSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search couple name"
                    className="ui-input w-full pl-10"
                  />
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>

                <PhoneInput
                  value={phoneSearch}
                  onChange={(value) => {
                    setPhoneSearch(value ?? "");
                    setPage(1);
                  }}
                  placeholder="Phone number"
                  defaultCountry="ET"
                  className="w-full"
                />
              </MobileFilterSheet>
            </div>

            <div className="hidden items-center gap-2 md:flex">
            <div className="relative w-80 shrink-0">
            <input
              value={nameSearch}
              onChange={(event) => {
                setNameSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search couple name"
              className="ui-input w-full pl-10"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            </div>

            <PhoneInput
              value={phoneSearch}
              onChange={(value) => {
                setPhoneSearch(value ?? "");
                setPage(1);
              }}
              placeholder="Phone number"
              defaultCountry="ET"
              className="w-64"
            />
          </div>

          <div className="inline-flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
            <button
              type="button"
              aria-label="Grid view"
              title="Grid view"
              onClick={() => setViewMode("grid")}
              className="inline-flex h-10 w-10 items-center justify-center transition"
              style={viewMode === "grid"
                ? { background: "var(--primary-lighter)", color: "var(--primary)" }
                : { background: "var(--surface)", color: "var(--text-secondary)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1.2" />
                <rect x="14" y="3" width="7" height="7" rx="1.2" />
                <rect x="3" y="14" width="7" height="7" rx="1.2" />
                <rect x="14" y="14" width="7" height="7" rx="1.2" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="List view"
              title="List view"
              onClick={() => setViewMode("list")}
              className="inline-flex h-10 w-10 items-center justify-center border-l transition"
              style={viewMode === "list"
                ? { borderColor: "var(--border-subtle)", background: "var(--primary-lighter)", color: "var(--primary)" }
                : { borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-secondary)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading media folders...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedEvents.map((event) => (
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
          ) : (
            <div className="ui-table mt-5 overflow-hidden">
              <div className="grid gap-3 p-3 md:hidden">
                {paginatedEvents.map((event) => (
                  <article key={`${event.id}-mobile-list`} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{event.title}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {[event.brideName, event.groomName].filter(Boolean).join(" & ") || "Pending names"}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{formatEventDate(event.eventDate)}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{mediaCountByEvent[event.id] ?? 0} media item(s)</p>
                    <div className="mt-4">
                      <Link
                        href={`/studio/events/${event.id}?tab=media`}
                        className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                        style={{ borderColor: "var(--border-subtle)", color: "var(--primary)" }}
                      >
                        Open
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                    <tr>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Event</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Couple</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wide">Media</th>
                      <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvents.map((event) => (
                      <tr key={event.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{event.title}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                          {[event.brideName, event.groomName].filter(Boolean).join(" & ") || "Pending names"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{formatEventDate(event.eventDate)}</td>
                        <td className="px-4 py-3 text-center" style={{ color: "var(--text-secondary)" }}>{mediaCountByEvent[event.id] ?? 0}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/studio/events/${event.id}?tab=media`}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--primary)" }}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredEvents.length > 0 ? (
            <div className="mt-4 flex items-center justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
              <p>
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredEvents.length)} of {filteredEvents.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                >
                  Previous
                </button>
                <span className="text-xs">Page {page} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {!loading && !error && filteredEvents.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-600">No event folders match the selected name or phone number.</p>
      ) : null}
    </main>
  );
}

