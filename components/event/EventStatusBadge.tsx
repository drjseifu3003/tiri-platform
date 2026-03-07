"use client";

import { useMemo } from "react";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

interface EventStatusBadgeProps {
  status: EventStatus;
  eventDate?: string;
  completedAt?: string;
}

function formatCountdown(eventDate: string) {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function formatDuration(eventDate: string) {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = now.getTime() - event.getTime();

  if (diff < 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getStatusClasses(status: EventStatus) {
  switch (status) {
    case "LIVE":
      return "border-rose-300 bg-rose-50 text-rose-800";
    case "SCHEDULED":
      return "border-sky-300 bg-sky-50 text-sky-800";
    case "COMPLETED":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border-red-300 bg-red-50 text-red-700";
    case "ARCHIVED":
      return "border-zinc-300 bg-zinc-100 text-zinc-700";
    case "DRAFT":
      return "border-amber-300 bg-amber-50 text-amber-800";
    default:
      return "border-zinc-300 bg-zinc-100 text-zinc-700";
  }
}

function getStatusLabel(status: EventStatus) {
  switch (status) {
    case "LIVE":
      return "LIVE";
    case "SCHEDULED":
      return "Scheduled";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "ARCHIVED":
      return "Archived";
    case "DRAFT":
      return "Draft";
    default:
      return status;
  }
}

export function EventStatusBadge({ status, eventDate, completedAt }: EventStatusBadgeProps) {
  const content = useMemo(() => {
    if (status === "SCHEDULED" && eventDate) {
      const countdown = formatCountdown(eventDate);
      return countdown ? `Scheduled • ${countdown}` : "Scheduled";
    }

    if (status === "LIVE" && eventDate) {
      const duration = formatDuration(eventDate);
      return duration ? `LIVE • ${duration}` : "LIVE";
    }

    if (status === "COMPLETED" && completedAt) {
      const date = new Date(completedAt);
      return `Completed • ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }

    return getStatusLabel(status);
  }, [status, eventDate, completedAt]);

  return (
    <div
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusClasses(status)}`}
    >
      {content}
    </div>
  );
}
