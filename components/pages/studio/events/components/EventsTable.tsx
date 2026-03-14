import Link from "next/link";

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

type EventsTableProps = {
  loading: boolean;
  error: string | null;
  events: EventListItem[];
  startItem: number;
  endItem: number;
  totalItems: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenEvent: (eventId: string) => void;
  resolveStatus: (event: EventListItem) => "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  statusClasses: (status: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED") => string;
  statusLabel: (status: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED") => string;
  formatEventDate: (value: string) => string;
  initialsForCouple: (event: EventListItem) => string;
};

export function EventsTable({
  loading,
  error,
  events,
  startItem,
  endItem,
  totalItems,
  page,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  onOpenEvent,
  resolveStatus,
  statusClasses,
  statusLabel,
  formatEventDate,
  initialsForCouple,
}: EventsTableProps) {
  if (loading) {
    return <p className="text-sm text-zinc-600">Loading events...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
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
                onClick={() => onOpenEvent(event.id)}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    onOpenEvent(event.id);
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
                  onClick={() => onOpenEvent(event.id)}
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
            onClick={onPrevPage}
            disabled={!hasPrevPage || loading}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
          >
            Previous
          </button>
          <span className="px-1 text-xs">Page {page} / {Math.max(1, totalPages)}</span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!hasNextPage || loading}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
