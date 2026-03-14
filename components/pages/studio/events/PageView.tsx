"use client";

import { useCreateStudioEventMutation, useLazyGetStudioEventsQuery } from "@/lib/api/studio-api";
import { getApiErrorMessage } from "@/lib/api/base-api";
import { useSession } from "@/lib/session-context";
import { CreateEventDialog } from "@/components/pages/studio/events/components/CreateEventDialog";
import { CreatedEventDialog } from "@/components/pages/studio/events/components/CreatedEventDialog";
import { EventsTable } from "@/components/pages/studio/events/components/EventsTable";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
  const [fetchStudioEvents] = useLazyGetStudioEventsQuery();
  const [createStudioEvent] = useCreateStudioEventMutation();

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

    const result = await fetchStudioEvents(
      {
        page,
        pageSize,
        filter: quickFilter,
        dateFilter,
        search: search.trim().length > 0 ? search.trim() : undefined,
        dateFrom: dateFilter === "custom" ? dateFrom.trim() || undefined : undefined,
        dateTo: dateFilter === "custom" ? dateTo.trim() || undefined : undefined,
      },
      false
    );

    if ("error" in result) {
      setError(getApiErrorMessage(result.error, "Unable to load events"));
      setLoading(false);
      return;
    }

    const eventsJson = result.data as EventsResponse;
      const serverTotalPages = Math.max(1, eventsJson.pagination?.totalPages ?? 1);

    if (page > serverTotalPages) {
      setPage(serverTotalPages);
      setLoading(false);
      return;
    }

    setEvents(eventsJson.events ?? []);
    setCheckedInByEvent(eventsJson.checkedInByEvent ?? {});
    setTotalItems(eventsJson.pagination?.total ?? 0);
    setTotalPages(serverTotalPages);
    setHasPrevPage(eventsJson.pagination?.hasPrev ?? false);
    setHasNextPage(eventsJson.pagination?.hasNext ?? false);
    setLoading(false);
  }, [fetchStudioEvents, page, pageSize, quickFilter, search, dateFilter, dateFrom, dateTo]);

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

    const result = await createStudioEvent({
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
    });

    if ("error" in result) {
      setCreateError(getApiErrorMessage(result.error, "Unable to create event. Please try again."));
      return;
    }

    const payload = result.data as { event?: CreatedEventSummary };
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

      <CreateEventDialog
        isOpen={isCreateOpen}
        createError={createError}
        isSubmitting={isSubmitting}
        minEventDate={minEventDate}
        eventDateTimePreview={eventDateTimePreview}
        register={register}
        control={control}
        errors={createFormErrors}
        handleSubmit={handleSubmit}
        onSubmit={handleCreateEventSubmit}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateError(null);
        }}
      />

      <CreatedEventDialog
        createdEvent={createdEvent}
        isConfirmVisible={isConfirmVisible}
        formatEventDate={formatEventDate}
        onClose={() => setCreatedEvent(null)}
        onGoToDetail={(eventId) => {
          router.push(`/studio/events/${eventId}`);
          setCreatedEvent(null);
        }}
      />

      <div className="mt-2 min-h-0 flex-1">
        <EventsTable
          loading={loading}
          error={error}
          events={events}
          startItem={startItem}
          endItem={endItem}
          totalItems={totalItems}
          page={page}
          totalPages={totalPages}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
          onNextPage={() => setPage((current) => current + 1)}
          onOpenEvent={(eventId) => router.push(`/studio/events/${eventId}`)}
          resolveStatus={resolveStatus}
          statusClasses={statusClasses}
          statusLabel={statusLabel}
          formatEventDate={formatEventDate}
          initialsForCouple={initialsForCouple}
        />
      </div>
    </main>
  );
}
