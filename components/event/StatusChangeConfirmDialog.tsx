"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

interface StatusChangeConfirmDialogProps {
  isOpen: boolean;
  currentStatus: EventStatus;
  newStatus: EventStatus;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  eventTitle?: string;
}

function getConfirmationContent(
  currentStatus: EventStatus,
  newStatus: EventStatus,
  eventTitle: string
) {
  const messages: Record<string, { title: string; message: string; warning?: string }> = {
    "SCHEDULED_LIVE": {
      title: "Go Live?",
      message: `Your event "${eventTitle}" will be marked as live. All guests will receive a notification that the event has started.`,
      warning: "This action will send notifications to all guests.",
    },
    "LIVE_COMPLETED": {
      title: "Mark as Completed?",
      message: `Your event "${eventTitle}" will be marked as completed. Guests will receive a completion notification.`,
      warning: "This action cannot be undone.",
    },
    "SCHEDULED_COMPLETED": {
      title: "Mark as Completed?",
      message: `Your event "${eventTitle}" will be marked as completed without going live. Guests will be notified.`,
      warning: "This action cannot be undone.",
    },
    "SCHEDULED_CANCELLED": {
      title: "Cancel Event?",
      message: `Cancelling "${eventTitle}" will notify all guests about the cancellation. This action cannot be undone.`,
      warning: "All guests will be notified immediately.",
    },
    "LIVE_CANCELLED": {
      title: "Cancel Live Event?",
      message: `Cancelling the live event "${eventTitle}" will notify all guests. This action cannot be undone.`,
      warning: "All guests will receive cancellation notice immediately.",
    },
    "DEFAULT": {
      title: `Change to ${newStatus}?`,
      message: `Are you sure you want to change the event status from ${currentStatus} to ${newStatus}?`,
    },
  };

  const key = `${currentStatus}_${newStatus}`;
  return messages[key] || messages["DEFAULT"];
}

export function StatusChangeConfirmDialog({
  isOpen,
  currentStatus,
  newStatus,
  onConfirm,
  onCancel,
  eventTitle = "this event",
}: StatusChangeConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const content = getConfirmationContent(currentStatus, newStatus, eventTitle);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-2xl border bg-white shadow-lg"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {/* Header */}
        <div
          className="border-b px-6 py-4"
          style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {content.title}
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          <p style={{ color: "var(--text-secondary)" }}>{content.message}</p>

          {content.warning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">{content.warning}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "var(--border-subtle)" }}>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
