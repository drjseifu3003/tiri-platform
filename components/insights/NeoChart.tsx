"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type NeoBarDatum = {
  label: string;
  value: number;
};

type NeoBarChartProps = {
  data: NeoBarDatum[];
  tone?: "primary" | "accent";
  maxHeight?: number;
  xAxisLabel?: string;
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

function chartPalette(tone: "primary" | "accent") {
  if (tone === "accent") {
    return {
      stroke: "var(--secondary)",
      fillTop: "var(--secondary)",
      grid: "color-mix(in srgb, var(--secondary-light) 55%, #d4e3ef)",
      tooltipBg: "var(--surface)",
      tooltipBorder: "var(--border-subtle)",
    };
  }

  return {
    stroke: "var(--primary)",
    fillTop: "var(--primary)",
    grid: "color-mix(in srgb, var(--primary-light) 45%, #d4e3ef)",
    tooltipBg: "var(--surface)",
    tooltipBorder: "var(--border-subtle)",
  };
}

const brandPieColors = [
  "var(--primary)",
  "var(--secondary)",
  "var(--primary-light)",
  "var(--secondary-light)",
  "#f59e0b",
  "#14b8a6",
  "#ef4444",
  "#6366f1",
];

export function NeoBarChart({ data, tone = "primary", maxHeight = 170, xAxisLabel = "Month Of Year" }: NeoBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        No chart data available.
      </div>
    );
  }

  const stagePeak = Math.max(...data.map((item) => item.value), 0);
  const palette = chartPalette(tone);
  const yAxisMax = Math.max(5, stagePeak + 2);
  const yStep = Math.max(1, Math.ceil(yAxisMax / 5));
  const yTicks = Array.from({ length: 6 }, (_, index) => Math.min(yAxisMax, index * yStep));

  const chartData = useMemo(() => {
    return data.map((item) => ({ ...item }));
  }, [data]);

  return (
    <div className="h-full w-full" style={{ minHeight: Math.max(220, maxHeight) }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 6, left: 6, bottom: 24 }}>
          <defs>
            <linearGradient id={`stageFill-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.fillTop} stopOpacity={0.6} />
              <stop offset="100%" stopColor={palette.fillTop} stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.grid} vertical={false} horizontal />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6f7e8a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{ value: xAxisLabel, position: "insideBottom", offset: -8, fill: "#7d8b97", fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: "#6f7e8a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, yAxisMax]}
            ticks={yTicks}
            label={{ value: "Number Of Events", angle: -90, position: "insideLeft", fill: "#7d8b97", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => formatCompact(Number(value))}
            contentStyle={{
              backgroundColor: palette.tooltipBg,
              border: `1px solid ${palette.tooltipBorder}`,
              borderRadius: "10px",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={palette.stroke}
            strokeWidth={3}
            fill={`url(#stageFill-${tone})`}
            dot={{ r: 5, strokeWidth: 3, fill: palette.stroke, stroke: "#ffffff" }}
            activeDot={{ r: 7, strokeWidth: 4, fill: palette.stroke, stroke: "#ffffff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
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

  const ranked = [...segments]
    .sort((a, b) => b.value - a.value)
    .map((segment, index) => ({
      ...segment,
      brandColor: brandPieColors[index % brandPieColors.length],
    }));
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5">
      <div className="relative h-72 w-full max-w-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ranked}
              dataKey="value"
              nameKey="label"
              innerRadius={84}
              outerRadius={124}
              paddingAngle={1}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              label={false}
              labelLine={false}
            >
              {ranked.map((entry) => (
                <Cell key={entry.label} fill={entry.brandColor} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCompact(Number(value))}
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>{centerLabel}</p>
          <p className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>{centerValue}</p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        {ranked.map((segment) => {
          return (
            <span key={segment.label} className="inline-flex w-auto items-center gap-2 rounded-full border px-3 py-1.5 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.brandColor }} />
              {segment.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
