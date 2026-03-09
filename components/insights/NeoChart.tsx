"use client";

type NeoBarDatum = {
  label: string;
  value: number;
};

type NeoBarChartProps = {
  data: NeoBarDatum[];
  tone?: "primary" | "accent";
  maxHeight?: number;
};

type NeoDonutSegment = {
  label: string;
  value: number;
  color: string;
};

type NeoDonutChartProps = {
  segments: NeoDonutSegment[];
  centerLabel: string;
  centerValue: string;
};

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number) {
  if (value <= 0) return "0%";
  if (value < 0.1) return "<1%";
  return `${Math.round(value)}%`;
}

function normalizedAxisMax(peak: number) {
  if (peak <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  return Math.ceil(peak / magnitude) * magnitude;
}

function barGradient(tone: "primary" | "accent") {
  if (tone === "accent") {
    return "linear-gradient(180deg, #5ba8b8 0%, #1f6f7f 100%)";
  }
  return "linear-gradient(180deg, #a0365c 0%, #5f123f 100%)";
}

export function NeoBarChart({ data, tone = "primary", maxHeight = 170 }: NeoBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
        <div className="rounded-xl border px-4 py-10 text-center text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}>
          No chart data available.
        </div>
      </div>
    );
  }

  const peak = Math.max(1, ...data.map((item) => item.value));
  const axisMax = normalizedAxisMax(peak);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const peakPoint = data.reduce((top, current) => (current.value > top.value ? current : top), data[0]);
  const ticks = [0, 25, 50, 75, 100].map((ratio) => ({
    ratio,
    value: Math.round((axisMax * ratio) / 100),
  }));

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Total: <span className="font-semibold" style={{ color: "var(--primary)" }}>{formatCompact(total)}</span>
        </div>
        <div className="rounded-full border px-2.5 py-1 text-[11px]" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}>
          Peak {peakPoint.label}: <span className="font-semibold" style={{ color: "var(--primary)" }}>{formatCompact(peakPoint.value)}</span>
        </div>
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="relative flex">
          <div className="mr-2 flex h-56 w-10 flex-col justify-between pb-5 pt-1 text-right text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {ticks.toReversed().map((tick) => (
              <span key={tick.ratio}>{formatCompact(tick.value)}</span>
            ))}
          </div>

          <div className="relative flex h-56 flex-1 items-end gap-2 pb-5">
            {ticks.map((tick) => (
              <div
                key={tick.ratio}
                className="pointer-events-none absolute left-0 right-0 border-t"
                style={{
                  bottom: `calc(20px + ${(tick.ratio / 100) * maxHeight}px)`,
                  borderColor: "rgba(111, 74, 93, 0.14)",
                }}
              />
            ))}

            {data.map((item) => {
              const height = Math.max(8, Math.round((item.value / axisMax) * maxHeight));

              return (
                <div key={item.label} className="group relative flex min-w-0 flex-1 flex-col items-center justify-end" title={`${item.label}: ${item.value}`}>
                  <span className="mb-1 text-[10px] font-medium opacity-0 transition group-hover:opacity-100" style={{ color: "var(--text-secondary)" }}>
                    {formatCompact(item.value)}
                  </span>
                  <div
                    className="w-full rounded-md transition duration-200 group-hover:-translate-y-0.5"
                    style={{
                      height,
                      background: barGradient(tone),
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 14px rgba(95, 18, 63, 0.12)",
                    }}
                  />
                  <span className="absolute -bottom-4 max-w-full truncate text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NeoDonutChart({ segments, centerLabel, centerValue }: NeoDonutChartProps) {
  if (segments.length === 0) {
    return (
      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
        <div className="rounded-xl border px-4 py-10 text-center text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }}>
          No chart data available.
        </div>
      </div>
    );
  }

  const total = Math.max(1, segments.reduce((sum, segment) => sum + segment.value, 0));
  const ranked = [...segments].sort((a, b) => b.value - a.value);
  let cursor = 0;
  const ringStops = ranked.map((segment) => {
    const start = cursor;
    const ratio = segment.value / total;
    cursor += ratio;
    return `${segment.color} ${Math.round(start * 360)}deg ${Math.round(cursor * 360)}deg`;
  });

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
      <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="relative h-36 w-36 rounded-full" style={{ background: `conic-gradient(${ringStops.join(",")})`, boxShadow: "0 10px 20px rgba(95, 18, 63, 0.12)" }}>
          <div
            className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
          >
            <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
              {centerLabel}
            </span>
            <span className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
              {centerValue}
            </span>
          </div>
        </div>

        <div className="grid flex-1 gap-2">
          {ranked.map((segment) => {
            const percentage = (segment.value / total) * 100;

            return (
              <div key={segment.label} className="rounded-lg border p-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
                    {segment.label}
                  </span>
                  <span className="font-medium" style={{ color: "var(--primary)" }}>
                    {segment.value}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  <span>{formatPercent(percentage)}</span>
                  <span>{formatCompact(segment.value)} items</span>
                </div>

                <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--secondary-lighter)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${Math.max(5, Math.round(percentage))}%`, background: segment.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
