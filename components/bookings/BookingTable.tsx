import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookingRequestItem,
  formatCreatedAt,
  formatWeddingDate,
  statusClasses,
  statusLabel,
} from "@/components/bookings/types";

type BookingTableProps = {
  bookings: BookingRequestItem[];
  loading: boolean;
  disableActions: boolean;
  loadingActionId: string | null;
  page: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onCancel: (bookingId: string) => void;
  onAccept: (bookingId: string) => void;
};

function BookingTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <tr key={`booking-skeleton-${index}`} className="border-t align-middle" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
          </td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
          <td className="px-4 py-3 text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></td>
          <td className="px-4 py-3 text-right"><Skeleton className="ml-auto h-8 w-28 rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

function BookingMobileSkeletonCards() {
  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={`booking-mobile-skeleton-${index}`}
          className="rounded-lg border p-3"
          style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-40" />
          <Skeleton className="mt-4 h-3 w-24" />
          <Skeleton className="mt-1 h-4 w-36" />
          <Skeleton className="mt-4 h-6 w-20 rounded-full" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function BookingTable({
  bookings,
  loading,
  disableActions,
  loadingActionId,
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPreviousPage,
  onNextPage,
  onCancel,
  onAccept,
}: BookingTableProps) {
  function renderAction(booking: BookingRequestItem) {
    if (booking.status === "NEW") {
      return (
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            disabled={disableActions}
            onClick={() => onCancel(booking.id)}
            className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "#fecaca", background: "#fef2f2" }}
          >
            {loadingActionId === booking.id ? "..." : "Cancel"}
          </button>
          <button
            type="button"
            disabled={disableActions}
            onClick={() => onAccept(booking.id)}
            className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-sky-800 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "#bae6fd", background: "#f0f9ff" }}
          >
            {loadingActionId === booking.id ? "..." : "Create Event"}
          </button>
        </div>
      );
    }

    if (booking.status === "HANDLED" && booking.handledEvent) {
      return (
        <Link
          href={`/studio/events/${booking.handledEvent.id}`}
          className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-px"
          style={{ borderColor: "var(--border-subtle)", color: "var(--primary)", background: "var(--surface-muted)" }}
        >
          Open Event
        </Link>
      );
    }

    return <span className="text-xs text-zinc-500">-</span>;
  }

  if (!loading && bookings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No booking requests match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="ui-table mt-0 rounded-lg flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-auto md:hidden">
        {loading ? (
          <BookingMobileSkeletonCards />
        ) : (
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-800">{booking.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">Requested {formatCreatedAt(booking.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(booking.status)}`}>
                    {statusLabel(booking.status)}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm text-zinc-600">
                  <p>
                    <span className="text-xs uppercase tracking-wide text-zinc-500">Phone</span>
                    <span className="ml-2">{booking.phone}</span>
                  </p>
                  <p>
                    <span className="text-xs uppercase tracking-wide text-zinc-500">Date</span>
                    <span className="ml-2">{formatWeddingDate(booking.weddingDate)}</span>
                  </p>
                  <p>
                    <span className="text-xs uppercase tracking-wide text-zinc-500">Wedding Place</span>
                    <span className="ml-2">{booking.weddingPlace}</span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">{renderAction(booking)}</div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 hidden flex-1 overflow-auto md:block">
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
            {loading ? (
              <BookingTableSkeletonRows />
            ) : (
              bookings.map((booking) => (
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
                  <td className="px-4 py-3 text-right">{renderAction(booking)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
        {loading ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <p>
            Showing {startItem}-{endItem} of {totalItems}
          </p>
        )}

        <div className="flex items-center gap-2">
          {loading ? (
            <>
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onPreviousPage}
                disabled={page <= 1}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                Previous
              </button>
              <span className="px-1 text-xs">Page {page} / {Math.max(1, totalPages)}</span>
              <button
                type="button"
                onClick={onNextPage}
                disabled={page >= totalPages}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
