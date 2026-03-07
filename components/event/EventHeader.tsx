"use client";

import { Button } from "@/components/ui/button";
import { EventStatusDropdown } from "./EventStatusDropdown";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

interface EventHeaderProps {
  title: string;
  eventTitle: string;
  status: EventStatus;
  eventDate: string;
  onEdit: () => void;
  onStatusChange: (newStatus: EventStatus) => Promise<void>;
  onShare: () => void;
}

export function EventHeader({
  title,
  eventTitle,
  status,
  eventDate,
  onEdit,
  onStatusChange,
  onShare,
}: EventHeaderProps) {
  return (
    <div
      className="rounded-2xl border p-5 sm:p-6 transition-all"
      style={{
        borderColor: "var(--border-subtle)",
        background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)",
      }}
    >
      <div className="flex flex-col gap-5">
        {/* Title and breadcrumb */}
        <div className="flex flex-col gap-2">
          <nav className="text-xs tracking-wide text-slate-500 uppercase">
            <a href="/studio/events" className="hover:text-slate-700 transition">
              Events
            </a>
            <span className="mx-2">/</span>
            <span className="text-slate-700">{title}</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
          <EventStatusDropdown
            currentStatus={status}
            eventTitle={eventTitle}
            eventDate={eventDate}
            onStatusChange={onStatusChange}
          />
          <Button variant="outline" onClick={onShare}>
            Share Event
          </Button>
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
            Edit Event
          </Button>
        </div>
      </div>
    </div>
  );
}
