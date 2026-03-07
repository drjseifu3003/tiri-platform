"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EventStatusBadge } from "./EventStatusBadge";
import { StatusChangeConfirmDialog } from "./StatusChangeConfirmDialog";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

interface EventStatusDropdownProps {
  currentStatus: EventStatus;
  eventTitle: string;
  eventDate: string;
  onStatusChange: (newStatus: EventStatus) => Promise<void>;
}

const STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["SCHEDULED", "ARCHIVED"],
  SCHEDULED: ["LIVE", "CANCELLED", "ARCHIVED"],
  LIVE: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
};

function getStatusLabel(status: EventStatus) {
  const labels: Record<EventStatus, string> = {
    DRAFT: "Draft",
    SCHEDULED: "Scheduled",
    LIVE: "Go Live",
    COMPLETED: "Complete",
    CANCELLED: "Cancel",
    ARCHIVED: "Archive",
  };
  return labels[status];
}

export function EventStatusDropdown({
  currentStatus,
  eventTitle,
  eventDate,
  onStatusChange,
}: EventStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<EventStatus | null>(null);

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  async function handleStatusSelect(newStatus: EventStatus) {
    setIsOpen(false);
    setConfirmStatus(newStatus);
  }

  async function handleConfirmStatusChange() {
    if (confirmStatus) {
      try {
        await onStatusChange(confirmStatus);
        setConfirmStatus(null);
      } catch (error) {
        console.error("Status change failed:", error);
        setConfirmStatus(null);
      }
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          aria-expanded={isOpen}
          aria-label="Change event status"
        >
          <EventStatusBadge status={currentStatus} eventDate={eventDate} />
          <svg className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-tertiary)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border bg-white"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Status</p>
            </div>
            <div>
              {availableTransitions.length > 0 ? (
                availableTransitions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    className="w-full px-4 py-3 text-left text-sm transition"
                    style={{
                      color: "var(--text-primary)",
                      borderBottom: `1px solid var(--border-subtle)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--surface-muted)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span className="font-medium">{getStatusLabel(status)}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>No status changes available</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <StatusChangeConfirmDialog
        isOpen={confirmStatus !== null}
        currentStatus={currentStatus}
        newStatus={confirmStatus || currentStatus}
        eventTitle={eventTitle}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => {
          setConfirmStatus(null);
          setIsOpen(true);
        }}
      />
    </>
  );
}
