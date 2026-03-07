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
    <div className="flex gap-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="py-3 text-sm font-medium transition-colors relative"
            style={{
              color: isActive ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: isActive ? `2px solid var(--primary)` : `2px solid transparent`,
              marginBottom: `-2px`,
            }}
          >
            {getTabLabel(tab.id)}
          </button>
        );
      })}
    </div>
  );
}
