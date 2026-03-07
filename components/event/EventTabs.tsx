"use client";

type EventTab = "overview" | "guests" | "media" | "gifts";

interface EventTabsProps {
  activeTab: EventTab;
  onTabChange: (tab: EventTab) => void;
  guestCount?: number;
  mediaCount?: number;
}

const TABS = [
  { id: "overview" as EventTab, label: "Overview" },
  { id: "guests" as EventTab, label: "Guests" },
  { id: "media" as EventTab, label: "Media" },
  { id: "gifts" as EventTab, label: "Gifts" },
];

export function EventTabs({ activeTab, onTabChange, guestCount = 0, mediaCount = 0 }: EventTabsProps) {
  function getTabLabel(tab: EventTab): string {
    if (tab === "guests") return `Guests${guestCount > 0 ? ` (${guestCount})` : ""}`;
    if (tab === "media") return `Media${mediaCount > 0 ? ` (${mediaCount})` : ""}`;
    return TABS.find((t) => t.id === tab)?.label || "";
  }

  return (
    <div
      className="inline-flex flex-wrap gap-1.5 rounded-lg border p-2"
      style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "bg-white shadow-sm text-slate-900"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
          style={
            activeTab === tab.id ? { borderColor: "var(--border-subtle)" } : {}
          }
        >
          {getTabLabel(tab.id)}
        </button>
      ))}
    </div>
  );
}
