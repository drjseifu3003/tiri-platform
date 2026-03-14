import { Skeleton } from "@/components/ui/skeleton";

type PageSkeletonProps = {
  cards?: number;
  rows?: number;
};

export function PageSkeleton({ cards = 4, rows = 6 }: PageSkeletonProps) {
  return (
    <main className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <article key={`card-${index}`} className="rounded-lg border p-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-20" />
          </article>
        ))}
      </section>

      <section className="ui-page rounded-lg flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="ui-page-header block">
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-10 w-80 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>

        <div className="mt-4 flex-1 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          {Array.from({ length: rows }).map((_, index) => (
            <div key={`row-${index}`} className="border-b py-3 last:border-b-0" style={{ borderColor: "var(--border-subtle)" }}>
              <Skeleton className="h-4 w-64" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
