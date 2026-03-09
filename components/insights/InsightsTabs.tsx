"use client";

import Link from "next/link";

type InsightsTab = "overview" | "anniversary";

type InsightsTabsProps = {
  activeTab: InsightsTab;
  anniversaryCount?: number;
};

export function InsightsTabs({ activeTab, anniversaryCount = 0 }: InsightsTabsProps) {
  return (
    <div className="flex gap-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      <Link
        href="/studio/insights"
        className="relative py-3 text-sm font-medium transition-colors"
        style={{
          color: activeTab === "overview" ? "var(--primary)" : "var(--text-secondary)",
          borderBottom: activeTab === "overview" ? "2px solid var(--primary)" : "2px solid transparent",
          marginBottom: "-2px",
        }}
      >
        Overview
      </Link>

      <Link
        href="/studio/insights/anniversary"
        className="relative py-3 text-sm font-medium transition-colors"
        style={{
          color: activeTab === "anniversary" ? "var(--primary)" : "var(--text-secondary)",
          borderBottom: activeTab === "anniversary" ? "2px solid var(--primary)" : "2px solid transparent",
          marginBottom: "-2px",
        }}
      >
        Anniversary{anniversaryCount > 0 ? ` (${anniversaryCount})` : ""}
      </Link>
    </div>
  );
}
