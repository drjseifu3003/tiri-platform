import { Skeleton } from "@/components/ui/skeleton";
import { MobileFilterSheet } from "@/components/ui/mobile-filter-sheet";
import { BookingFilter } from "@/components/bookings/types";

type BookingFiltersBarProps = {
  search: string;
  filter: BookingFilter;
  hasActiveFilters: boolean;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: BookingFilter) => void;
  onReset: () => void;
};

export function BookingFiltersBar({
  search,
  filter,
  hasActiveFilters,
  loading,
  onSearchChange,
  onFilterChange,
  onReset,
}: BookingFiltersBarProps) {
  const filterFields = (
    <>
      <div className="relative">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or phone..."
          className="ui-input h-10 w-full rounded-lg pl-10"
        />
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
          value={filter}
          onChange={(event) => onFilterChange(event.target.value as BookingFilter)}
          className="ui-input h-10 w-full appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
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
        onClick={onReset}
        disabled={!hasActiveFilters}
        title="Reset filters"
        className="inline-flex h-10 w-full items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}
      >
        Reset
      </button>
    </>
  );

  return (
    <>
      <div className="mt-2 md:hidden">
        {loading ? (
          <Skeleton className="h-10 w-28 rounded-lg" />
        ) : (
          <MobileFilterSheet title="Booking Filters" triggerLabel="Filters">
            {filterFields}
          </MobileFilterSheet>
        )}
      </div>

      <div className="mt-2 hidden w-full flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 md:flex" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
        {loading ? (
          <>
            <Skeleton className="h-10 w-80 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </>
        ) : (
          <>
            <div className="relative w-80">
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by name or phone..."
                className="ui-input h-10 w-full rounded-lg pl-10"
              />
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            <div className="relative min-w-44">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              <select
                value={filter}
                onChange={(event) => onFilterChange(event.target.value as BookingFilter)}
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
              onClick={onReset}
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
          </>
        )}
      </div>
    </>
  );
}
