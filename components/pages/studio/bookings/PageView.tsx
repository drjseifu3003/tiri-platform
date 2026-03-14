"use client";

import { BookingFiltersBar } from "@/components/bookings/BookingFiltersBar";
import { BookingStatsCards } from "@/components/bookings/BookingStatsCards";
import { BookingTable } from "@/components/bookings/BookingTable";
import { ActionResponse, BookingFilter, BookingRequestItem, BookingResponse } from "@/components/bookings/types";
import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
      <main className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col gap-6">
        <BookingStatsCards stats={stats} loading />
        <section className="ui-page rounded-lg flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <div className="ui-page-header block">
            <BookingFiltersBar
              search=""
              filter="all"
              hasActiveFilters={false}
              loading
              onSearchChange={() => undefined}
              onFilterChange={() => undefined}
              onReset={() => undefined}
            />
          </div>
          <div className="mt-2 min-h-0 flex-1">
            <BookingTable
              bookings={[]}
              loading
              disableActions
              loadingActionId={null}
              page={1}
              totalPages={1}
              totalItems={0}
              startItem={0}
              endItem={0}
              onPreviousPage={() => undefined}
              onNextPage={() => undefined}
              onCancel={() => undefined}
              onAccept={() => undefined}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col gap-6">
      <BookingStatsCards stats={stats} loading={initialLoading} />

      <section className="ui-page rounded-lg flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="ui-page-header block">
          <BookingFiltersBar
            search={search}
            filter={filter}
            hasActiveFilters={hasActiveFilters}
            loading={initialLoading}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onFilterChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
            onReset={() => {
              setSearch("");
              setFilter("all");
              setPage(1);
            }}
          />
        </div>

        {actionError ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}
        {actionSuccess ? <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{actionSuccess}</p> : null}

        <div className="mt-2 min-h-0 flex-1">
          <BookingTable
            bookings={bookings}
            loading={tableLoading || initialLoading}
            disableActions={disableActions}
            loadingActionId={loadingActionId}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
            onNextPage={() => setPage((current) => Math.min(totalPages, current + 1))}
            onCancel={(bookingId) => void handleRowAction(bookingId, "cancel")}
            onAccept={(bookingId) => void handleRowAction(bookingId, "accept")}
          />
        </div>
      </section>
    </main>
  );
}

