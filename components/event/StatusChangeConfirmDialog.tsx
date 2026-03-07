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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border bg-white shadow-xl animate-in scale-in-95 duration-200"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {/* Header */}
        <div
          className="border-b px-6 py-5"
          style={{ borderColor: "var(--border-subtle)", background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)" }}
        >
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {content.title}
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {content.message}
          </p>

          {content.warning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-800 font-medium">{content.warning}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "var(--border-subtle)" }}>
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
                Updating...
              </span>
            ) : (
              "Confirm Change"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
