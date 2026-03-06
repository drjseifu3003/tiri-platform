"use client";

import { useSession } from "@/lib/session-context";
import { PhoneInput } from "@/components/ui/phone-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone: string | null;
  groomPhone: string | null;
  eventDate: string;
  location: string | null;
  googleMapAddress: string;
  isPublished: boolean;
  _count: {
    guests: number;
    media: number;
  };
};

type EventsResponse = {
  events: EventListItem[];
  checkedInByEvent: Record<string, number>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

type EventQuickFilter = "all" | "published" | "draft" | "completed";

function statusForEvent(event: EventListItem) {
  const now = new Date();
  const eventDate = new Date(event.eventDate);
  if (eventDate < now) return "Completed";
  if (event.isPublished) return "Published";
  return "Draft";
}

function statusClasses(status: string) {
  if (status === "Published") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Completed") return "border-neutral-200 bg-neutral-100 text-neutral-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function initialsForCouple(event: EventListItem) {
  const first = (event.brideName ?? event.groomName ?? event.title).trim().charAt(0).toUpperCase();
  const second = (event.groomName ?? event.brideName ?? "").trim().charAt(0).toUpperCase();
  return `${first}${second || ""}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

export default function StudioEventsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [checkedInByEvent, setCheckedInByEvent] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<EventQuickFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    brideName: "",
    groomName: "",
    bridePhone: "",
    groomPhone: "",
    eventDate: "",
    location: "",
    googleMapAddress: "",
    description: "",
    isPublished: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        filter: quickFilter,
      });

      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 0) {
        params.set("search", trimmedSearch);
      }

      const eventsRes = await fetch(`/api/studio/events?${params.toString()}`, { credentials: "include" });

      if (!eventsRes.ok) {
        throw new Error("Unable to load events");
      }

      const eventsJson = (await eventsRes.json()) as EventsResponse;
      const serverTotalPages = Math.max(1, eventsJson.pagination?.totalPages ?? 1);

      if (page > serverTotalPages) {
        setPage(serverTotalPages);
        return;
      }

      setEvents(eventsJson.events ?? []);
      setCheckedInByEvent(eventsJson.checkedInByEvent ?? {});
      setTotalItems(eventsJson.pagination?.total ?? 0);
      setTotalPages(serverTotalPages);
      setHasPrevPage(eventsJson.pagination?.hasPrev ?? false);
      setHasNextPage(eventsJson.pagination?.hasNext ?? false);
    } catch {
      setError("Unable to load events");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, quickFilter, search]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    void loadData();
  }, [loadData, router, status]);

  async function handleCreateEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const title = formData.title.trim();
    const bridePhone = formData.bridePhone.trim();
    const groomPhone = formData.groomPhone.trim();
    const googleMapAddress = formData.googleMapAddress.trim();

    if (title.length < 2) {
      setCreateError("Event title must be at least 2 characters.");
      return;
    }

    if (!formData.eventDate) {
      setCreateError("Please provide an event date and time.");
      return;
    }

    if (!bridePhone || !groomPhone) {
      setCreateError("Bride and groom phone numbers are required.");
      return;
    }

    if (!googleMapAddress) {
      setCreateError("Google Map address is required.");
      return;
    }

    const baseSlug = slugify(title);
    const uniqueSuffix = Date.now().toString().slice(-6);
    const slug = `${baseSlug || "event"}-${uniqueSuffix}`;

    setCreateLoading(true);

    try {
      const response = await fetch("/api/studio/events", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          brideName: formData.brideName.trim() || undefined,
          groomName: formData.groomName.trim() || undefined,
          bridePhone,
          groomPhone,
          eventDate: new Date(formData.eventDate).toISOString(),
          location: formData.location.trim() || undefined,
          googleMapAddress,
          description: formData.description.trim() || undefined,
          slug,
          isPublished: formData.isPublished,
        }),
      });

      if (!response.ok) {
        setCreateError("Unable to create event. Please check your inputs and try again.");
        return;
      }

      setFormData({
        title: "",
        brideName: "",
        groomName: "",
        bridePhone: "",
        groomPhone: "",
        eventDate: "",
        location: "",
        googleMapAddress: "",
        description: "",
        isPublished: false,
      });
      setCreateSuccess("Event created successfully.");
      setIsCreateOpen(false);
      setPage(1);
    } catch {
      setCreateError("Unable to create event. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  }

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <main className="ui-page">
      <div className="ui-page-header block">
        <div className="min-w-0">
          <h2 className="ui-title">Events</h2>
          <p className="ui-subtitle">Manage event records with quick search and detail view.</p>
        </div>

        <div className="mt-4 flex w-full items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <div className="relative min-w-0 flex-1">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search for any event..."
              className="ui-input h-10 w-full rounded-xl pl-10"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsFilterOpen((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}
            >
              <span>Filter</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
            </button>

            {isFilterOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border p-1 shadow-lg" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                {[
                  { value: "all", label: "All events" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "completed", label: "Completed" },
                ].map((item) => {
                  const active = quickFilter === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setQuickFilter(item.value as EventQuickFilter);
                        setPage(1);
                        setIsFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
                      style={active ? { background: "var(--surface-muted)", color: "var(--text-primary)" } : { color: "var(--text-secondary)" }}
                    >
                      <span>{item.label}</span>
                      {active ? <span aria-hidden="true">•</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setCreateSuccess(null);
              setIsCreateOpen(true);
            }}
            className="ui-button-primary h-10 min-w-36 whitespace-nowrap"
          >
            + Create Event
          </button>
        </div>
      </div>

      {createSuccess ? <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{createSuccess}</p> : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-6">
              <h3 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>Create New Event</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Add event details and publish when ready.</p>
            </div>

          <form className="space-y-4" onSubmit={handleCreateEventSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Title *</span>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Meron & Dawit Wedding"
                  className="ui-input"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Name</span>
                <input
                  value={formData.brideName}
                  onChange={(event) => setFormData((current) => ({ ...current, brideName: event.target.value }))}
                  placeholder="Bride full name"
                  className="ui-input"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Name</span>
                <input
                  value={formData.groomName}
                  onChange={(event) => setFormData((current) => ({ ...current, groomName: event.target.value }))}
                  placeholder="Groom full name"
                  className="ui-input"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Phone *</span>
                <PhoneInput
                  value={formData.bridePhone}
                  onChange={(value) => setFormData((current) => ({ ...current, bridePhone: value ?? "" }))}
                  placeholder="+2519..."
                  defaultCountry="ET"
                  className="w-full"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Phone *</span>
                <PhoneInput
                  value={formData.groomPhone}
                  onChange={(value) => setFormData((current) => ({ ...current, groomPhone: value ?? "" }))}
                  placeholder="+2519..."
                  defaultCountry="ET"
                  className="w-full"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Date & Time *</span>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(event) => setFormData((current) => ({ ...current, eventDate: event.target.value }))}
                  className="ui-input"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Location</span>
                <input
                  value={formData.location}
                  onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
                  placeholder="Venue and city"
                  className="ui-input"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Google Map Address *</span>
                <input
                  value={formData.googleMapAddress}
                  onChange={(event) => setFormData((current) => ({ ...current, googleMapAddress: event.target.value }))}
                  placeholder="https://maps.google.com/... or share address"
                  className="ui-input"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Description</span>
              <textarea
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="Short event description"
                className="ui-textarea"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(event) => setFormData((current) => ({ ...current, isPublished: event.target.checked }))}
                className="h-4 w-4 rounded border" style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
              />
              Publish invitation immediately
            </label>

            {createError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{createError}</p> : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="ui-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="ui-button-primary"
              >
                {createLoading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading events...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : (
        <div className="ui-table mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[27%]" />
                <col className="w-[21%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
              <tr>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Event</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Couple</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Date</th>
                <th className="px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide">Guests</th>
                <th className="px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide">Media</th>
                <th className="px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide">Action</th>
              </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const checkedInCount = checkedInByEvent[event.id] ?? 0;
                  const totalGuests = event._count.guests;
                  const attendanceRate = totalGuests === 0 ? 0 : Math.round((checkedInCount / totalGuests) * 100);
                  const status = statusForEvent(event);

                  return (
                    <tr key={event.id} className="border-t align-middle transition" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                      <td className="px-4 py-4">
                        <p className="truncate font-medium text-zinc-800">{event.title}</p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {event.location ?? "No location provided"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-700">
                            {initialsForCouple(event)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-zinc-700">{[event.brideName, event.groomName].filter(Boolean).join(" & ") || "Pending names"}</p>
                            <p className="truncate text-xs text-zinc-500">{event.bridePhone || "-"} | {event.groomPhone || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-600">{formatEventDate(event.eventDate)}</td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-medium text-zinc-700">{totalGuests}</p>
                        <p className="text-xs text-zinc-500">{attendanceRate}% in</p>
                      </td>
                      <td className="px-4 py-4 text-center text-zinc-700">{event._count.media}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(status)}`}>{status}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/studio/events/${event.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-px"
                          style={{
                            borderColor: "var(--border-subtle)",
                            color: "var(--primary)",
                            background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)",
                          }}
                          aria-label={`View details for ${event.title}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3.5 w-3.5" aria-hidden>
                            <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6z" />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                          <span>Detail</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {events.length === 0 ? (
            <p className="px-4 py-5 text-sm text-zinc-600">No events match your filter/search.</p>
          ) : null}

          <div className="flex items-center justify-between border-t px-4 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
            <p>
              Showing {startItem}-{endItem} of {totalItems}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!hasPrevPage || loading}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                Previous
              </button>
              <span className="px-1 text-xs">Page {page} / {Math.max(1, totalPages)}</span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!hasNextPage || loading}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}