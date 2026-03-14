"use client";

import { useSession } from "@/lib/session-context";
import { PhoneInput } from "@/components/ui/phone-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { MobileFilterSheet } from "@/components/ui/mobile-filter-sheet";

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
type EventDateFilter = "all" | "today" | "upcoming" | "past" | "this-month" | "custom";

const createEventFormSchema = z.object({
  title: z.string().trim().min(2, "Event title must be at least 2 characters."),
  brideName: z.string().trim().min(1, "Bride name is required."),
  groomName: z.string().trim().min(1, "Groom name is required."),
  bridePhone: z.string().trim()
    .min(1, "Bride phone number is required.")
    .refine((value) => value.length === 0 || isValidPhoneNumber(value), "Please enter a valid bride phone number."),
  groomPhone: z.string().trim()
    .min(1, "Groom phone number is required.")
    .refine((value) => value.length === 0 || isValidPhoneNumber(value), "Please enter a valid groom phone number."),
  eventDate: z.string().trim().min(1, "Please provide an event date."),
  eventTime: z.string().trim().min(1, "Please provide an event time."),
  location: z.string().trim().optional(),
  googleMapAddress: z.string().trim().optional(),
  description: z.string().trim().optional(),
}).superRefine((values, ctx) => {
  const parsedEventDateTime = new Date(`${values.eventDate}T${values.eventTime}`);
  if (!isValidDate(parsedEventDateTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide a valid event date and time.",
      path: ["eventDate"],
    });
  }
});

type CreateEventFormValues = z.infer<typeof createEventFormSchema>;

type CreatedEventSummary = {
  id: string;
  title: string;
  eventDate: string;
};

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
  const [dateFilter, setDateFilter] = useState<EventDateFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<CreatedEventSummary | null>(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors: createFormErrors, isSubmitting },
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
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
    },
  });

  const eventDateValue = watch("eventDate");
  const eventTimeValue = watch("eventTime");

  const minEventDate = toDateInputValue(new Date());
  const eventDateTime = eventDateValue && eventTimeValue ? new Date(`${eventDateValue}T${eventTimeValue}`) : null;
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

  const defaultCreateValues: CreateEventFormValues = {
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
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        filter: quickFilter,
        dateFilter,
      });

      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 0) {
        params.set("search", trimmedSearch);
      }

      if (dateFilter === "custom") {
        const trimmedFrom = dateFrom.trim();
        const trimmedTo = dateTo.trim();
        if (trimmedFrom) params.set("dateFrom", trimmedFrom);
        if (trimmedTo) params.set("dateTo", trimmedTo);
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
  }, [page, pageSize, quickFilter, search, dateFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    void loadData();
  }, [loadData, router, status]);

  useEffect(() => {
    if (!createdEvent) {
      setIsConfirmVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsConfirmVisible(true);
    }, 16);

    return () => clearTimeout(timer);
  }, [createdEvent]);

  async function handleCreateEventSubmit(values: CreateEventFormValues) {
    setCreateError(null);
    const title = values.title.trim();
    const bridePhone = values.bridePhone.trim();
    const groomPhone = values.groomPhone.trim();
    const googleMapAddress = values.googleMapAddress?.trim() || undefined;
    const parsedEventDateTime = new Date(`${values.eventDate}T${values.eventTime}`);

    const baseSlug = slugify(title);
    const uniqueSuffix = Date.now().toString().slice(-6);
    const slug = `${baseSlug || "event"}-${uniqueSuffix}`;

    try {
      const response = await fetch("/api/studio/events", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          brideName: values.brideName?.trim() || undefined,
          groomName: values.groomName?.trim() || undefined,
          bridePhone,
          groomPhone,
          eventDate: parsedEventDateTime.toISOString(),
          location: values.location?.trim() || undefined,
          googleMapAddress,
          description: values.description?.trim() || undefined,
          slug,
          status: "DRAFT",
          isPublished: false,
        }),
      });

      if (!response.ok) {
        setCreateError("Unable to create event. Please check your inputs and try again.");
        return;
      }

      const payload = (await response.json()) as { event?: CreatedEventSummary };
      if (payload.event?.id) {
        setCreatedEvent({
          id: payload.event.id,
          title: payload.event.title,
          eventDate: payload.event.eventDate,
        });
      }

      reset(defaultCreateValues);
      setIsCreateOpen(false);
      setPage(1);
      void loadData();
    } catch {
      setCreateError("Unable to create event. Please try again.");
    }
  }

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);
  const hasActiveFilters =
    search.trim().length > 0 ||
    quickFilter !== "all" ||
    dateFilter !== "all" ||
    dateFrom.trim().length > 0 ||
    dateTo.trim().length > 0;

  return (
    <main className="ui-page rounded-lg flex h-[calc(100dvh-6rem)] min-h-0 flex-col overflow-hidden p-4">
      <div className="ui-page-header block">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="ui-title">Events</h2>
            <p className="ui-subtitle">Manage event records with quick search and detail view.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              reset(defaultCreateValues);
              setIsCreateOpen(true);
            }}
            className="ui-button-primary h-10 min-w-36 shrink-0 whitespace-nowrap"
          >
            + Create Event
          </button>
        </div>

        <div className="mt-2 md:hidden">
          <MobileFilterSheet title="Event Filters" triggerLabel="Filters">
            <div className="relative">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search for any event..."
                className="ui-input h-10 w-full rounded-lg pl-10"
              />
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              <select
                value={quickFilter}
                onChange={(event) => {
                  setQuickFilter(event.target.value as EventQuickFilter);
                  setPage(1);
                }}
                className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                aria-label="Filter events by status"
              >
                <option value="all">All status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <select
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value as EventDateFilter);
                  setPage(1);
                }}
                className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                aria-label="Filter events by date"
              >
                <option value="all">Any date</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="this-month">This month</option>
                <option value="custom">Custom range</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            {dateFilter === "custom" ? (
              <>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPage(1);
                  }}
                  className="ui-input h-10 rounded-lg px-2 text-sm"
                  aria-label="Custom date from"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPage(1);
                  }}
                  className="ui-input h-10 rounded-lg px-2 text-sm"
                  aria-label="Custom date to"
                />
              </>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setQuickFilter("all");
                setDateFilter("all");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              disabled={!hasActiveFilters}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}
            >
              Reset
            </button>
          </MobileFilterSheet>
        </div>

        <div className="mt-2 hidden w-full flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 md:flex" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <div className="relative w-80 min-w-80 shrink-0">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search for any event..."
              className="ui-input h-10 w-full rounded-lg pl-10"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative min-w-44">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              <select
                value={quickFilter}
                onChange={(event) => {
                  setQuickFilter(event.target.value as EventQuickFilter);
                  setPage(1);
                }}
                className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                aria-label="Filter events by status"
              >
                <option value="all">All status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            <div className="relative min-w-44">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <select
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value as EventDateFilter);
                  setPage(1);
                }}
                className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                aria-label="Filter events by date"
              >
                <option value="all">Any date</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="this-month">This month</option>
                <option value="custom">Custom range</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            {dateFilter === "custom" ? (
              <>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPage(1);
                  }}
                  className="ui-input h-10 rounded-lg px-2 text-sm"
                  aria-label="Custom date from"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPage(1);
                  }}
                  className="ui-input h-10 rounded-lg px-2 text-sm"
                  aria-label="Custom date to"
                />
              </>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setQuickFilter("all");
                setDateFilter("all");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              disabled={!hasActiveFilters}
              title="Reset filters"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v4h4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-white p-5 shadow-2xl" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-6">
              <h3 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>Create New Event</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Add event details to create your event.</p>
            </div>

          <form className="space-y-4" onSubmit={handleSubmit(handleCreateEventSubmit)}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2 md:row-span-2">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Title *</span>
                <input
                  {...register("title")}
                  placeholder="Meron & Dawit Wedding"
                  className="ui-input"
                />
                {createFormErrors.title ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{createFormErrors.title.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Name *</span>
                <input
                  {...register("brideName")}
                  placeholder="Bride full name"
                  className="ui-input"
                />
                {createFormErrors.brideName ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{createFormErrors.brideName.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Name *</span>
                <input
                  {...register("groomName")}
                  placeholder="Groom full name"
                  className="ui-input"
                />
                {createFormErrors.groomName ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{createFormErrors.groomName.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Phone *</span>
                <Controller
                  control={control}
                  name="bridePhone"
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? "")}
                      placeholder="+2519..."
                      defaultCountry="ET"
                      className="w-full"
                      required
                    />
                  )}
                />
                {createFormErrors.bridePhone ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{createFormErrors.bridePhone.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Phone *</span>
                <Controller
                  control={control}
                  name="groomPhone"
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? "")}
                      placeholder="+2519..."
                      defaultCountry="ET"
                      className="w-full"
                      required
                    />
                  )}
                />
                {createFormErrors.groomPhone ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{createFormErrors.groomPhone.message}</p> : null}
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
                      {...register("eventDate")}
                      min={minEventDate}
                      className="ui-input"
                    />
                    {createFormErrors.eventDate ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{createFormErrors.eventDate.message}</p> : null}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Time</span>
                    <input
                      type="time"
                      {...register("eventTime")}
                      className="ui-input"
                    />
                    {createFormErrors.eventTime ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{createFormErrors.eventTime.message}</p> : null}
                  </label>
                </div>

                <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {eventDateTimePreview ? `Scheduled for ${eventDateTimePreview}` : "Pick a date and time for the event invitation."}
                </p>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Location</span>
                <input
                  {...register("location")}
                  placeholder="Venue and city"
                  className="ui-input"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Google Map Address</span>
                <input
                  {...register("googleMapAddress")}
                  placeholder="https://maps.google.com/... or share address"
                  className="ui-input"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Description</span>
              <textarea
                {...register("description")}
                placeholder="Short event description"
                className="ui-textarea"
              />
            </label>

            {createError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{createError}</p> : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateError(null);
                }}
                className="ui-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ui-button-primary"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
          </div>
        </div>
      ) : null}

      {createdEvent ? (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 transition-opacity duration-200 ${isConfirmVisible ? "opacity-100" : "opacity-0"}`}
        >
          <div
            className={`w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl transition-all duration-200 ${isConfirmVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-95"}`}
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center" style={{ color: "var(--success)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="m8.5 12.5 2.4 2.4L15.8 10" />
              </svg>
            </div>

            <h3 className="mt-4 text-center text-xl font-semibold" style={{ color: "var(--primary)" }}>Event Created</h3>
            <p className="mt-2 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              {createdEvent.title} has been created successfully.
            </p>
            <p className="mt-1 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
              {formatEventDate(createdEvent.eventDate)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCreatedEvent(null)}
                className="ui-button-secondary"
              >
                Stay Here
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/studio/events/${createdEvent.id}`);
                  setCreatedEvent(null);
                }}
                className="ui-button-primary"
              >
                Go to Detail
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-2 min-h-0 flex-1">
        {loading ? (
          <p className="text-sm text-zinc-600">Loading events...</p>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : (
          <div className="ui-table mt-0 rounded-lg flex h-full min-h-0 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-auto md:hidden">
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                {events.map((event) => {
                  const totalGuests = event._count.guests;
                  const status = resolveStatus(event);

                  return (
                    <article
                      key={event.id}
                      className="cursor-pointer rounded-lg border p-3 transition hover:-translate-y-px hover:bg-zinc-50"
                      style={{ borderColor: "var(--border-subtle)" }}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/studio/events/${event.id}`)}
                      onKeyDown={(keyboardEvent) => {
                        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                          keyboardEvent.preventDefault();
                          router.push(`/studio/events/${event.id}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-800">{event.title}</p>
                          <p className="mt-1 truncate text-xs text-zinc-500">{event.location ?? "No location provided"}</p>
                        </div>
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(status)}`}>{statusLabel(status)}</span>
                      </div>

                      <div className="mt-3 text-sm text-zinc-600">
                        <p>{[event.brideName, event.groomName].filter(Boolean).join(" & ") || "Pending names"}</p>
                        <p className="mt-1 text-xs text-zinc-500">{event.bridePhone || "-"} | {event.groomPhone || "-"}</p>
                        <p className="mt-2">{formatEventDate(event.eventDate)}</p>
                        <p className="mt-1">{totalGuests} guests · {event._count.media} media</p>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={`/studio/events/${event.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-px"
                          style={{
                            borderColor: "var(--border-subtle)",
                            color: "var(--primary)",
                            background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)",
                          }}
                          aria-label={`View details for ${event.title}`}
                          onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3.5 w-3.5" aria-hidden>
                            <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6z" />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                          <span>Detail</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 hidden flex-1 overflow-auto md:block">
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
                  <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Event</th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Couple</th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Date</th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Guests</th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Media</th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Status</th>
                  <th className="sticky top-0 z-10 px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const totalGuests = event._count.guests;
                    const status = resolveStatus(event);

                    return (
                      <tr
                        key={event.id}
                        className="cursor-pointer border-t align-middle transition hover:bg-zinc-50"
                        style={{ borderColor: "var(--border-subtle)" }}
                        onClick={() => router.push(`/studio/events/${event.id}`)}
                      >
                        <td className="px-4 py-3">
                          <p className="truncate font-medium text-zinc-800">{event.title}</p>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {event.location ?? "No location provided"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 text-zinc-600">{formatEventDate(event.eventDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <p className="font-medium text-zinc-700">{totalGuests}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-700">{event._count.media}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(status)}`}>{statusLabel(status)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/studio/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-px"
                            style={{
                              borderColor: "var(--border-subtle)",
                              color: "var(--primary)",
                              background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)",
                            }}
                            aria-label={`View details for ${event.title}`}
                            onClick={(mouseEvent) => mouseEvent.stopPropagation()}
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
      </div>
    </main>
  );
}
