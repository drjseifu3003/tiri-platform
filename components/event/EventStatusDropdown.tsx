"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { EventStatusBadge } from "./EventStatusBadge";
import { StatusChangeConfirmDialog } from "./StatusChangeConfirmDialog";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

interface EventStatusDropdownProps {
  currentStatus: EventStatus;
  eventTitle: string;
  eventDate: string;
  onStatusChange: (newStatus: EventStatus, cancellationReason?: string) => Promise<void>;
  disabled?: boolean;
}

const STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["LIVE", "CANCELLED"],
  LIVE: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
  CANCELLED: [],
  ARCHIVED: [],
};

function getStatusLabel(status: EventStatus) {
  const labels: Record<EventStatus, string> = {
    DRAFT: "Draft",
    SCHEDULED: "Scheduled",
    LIVE: "Go Live",
    COMPLETED: "Complete",
    CANCELLED: "Cancel",
    ARCHIVED: "Archived",
  };
  return labels[status];
}

export function EventStatusDropdown({
  currentStatus,
  eventTitle,
  eventDate,
  onStatusChange,
  disabled = false,
}: EventStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<EventStatus | null>(null);

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  async function handleStatusSelect(newStatus: EventStatus) {
    setIsOpen(false);
    setConfirmStatus(newStatus);
  }

  async function handleConfirmStatusChange(cancellationReason?: string) {
    if (confirmStatus) {
      try {
        await onStatusChange(confirmStatus, cancellationReason);
        setConfirmStatus(null);
      } catch (error) {
        console.error("Status change failed:", error);
        setConfirmStatus(null);
      }
    }
  }

  return (
    <>
      <Popover
        open={disabled ? false : isOpen}
        onOpenChange={(open) => {
          if (disabled) return;
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface)" }}
            aria-expanded={isOpen}
            aria-label="Change event status"
          >
            <EventStatusBadge status={currentStatus} eventDate={eventDate} />
            <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-56 p-1" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="px-2.5 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            Update Status
          </p>
          {availableTransitions.length > 0 ? (
            <div className="space-y-1">
              {availableTransitions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusSelect(status)}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface-muted)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span>{getStatusLabel(status)}</span>
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2.5 py-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              No status changes available.
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Confirmation Dialog */}
      <StatusChangeConfirmDialog
        isOpen={confirmStatus !== null}
        currentStatus={currentStatus}
        newStatus={confirmStatus || currentStatus}
        eventTitle={eventTitle}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => {
          setConfirmStatus(null);
        }}
      />
    </>
  );
}
