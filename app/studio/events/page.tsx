"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone: string | null;
  groomPhone: string | null;
  eventDate: string;
  location: string | null;
  isPublished: boolean;
  _count: {
    guests: number;
    media: number;
  };
  template: {
    name: string;
  } | null;
};

type GuestListItem = {
  id: string;
  eventId: string;
  checkedIn: boolean;
};

type EventsResponse = { events: EventListItem[] };
type GuestsResponse = { guests: GuestListItem[] };
type TemplateListItem = {
  id: string;
  name: string;
  category: "TRADITIONAL" | "MODERN" | "RELIGIOUS";
  isActive: boolean;
};
type TemplatesResponse = { templates: TemplateListItem[] };

type EventFilter =
  | "all"
  | "today"
  | "this-week"
  | "this-month"
  | "upcoming"
  | "past"
  | "drafts"
  | "missing-guests"
  | "missing-media";

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
  const [filter, setFilter] = useState<EventFilter>("all");
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    templateId: "",
    title: "",
    brideName: "",
    groomName: "",
    bridePhone: "",
    groomPhone: "",
    eventDate: "",
    location: "",
    description: "",
    isPublished: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [eventsRes, guestsRes, templatesRes] = await Promise.all([
        fetch("/api/studio/events", { credentials: "include" }),
        fetch("/api/studio/guests?scope=studio", { credentials: "include" }),
        fetch("/api/studio/templates", { credentials: "include" }),
      ]);

      if (!eventsRes.ok || !guestsRes.ok || !templatesRes.ok) {
        throw new Error("Unable to load events");
      }

      const eventsJson = (await eventsRes.json()) as EventsResponse;
      const guestsJson = (await guestsRes.json()) as GuestsResponse;
      const templatesJson = (await templatesRes.json()) as TemplatesResponse;

      const checkedInMap: Record<string, number> = {};
      for (const guest of guestsJson.guests ?? []) {
        if (!guest.checkedIn) continue;
        checkedInMap[guest.eventId] = (checkedInMap[guest.eventId] ?? 0) + 1;
      }

      setEvents(eventsJson.events ?? []);
      setCheckedInByEvent(checkedInMap);
      setTemplates(templatesJson.templates ?? []);
    } catch {
      setError("Unable to load events");
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

  async function handleCreateEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const title = formData.title.trim();
    const bridePhone = formData.bridePhone.trim();
    const groomPhone = formData.groomPhone.trim();

    if (!formData.templateId) {
      setCreateError("Please choose a template.");
      return;
    }

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
          templateId: formData.templateId,
          title,
          brideName: formData.brideName.trim() || undefined,
          groomName: formData.groomName.trim() || undefined,
          bridePhone,
          groomPhone,
          eventDate: new Date(formData.eventDate).toISOString(),
          location: formData.location.trim() || undefined,
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
        templateId: "",
        title: "",
        brideName: "",
        groomName: "",
        bridePhone: "",
        groomPhone: "",
        eventDate: "",
        location: "",
        description: "",
        isPublished: false,
      });
      setCreateSuccess("Event created successfully.");
      setIsCreateOpen(false);
      await loadData();
    } catch {
      setCreateError("Unable to create event. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  }

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);

      const matchesSearch =
        query.length === 0 ||
        event.title.toLowerCase().includes(query) ||
        (event.brideName ?? "").toLowerCase().includes(query) ||
        (event.groomName ?? "").toLowerCase().includes(query) ||
        (event.bridePhone ?? "").toLowerCase().includes(query) ||
        (event.groomPhone ?? "").toLowerCase().includes(query) ||
        eventDate.toLocaleDateString().toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "today") return eventDate >= startOfToday && eventDate < new Date(startOfToday.getTime() + 86400000);
      if (filter === "this-week") return eventDate >= startOfToday && eventDate <= endOfWeek;
      if (filter === "this-month") return eventDate >= startOfToday && eventDate <= endOfMonth;
      if (filter === "upcoming") return eventDate >= startOfToday;
      if (filter === "past") return eventDate < startOfToday;
      if (filter === "drafts") return !event.isPublished;
      if (filter === "missing-guests") return event._count.guests === 0;
      if (filter === "missing-media") return event._count.media === 0;
      return true;
    });
  }, [events, filter, search]);

  const summary = useMemo(() => {
    let published = 0;
    let upcoming = 0;
    let guests = 0;
    let checkedIn = 0;
    const today = new Date();

    for (const event of events) {
      if (event.isPublished) published += 1;
      if (new Date(event.eventDate) >= today) upcoming += 1;
      guests += event._count.guests;
      checkedIn += checkedInByEvent[event.id] ?? 0;
    }

    return { published, upcoming, guests, checkedIn };
  }, [checkedInByEvent, events]);

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <h2 className="ui-title">Events</h2>
          <p className="ui-subtitle">Manage all weddings with filters, search, and operational actions.</p>
        </div>

        <div className="flex w-full max-w-2xl flex-wrap items-center justify-end gap-2">
          <div className="relative w-full max-w-xs">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bride, groom, phone, or date"
              className="ui-input w-full pl-10"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setCreateSuccess(null);
              setIsCreateOpen((value) => !value);
            }}
            className="ui-button-primary whitespace-nowrap"
          >
            {isCreateOpen ? "Cancel" : "+ Event"}
          </button>
        </div>
      </div>

      {createSuccess ? <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{createSuccess}</p> : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-6">
              <h3 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>Create New Event</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Add event details, assign a template, and publish when ready.</p>
            </div>

          <form className="space-y-4" onSubmit={handleCreateEventSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Template *</span>
                <select
                  value={formData.templateId}
                  onChange={(event) => setFormData((current) => ({ ...current, templateId: event.target.value }))}
                  className="ui-select"
                  required
                >
                  <option value="">Select template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} · {template.category}
                    </option>
                  ))}
                </select>
              </label>

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
                <input
                  value={formData.bridePhone}
                  onChange={(event) => setFormData((current) => ({ ...current, bridePhone: event.target.value }))}
                  placeholder="+2519..."
                  className="ui-input"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Phone *</span>
                <input
                  value={formData.groomPhone}
                  onChange={(event) => setFormData((current) => ({ ...current, groomPhone: event.target.value }))}
                  placeholder="+2519..."
                  className="ui-input"
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

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["today", "Today"],
          ["this-week", "This week"],
          ["this-month", "This month"],
          ["upcoming", "Upcoming"],
          ["past", "Past"],
          ["drafts", "Drafts"],
          ["missing-guests", "Missing guests"],
          ["missing-media", "Missing media"],
        ].map(([value, label]) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as EventFilter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "text-white"
                  : "border text-zinc-600 hover:opacity-75"
              }`}
              style={active ? { background: "linear-gradient(to right, var(--primary), var(--primary-light))" } : { borderColor: "var(--border-subtle)", background: "var(--surface)" }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Total events</p>
          <p className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>{events.length}</p>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Published</p>
          <p className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>{summary.published}</p>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Upcoming</p>
          <p className="mt-1 text-xl font-semibold" style={{ color: "var(--secondary)" }}>{summary.upcoming}</p>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Check-ins</p>
          <p className="mt-1 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {summary.checkedIn} / {summary.guests}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading events...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : (
        <div className="ui-table">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Event</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Couple</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Attendance</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Media</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const checkedInCount = checkedInByEvent[event.id] ?? 0;
                  const totalGuests = event._count.guests;
                  const attendanceRate = totalGuests === 0 ? 0 : Math.round((checkedInCount / totalGuests) * 100);
                  const status = statusForEvent(event);

                  return (
                    <tr key={event.id} className="border-t align-top transition hover:opacity-80" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-800">{event.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {event.template?.name ?? "No template"}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-700">
                            {initialsForCouple(event)}
                          </span>
                          <div>
                            <p className="text-zinc-700">{[event.brideName, event.groomName].filter(Boolean).join(" & ") || "Pending names"}</p>
                            <p className="text-xs text-zinc-500">Bride: {event.bridePhone || "—"}</p>
                            <p className="text-xs text-zinc-500">Groom: {event.groomPhone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{formatEventDate(event.eventDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(status)}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-700">
                          {checkedInCount}/{totalGuests}
                        </p>
                        <p className="text-xs text-zinc-500">{attendanceRate}% checked in</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{event._count.media}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Link href="/studio/guests" className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs text-cyan-700">
                            Guests
                          </Link>
                          <Link href="/studio/guests" className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs text-violet-700">
                            Check-in
                          </Link>
                          <Link href="/studio/media" className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
                            Media
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="px-4 py-5 text-sm text-zinc-600">No events match your filter/search.</p>
          ) : null}
        </div>
      )}
    </main>
  );
}
