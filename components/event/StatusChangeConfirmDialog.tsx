"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

interface StatusChangeConfirmDialogProps {
  isOpen: boolean;
  currentStatus: EventStatus;
  newStatus: EventStatus;
  onConfirm: (cancellationReason?: string) => Promise<void>;
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
  const [cancellationReason, setCancellationReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const requiresReason = newStatus === "CANCELLED";

  const content = getConfirmationContent(currentStatus, newStatus, eventTitle);

  useEffect(() => {
    if (!isOpen) return;
    setCancellationReason("");
    setReasonError(null);
  }, [isOpen, newStatus]);

  async function handleConfirm() {
    const trimmedReason = cancellationReason.trim();

    if (requiresReason && trimmedReason.length < 5) {
      setReasonError("Please provide a cancellation reason (at least 5 characters).");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(requiresReason ? trimmedReason : undefined);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-5">
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {content.title}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Review this action before continuing.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {content.message}
          </p>

          {requiresReason ? (
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Cancellation Reason
              </label>
              <textarea
                value={cancellationReason}
                onChange={(event) => {
                  setCancellationReason(event.target.value);
                  if (reasonError) setReasonError(null);
                }}
                className="ui-textarea"
                placeholder="Briefly explain why this event is being cancelled"
                rows={3}
                maxLength={500}
              />
              {reasonError ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{reasonError}</p> : null}
            </div>
          ) : null}

          {content.warning && (
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "#f6d28b", background: "#fff7e6", color: "#9a6b13" }}>
              <div className="flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--warning)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">
                {content.warning}
              </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="ui-button-secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="ui-button-primary">
            {isLoading ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
