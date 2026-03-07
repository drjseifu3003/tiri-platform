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
          className="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:border-slate-400"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <EventStatusBadge status={currentStatus} eventDate={eventDate} />
          <svg
            className={`h-4 w-4 transition text-slate-500 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 top-full z-40 mt-2 w-56 rounded-lg border bg-white shadow-xl"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="py-1.5">
              {availableTransitions.length > 0 ? (
                availableTransitions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    className="flex w-full items-center gap-3 rounded-none px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 border-l-2 border-l-transparent hover:border-l-blue-500"
                  >
                    <span className="font-medium text-slate-900">{getStatusLabel(status)}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-sm text-slate-500">No status changes available</div>
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
