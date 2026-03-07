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
  status?: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
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

type EventQuickFilter = "all" | "draft" | "scheduled" | "live" | "completed" | "cancelled" | "archived";

function resolveStatus(event: EventListItem) {
  if (event.status) return event.status;

  const now = new Date();
  const eventDate = new Date(event.eventDate);
  if (eventDate < now) return "COMPLETED" as const;
  if (event.isPublished) return "SCHEDULED" as const;
  return "DRAFT" as const;
}

function statusLabel(status: ReturnType<typeof resolveStatus>) {
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "LIVE") return "Live";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

function statusClasses(status: ReturnType<typeof resolveStatus>) {
  if (status === "LIVE") return "border-rose-300 bg-rose-50 text-rose-800";
  if (status === "SCHEDULED") return "border-sky-300 bg-sky-50 text-sky-800";
  if (status === "COMPLETED") return "border-slate-300 bg-slate-100 text-slate-700";
  if (status === "CANCELLED") return "border-red-300 bg-red-50 text-red-700";
  if (status === "ARCHIVED") return "border-zinc-300 bg-zinc-100 text-zinc-700";
  return "border-amber-300 bg-amber-50 text-amber-800";
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
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
    eventTime: "18:00",
    location: "",
    googleMapAddress: "",
    description: "",
  });

  const minEventDate = toDateInputValue(new Date());
  const eventDateTime = formData.eventDate && formData.eventTime ? new Date(`${formData.eventDate}T${formData.eventTime}`) : null;
  const eventDateTimePreview = eventDateTime && isValidDate(eventDateTime)
    ? new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(eventDateTime)
    : null;

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
    const googleMapAddress = formData.googleMapAddress.trim() || undefined;

    if (title.length < 2) {
      setCreateError("Event title must be at least 2 characters.");
      return;
    }

    if (!formData.eventDate || !formData.eventTime) {
      setCreateError("Please provide an event date and time.");
      return;
    }

    const parsedEventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
    if (!isValidDate(parsedEventDateTime)) {
      setCreateError("Please provide a valid event date and time.");
      return;
    }

    if (!bridePhone || !groomPhone) {
      setCreateError("Bride and groom phone numbers are required.");
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
          eventDate: parsedEventDateTime.toISOString(),
          location: formData.location.trim() || undefined,
          googleMapAddress,
          description: formData.description.trim() || undefined,
          slug,
          status: "DRAFT",
          isPublished: false,
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
        eventTime: "18:00",
        location: "",
        googleMapAddress: "",
        description: "",
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
                  { value: "draft", label: "Draft" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "live", label: "Live" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "archived", label: "Archived" },
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
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Add event details to create your event.</p>
            </div>

          <form className="space-y-4" onSubmit={handleCreateEventSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2 md:row-span-2">
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

              <div className="rounded-xl border p-3 md:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Schedule *</span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Date</span>
                    <input
                      type="date"
                      value={formData.eventDate}
                      min={minEventDate}
                      onChange={(event) => setFormData((current) => ({ ...current, eventDate: event.target.value }))}
                      className="ui-input"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Time</span>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(event) => setFormData((current) => ({ ...current, eventTime: event.target.value }))}
                      className="ui-input"
                      required
                    />
                  </label>
                </div>

                <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {eventDateTimePreview ? `Scheduled for ${eventDateTimePreview}` : "Pick a date and time for the event invitation."}
                </p>
              </div>

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
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Google Map Address</span>
                <input
                  value={formData.googleMapAddress}
                  onChange={(event) => setFormData((current) => ({ ...current, googleMapAddress: event.target.value }))}
                  placeholder="https://maps.google.com/... or share address"
                  className="ui-input"
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
                  const totalGuests = event._count.guests;
                  const status = resolveStatus(event);

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
                      </td>
                      <td className="px-4 py-4 text-center text-zinc-700">{event._count.media}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(status)}`}>{statusLabel(status)}</span>
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