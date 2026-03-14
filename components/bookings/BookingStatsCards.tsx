import { Skeleton } from "@/components/ui/skeleton";
import { BookingStats, formatCount } from "@/components/bookings/types";

type BookingStatsCardsProps = {
  stats: BookingStats;
  loading: boolean;
};

export function BookingStatsCards({ stats, loading }: BookingStatsCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Total Requests</p>
        {loading ? <Skeleton className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.total)}</p>}
      </article>
      <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>New</p>
        {loading ? <Skeleton className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.new)}</p>}
      </article>
      <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Handled</p>
        {loading ? <Skeleton className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.handled)}</p>}
      </article>
      <article className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Cancelled</p>
        {loading ? <Skeleton className="mt-3 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--primary)" }}>{formatCount(stats.cancelled)}</p>}
      </article>
    </section>
  );
}