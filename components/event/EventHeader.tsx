"use client";

import { Button } from "@/components/ui/button";
import { EventStatusDropdown } from "./EventStatusDropdown";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

interface EventHeaderProps {
  title: string;
  eventTitle: string;
  status: EventStatus;
  eventDate: string;
  avatarUrl?: string;
  onEdit: () => void;
  editDisabled?: boolean;
  onStatusChange: (newStatus: EventStatus, cancellationReason?: string) => Promise<void>;
  onShare: () => void;
  onAvatarClick?: () => void;
}

export function EventHeader({
  title,
  eventTitle,
  status,
  eventDate,
  avatarUrl,
  onEdit,
  editDisabled = false,
  onStatusChange,
  onShare,
  onAvatarClick,
}: EventHeaderProps) {
  return (
    <div className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Avatar and Title section */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <button
            onClick={onAvatarClick}
            type="button"
            className="flex-shrink-0 rounded-xl overflow-hidden transition hover:opacity-80"
            style={{ width: "96px", height: "96px", background: "var(--surface-muted)", border: `1px solid var(--border-subtle)` }}
            aria-label="Upload event avatar"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-tertiary)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </button>

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
          <Button
            onClick={onEdit}
            disabled={editDisabled}
            className="flex-1 sm:flex-none disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "var(--primary)", color: "white" }}
          >
            Edit Event
          </Button>
        </div>
      </div>
    </div>
  );
}
