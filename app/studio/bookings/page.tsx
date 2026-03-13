"use client";

import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type BookingStatus = "NEW" | "HANDLED" | "CANCELLED";
type BookingFilter = "all" | "new" | "handled" | "cancelled";

type BookingRequestItem = {
  id: string;
  name: string;
  phone: string;
  weddingDate: string;
  weddingPlace: string;
  status: BookingStatus;
  handledEventId: string | null;
  handledEvent: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
};

type BookingResponse = {
  bookings: BookingRequestItem[];
  stats: {
    total: number;
    new: number;
    handled: number;
    cancelled: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

type ActionResponse = {
  error?: string;
  event?: {
    id: string;
    title: string;
  };
};

function SkeletonBar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200/70 ${className}`} />;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatWeddingDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: BookingStatus) {
  if (status === "HANDLED") return "Handled";
  if (status === "CANCELLED") return "Cancelled";
  return "New";
}

function statusClasses(status: BookingStatus) {
  if (status === "HANDLED") return "border-sky-300 bg-sky-50 text-sky-800";
  if (status === "CANCELLED") return "border-red-300 bg-red-50 text-red-700";
  return "border-amber-300 bg-amber-50 text-amber-800";
}

export default function StudioBookingsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingRequestItem[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, handled: 0, cancelled: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BookingFilter>("all");

  const hasActiveFilters = search.trim().length > 0 || filter !== "all";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadBookings() {
      if (hasLoadedOnce) {
        setTableLoading(true);
      } else {
        setInitialLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          filter,
        });

        if (search.trim().length > 0) {
          params.set("search", search.trim());
        }

        const response = await fetch(`/api/studio/bookings?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load booking requests");
        }

        const payload = (await response.json()) as BookingResponse;

        if (!cancelled) {
          setBookings(payload.bookings ?? []);
          setStats(payload.stats ?? { total: 0, new: 0, handled: 0, cancelled: 0 });
          setTotalPages(payload.pagination?.totalPages ?? 1);
          setTotalItems(payload.pagination?.total ?? 0);
          setHasLoadedOnce(true);
        }
      } catch {
        if (!cancelled) {
          setBookings([]);
          setTotalItems(0);
          setTotalPages(1);
          setHasLoadedOnce(true);
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          setTableLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [filter, hasLoadedOnce, page, pageSize, search, status]);

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  async function handleRowAction(bookingId: string, action: "accept" | "cancel") {
    setLoadingActionId(bookingId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/studio/bookings/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      const payload = (await response.json().catch(() => null)) as ActionResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to apply booking action.");
      }

      if (action === "accept") {
        setActionSuccess(payload?.event?.title ? `${payload.event.title} was created and the booking was marked as handled.` : "Booking converted to event.");
      } else {
        setActionSuccess("Booking marked as cancelled.");
      }

      setTableLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        filter,
      });

      if (search.trim().length > 0) {
        params.set("search", search.trim());
      }

      const refreshResponse = await fetch(`/api/studio/bookings?${params.toString()}`, {
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        throw new Error("Updated, but failed to refresh booking list.");
      }

      const refreshedPayload = (await refreshResponse.json()) as BookingResponse;
      setBookings(refreshedPayload.bookings ?? []);
      setStats(refreshedPayload.stats ?? { total: 0, new: 0, handled: 0, cancelled: 0 });
      setTotalPages(refreshedPayload.pagination?.totalPages ?? 1);
      setTotalItems(refreshedPayload.pagination?.total ?? 0);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to apply booking action.");
    } finally {
      setTableLoading(false);
      setLoadingActionId(null);
    }
  }

  const disableActions = useMemo(() => loadingActionId !== null || tableLoading, [loadingActionId, tableLoading]);

  if (status === "loading" || status === "idle" || status === "unauthenticated") {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading booking requests...</p>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Total Requests</p>
          {initialLoading ? <SkeletonBar className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.total)}</p>}
        </article>
        <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>New</p>
          {initialLoading ? <SkeletonBar className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.new)}</p>}
        </article>
        <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Handled</p>
          {initialLoading ? <SkeletonBar className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.handled)}</p>}
        </article>
        <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Cancelled</p>
          {initialLoading ? <SkeletonBar className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.cancelled)}</p>}
        </article>
      </section>

      <section className="ui-page rounded-lg flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="ui-page-header block">
          <div className="mt-2 flex w-full flex-nowrap items-center gap-2 overflow-x-auto rounded-lg border px-2 py-1.5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            <div className="relative w-80 min-w-80 shrink-0">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or phone..."
                className="ui-input h-10 w-full rounded-lg pl-10"
              />
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value as BookingFilter);
                    setPage(1);
                  }}
                  className="ui-input h-10 min-w-44 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
                  aria-label="Filter bookings by status"
                >
                  <option value="all">All status</option>
                  <option value="new">New</option>
                  <option value="handled">Handled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
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

        {actionError ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}
        {actionSuccess ? <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{actionSuccess}</p> : null}

        <div className="mt-2 min-h-0 flex-1">
          {!initialLoading && !tableLoading && bookings.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No booking requests match your current filters.
              </p>
            </div>
          ) : (
            <div className="ui-table mt-0 rounded-lg flex h-full min-h-0 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="min-w-full table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[16%]" />
                    <col className="w-[16%]" />
                    <col className="w-[22%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                    <tr>
                      <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Name</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Phone Number</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Date</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Wedding Place</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 text-center font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Status</th>
                      <th className="sticky top-0 z-10 px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableLoading || initialLoading
                      ? Array.from({ length: 8 }).map((_, index) => (
                          <tr key={`booking-skeleton-${index}`} className="border-t align-middle" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                            <td className="px-4 py-3">
                              <SkeletonBar className="h-4 w-32" />
                              <SkeletonBar className="mt-2 h-3 w-24" />
                            </td>
                            <td className="px-4 py-3"><SkeletonBar className="h-4 w-24" /></td>
                            <td className="px-4 py-3"><SkeletonBar className="h-4 w-24" /></td>
                            <td className="px-4 py-3"><SkeletonBar className="h-4 w-40" /></td>
                            <td className="px-4 py-3 text-center"><SkeletonBar className="mx-auto h-6 w-20 rounded-full" /></td>
                            <td className="px-4 py-3 text-right"><SkeletonBar className="ml-auto h-8 w-28 rounded-lg" /></td>
                          </tr>
                        ))
                      : bookings.map((booking) => (
                          <tr key={booking.id} className="border-t align-middle" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-zinc-800">{booking.name}</p>
                              <p className="mt-1 text-xs text-zinc-500">Requested {formatCreatedAt(booking.createdAt)}</p>
                            </td>
                            <td className="px-4 py-3 text-zinc-600">{booking.phone}</td>
                            <td className="px-4 py-3 text-zinc-600">{formatWeddingDate(booking.weddingDate)}</td>
                            <td className="px-4 py-3">
                              <p className="truncate text-zinc-700">{booking.weddingPlace}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(booking.status)}`}>{statusLabel(booking.status)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {booking.status === "NEW" ? (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={disableActions}
                                    onClick={() => void handleRowAction(booking.id, "cancel")}
                                    className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{ borderColor: "#fecaca", background: "#fef2f2" }}
                                  >
                                    {loadingActionId === booking.id ? "..." : "Cancel"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={disableActions}
                                    onClick={() => void handleRowAction(booking.id, "accept")}
                                    className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-sky-800 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{ borderColor: "#bae6fd", background: "#f0f9ff" }}
                                  >
                                    {loadingActionId === booking.id ? "..." : "Create Event"}
                                  </button>
                                </div>
                              ) : booking.status === "HANDLED" && booking.handledEvent ? (
                                <Link
                                  href={`/studio/events/${booking.handledEvent.id}`}
                                  className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-px"
                                  style={{ borderColor: "var(--border-subtle)", color: "var(--primary)", background: "var(--surface-muted)" }}
                                >
                                  Open Event
                                </Link>
                              ) : (
                                <span className="text-xs text-zinc-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t px-4 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                <p>
                  Showing {startItem}-{endItem} of {totalItems}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || tableLoading}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                  >
                    Previous
                  </button>
                  <span className="px-1 text-xs">Page {page} / {Math.max(1, totalPages)}</span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages || tableLoading}
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
      </section>
    </main>
  );
}
