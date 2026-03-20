"use client";

type EventTab = "overview" | "invitation";

interface EventTabsProps {
  activeTab: EventTab;
  onTabChange: (tab: EventTab) => void;
}

const TABS = [
  { id: "overview" as EventTab, label: "Overview" },
  { id: "invitation" as EventTab, label: "Invitation" },
];

export function EventTabs({ activeTab, onTabChange }: EventTabsProps) {
  function getTabLabel(tab: EventTab): string {
    if (tab === "invitation") return "Invitation";
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
