"use client";

import { useMemo, useState } from "react";

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

function areaPalette(tone: "primary" | "accent") {
  if (tone === "accent") {
    return {
      stroke: "#5ba8b8",
      fillTop: "rgba(91, 168, 184, 0.34)",
      fillBottom: "rgba(91, 168, 184, 0.03)",
      dot: "#5ba8b8",
    };
  }
  return {
    stroke: "#a0365c",
    fillTop: "rgba(160, 54, 92, 0.28)",
    fillBottom: "rgba(160, 54, 92, 0.03)",
    dot: "#a0365c",
  };
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function NeoBarChart({ data, tone = "primary", maxHeight = 170 }: NeoBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        No chart data available.
      </div>
    );
  }

  const peak = Math.max(1, ...data.map((item) => item.value));
  const axisMax = normalizedAxisMax(peak);
  const palette = areaPalette(tone);

  const topPadding = 4;
  const bottomPadding = 16;
  const leftPadding = 44;
  const rightPadding = 12;
  const chartHeight = Math.max(160, maxHeight);
  const svgHeight = topPadding + chartHeight + bottomPadding;
  const svgWidth = 680;
  const plotWidth = svgWidth - leftPadding - rightPadding;
  const baselineY = topPadding + chartHeight;

  const points = useMemo(() => {
    if (data.length === 1) {
      return [
        {
          x: leftPadding + plotWidth / 2,
          y: topPadding + (1 - data[0].value / axisMax) * chartHeight,
        },
      ];
    }

    return data.map((item, index) => {
      const x = leftPadding + (index / (data.length - 1)) * plotWidth;
      const y = topPadding + (1 - item.value / axisMax) * chartHeight;
      return { x, y };
    });
  }, [axisMax, chartHeight, data, leftPadding, plotWidth, topPadding]);

  const linePath = buildLinePath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : "";

  const ticks = [0, 25, 50, 75, 100].map((ratio) => ({
    ratio,
    value: Math.round((axisMax * ratio) / 100),
  }));

  const activeIndex = hoveredIndex ?? data.length - 1;
  const activePoint = points[activeIndex];
  const activeItem = data[activeIndex];

  return (
    <div className="relative h-full w-full">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Trend chart">
            <defs>
              <linearGradient id={`neo-area-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.fillTop} />
                <stop offset="100%" stopColor={palette.fillBottom} />
              </linearGradient>
            </defs>

            {ticks.map((tick) => {
              const y = topPadding + (1 - tick.ratio / 100) * chartHeight;
              return (
                <g key={tick.ratio}>
                  <line x1={leftPadding} y1={y} x2={svgWidth - rightPadding} y2={y} stroke="rgba(125, 129, 144, 0.2)" strokeWidth="1" />
                  <text x={leftPadding - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">
                    {formatCompact(tick.value)}
                  </text>
                </g>
              );
            })}

            {areaPath ? <path d={areaPath} fill={`url(#neo-area-${tone})`} /> : null}
            {linePath ? <path d={linePath} fill="none" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}

            {points.map((point, index) => {
              const isActive = index === activeIndex;
              return (
                <g key={`${data[index].label}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 5 : 3}
                    fill={palette.dot}
                    stroke="#fff"
                    strokeWidth={isActive ? 2 : 1.5}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onFocus={() => setHoveredIndex(index)}
                  />
                </g>
              );
            })}

            {data.map((item, index) => {
              const point = points[index];
              return (
                <text key={`${item.label}-axis`} x={point.x} y={svgHeight - 8} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">
                  {item.label}
                </text>
              );
            })}
      </svg>

      {activePoint && activeItem ? (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border px-3 py-2 text-xs shadow-sm"
          style={{
            left: `${(activePoint.x / svgWidth) * 100}%`,
            top: `${(activePoint.y / svgHeight) * 100}%`,
            transform: "translate(-50%, -120%)",
            borderColor: "var(--border-subtle)",
            background: "var(--surface)",
          }}
        >
          <p style={{ color: "var(--text-tertiary)" }}>{activeItem.label}</p>
          <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
            {formatCompact(activeItem.value)}
          </p>
        </div>
      ) : null}

    </div>
  );
}

export function NeoDonutChart({ segments, centerLabel, centerValue }: NeoDonutChartProps) {
  if (segments.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        No chart data available.
      </div>
    );
  }

  const total = Math.max(1, segments.reduce((sum, segment) => sum + segment.value, 0));
  const ranked = [...segments].sort((a, b) => b.value - a.value);
  let cursorDeg = 0;
  const gapDeg = 2;
  const ringStops = ranked.map((segment) => {
    const sweepDeg = (segment.value / total) * 360;
    const safeGap = Math.min(gapDeg, sweepDeg * 0.3);
    const start = cursorDeg + safeGap / 2;
    const end = cursorDeg + sweepDeg - safeGap / 2;
    const color = segment.color;
    cursorDeg += sweepDeg;
    return `${color} ${Math.round(start)}deg ${Math.round(end)}deg`;
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 lg:flex-row lg:items-center">
      <div
        className="relative h-48 w-48 rounded-full"
        style={{
          background: `conic-gradient(${ringStops.join(",")})`,
          boxShadow: "0 12px 24px rgba(111, 74, 93, 0.16)",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
          style={{ background: "var(--surface)", boxShadow: "inset 0 0 0 1px rgba(111,74,93,0.12)" }}
        >
          <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
            {centerLabel}
          </span>
          <span className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
            {centerValue}
          </span>
        </div>
      </div>

      <div className="grid w-full max-w-xs gap-2">
        {ranked.map((segment) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div key={segment.label} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: "var(--surface-muted)" }}>
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
                {segment.label}
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                {formatPercent(percentage)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
