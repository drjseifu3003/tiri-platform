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
    <div className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title and breadcrumb */}
        <div className="flex flex-col gap-2">
          <nav className="text-xs tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            <a href="/studio/events" className="hover:opacity-80 transition" style={{ color: "var(--text-secondary)" }}>
              Events
            </a>
            <span className="mx-2">/</span>
            <span style={{ color: "var(--text-primary)" }}>{title}</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <EventStatusDropdown
            currentStatus={status}
            eventTitle={eventTitle}
            eventDate={eventDate}
            onStatusChange={onStatusChange}
          />
          <Button variant="outline" onClick={onShare} className="flex-1 sm:flex-none">
            Share Event
          </Button>
          <Button onClick={onEdit} className="flex-1 sm:flex-none" style={{ background: "var(--primary)", color: "white" }}>
            Edit Event
          </Button>
        </div>
      </div>
    </div>
  );
}
