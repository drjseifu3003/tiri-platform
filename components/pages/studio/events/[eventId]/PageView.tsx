"use client";

import { InvitationTab } from "@/components/event/InvitationTab";
import { getApiErrorMessage } from "@/lib/api/base-api";
import {
  useDeleteInvitationCardMutation,
  useGetStudioEventDetailQuery,
  useUpdateStudioEventMutation,
  useUploadEventAvatarMutation,
  useUploadInvitationCardMutation,
} from "@/lib/api/events-api";
import { useCreateWhatsappBatchMutation, useSendTelegramBatchMutation } from "@/lib/api/invitations-api";
import { useSession } from "@/lib/session-context";
import { useState, useEffect, useMemo, useRef, FormEvent } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { isValidPhoneNumber } from "react-phone-number-input";
import { EventHeader } from "@/components/event/EventHeader";
import { EventTabs } from "@/components/event/EventTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EventOverviewSection } from "./components/EventOverviewSection";
import { EditEventDialog } from "./components/EditEventDialog";

type EventDetail = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone: string | null;
  groomPhone: string | null;
  eventDate: string;
  location: string | null;
  googleMapAddress: string;
  description: string | null;
  coverImage?: string | null;
  invitationCardUrl: string | null;
  status?: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  isPublished: boolean
};

type EventResponse = { event: EventDetail };

type EventTab = "overview" | "invitation" | "guests";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

function buildInvitationCode(prefix: string, index = 0) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  const seq = index > 0 ? `-${index}` : "";
  return `${prefix}-${stamp}-${random}${seq}`.slice(0, 40);
}

function resolveEventStatus(event: Pick<EventDetail, "eventDate" | "isPublished" | "status">) {
  if (event.status) return event.status;

  const now = new Date();
  const eventDate = new Date(event.eventDate);
  if (eventDate < now) return "COMPLETED" as const;
  if (event.isPublished) return "SCHEDULED" as const;
  return "DRAFT" as const;
}

function EventDetailSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-28" />
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-24" />
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-20" />
        </div>
      </section>

      <section className="rounded-xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-64 w-full rounded-lg" />
      </section>
    </div>
  );
}

export default function EventDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const searchParams = useSearchParams();
  const eventQuery = useGetStudioEventDetailQuery(params?.eventId ?? "", {
    skip: status !== "authenticated" || !params?.eventId,
  });
  
  const [updateEvent, updateEventState] = useUpdateStudioEventMutation();
  
  const [tab, setTab] = useState<EventTab>("overview");
  const event = (eventQuery.data as EventResponse | undefined)?.event ?? null;
  const loading = eventQuery.isLoading || eventQuery.isFetching;
  const error = eventQuery.isError ? getApiErrorMessage(eventQuery.error, "Unable to load event details") : null;

  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]); // Removed media-related state
  const [guestPage, setGuestPage] = useState(1);
  const [guestPageSize] = useState(10);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const editSubmitting = updateEventState.isLoading && isEditOpen;
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<{
    title?: string;
    bridePhone?: string;
    groomPhone?: string;
    eventDate?: string;
    eventTime?: string;
    googleMapAddress?: string;
  }>({});
  const [statusActionError, setStatusActionError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    brideName: "",
    groomName: "",
    bridePhone: "",
    groomPhone: "",
    eventDate: "",
    eventTime: "18:00",
    location: "",
    googleMapAddress: "",
    description: "",
  });

  // Removed all media-related state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
  }, [router, status]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab === "overview" || requestedTab === "guests" || requestedTab === "invitation") {
      setTab(requestedTab);
    }
  }, [searchParams]);

  // Removed all media-related memoized values and effects

  const isCompletedEvent = !!event && resolveEventStatus(event) === "COMPLETED";
  const immutableMessage = "Completed events are locked. No further changes are allowed.";
  const minEventDate = toDateInputValue(new Date());
  const editDateTime = editForm.eventDate && editForm.eventTime ? new Date(`${editForm.eventDate}T${editForm.eventTime}`) : null;
  const editSchedulePreview = editDateTime && isValidDate(editDateTime)
    ? new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(editDateTime)
    : null;

  useEffect(() => {
    setGuestPage(1);
  }, [event?.id]);

  function openEditModal() {
    if (!event) return;

    if (resolveEventStatus(event) === "COMPLETED") {
      setEditError("Completed events cannot be edited.");
      return;
    }

    const parsedDate = new Date(event.eventDate);

    setEditError(null);
    setEditSuccess(null);
    setEditFieldErrors({});
    setEditForm({
      title: event.title,
      brideName: event.brideName ?? "",
      groomName: event.groomName ?? "",
      bridePhone: event.bridePhone ?? "",
      groomPhone: event.groomPhone ?? "",
      eventDate: toDateInputValue(parsedDate),
      eventTime: toTimeInputValue(parsedDate),
      location: event.location ?? "",
      googleMapAddress: event.googleMapAddress,
      description: event.description ?? "",
    });
    setIsEditOpen(true);
  }

  async function handleEventEditSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;
    if (isCompletedEvent) {
      setEditError(immutableMessage);
      return;
    }

    if (resolveEventStatus(event) === "COMPLETED") {
      setEditError("Completed events cannot be edited.");
      return;
    }

    setEditError(null);
    setEditSuccess(null);
    setEditFieldErrors({});

    const nextFieldErrors: {
      title?: string;
      bridePhone?: string;
      groomPhone?: string;
      eventDate?: string;
      eventTime?: string;
      googleMapAddress?: string;
    } = {};

    if (editForm.title.trim().length < 2) {
      nextFieldErrors.title = "Event title must be at least 2 characters.";
    }

    if (!editForm.eventDate) {
      nextFieldErrors.eventDate = "Event date is required.";
    }

    if (!editForm.eventTime) {
      nextFieldErrors.eventTime = "Event time is required.";
    }

    const bridePhone = editForm.bridePhone.trim();
    const groomPhone = editForm.groomPhone.trim();

    if (bridePhone && !isValidPhoneNumber(bridePhone)) {
      nextFieldErrors.bridePhone = "Please enter a valid bride phone number.";
    }

    if (groomPhone && !isValidPhoneNumber(groomPhone)) {
      nextFieldErrors.groomPhone = "Please enter a valid groom phone number.";
    }

    if (editForm.googleMapAddress.trim() && !/^https?:\/\//i.test(editForm.googleMapAddress.trim())) {
      nextFieldErrors.googleMapAddress = "Google Map address must start with http:// or https://.";
    }

    const parsedEventDate = new Date(`${editForm.eventDate}T${editForm.eventTime}`);
    if (!isValidDate(parsedEventDate)) {
      nextFieldErrors.eventDate = nextFieldErrors.eventDate ?? "Please provide a valid event date.";
      nextFieldErrors.eventTime = nextFieldErrors.eventTime ?? "Please provide a valid event time.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setEditFieldErrors(nextFieldErrors);
      setEditError("Please fix the highlighted fields.");
      return;
    }

    const result = await updateEvent({
      eventId: event.id,
      body: {
        title: editForm.title.trim(),
        brideName: editForm.brideName.trim() || null,
        groomName: editForm.groomName.trim() || null,
        bridePhone: bridePhone || undefined,
        groomPhone: groomPhone || undefined,
        eventDate: parsedEventDate.toISOString(),
        location: editForm.location.trim() || null,
        googleMapAddress: editForm.googleMapAddress.trim() || undefined,
        description: editForm.description.trim() || null,
      },
    });

    if ("error" in result) {
      setEditError(getApiErrorMessage(result.error, "Unable to update event details right now."));
      return;
    }

    setEditSuccess("Event updated successfully.");
    setIsEditOpen(false);
    await eventQuery.refetch();
  }

  async function handleQuickStatusChange(
    nextStatus: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED",
    cancellationReason?: string
  ) {
    if (!event) return;
    if (isCompletedEvent) {
      setStatusActionError(immutableMessage);
      return;
    }

    setStatusActionError(null);

    const result = await updateEvent({
      eventId: event.id,
      body: {
        status: nextStatus,
        cancellationReason: nextStatus === "CANCELLED" ? cancellationReason : undefined,
      },
    });

    if ("error" in result) {
      setStatusActionError(getApiErrorMessage(result.error, "Unable to update event status right now."));
      return;
    }

    await eventQuery.refetch();
  }

  if (status === "idle" || status === "loading" || status === "unauthenticated") {
    return (
      <main className="ui-page">
        <EventDetailSkeleton />
      </main>
    );
  }

  return (
    <main className="ui-page">
      {!loading && event ? (
        <EventHeader
          title={event.title}
          eventTitle={event.title}
          status={resolveEventStatus(event) as "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED"}
          eventDate={event.eventDate}
          avatarUrl={event.coverImage || undefined}
          onEdit={openEditModal}
          editDisabled={isCompletedEvent}
          statusChangeDisabled={isCompletedEvent}
          onStatusChange={handleQuickStatusChange}
          onAvatarClick={() => {
            
          }}
        />
      ) : null}

      {loading ? (
        <EventDetailSkeleton />
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : !event ? (
        <p className="mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>Event not found.</p>
      ) : (
        <>
          {isCompletedEvent ? (
            <p className="mt-3 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#f6d28b", background: "#fff7e6", color: "#9a6b13" }}>
              Completed events are locked and cannot be edited.
            </p>
          ) : null}

          {statusActionError ? <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{statusActionError}</p> : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Event Date</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>{formatDateTime(event.eventDate)}</p>
            </div>
          </div>

          <div className="mt-5">
            <EventTabs
              activeTab={tab as "overview" | "invitation"}
              onTabChange={setTab}
            />
          </div>

          {tab === "overview" ? (
            <EventOverviewSection
              event={event}
            />
          ) : null}


          {/* Media tab and section removed */}

          {tab === "invitation" ? (
            <InvitationTab
              event={event}
              onSave={async (updated: any) => {
                await updateEvent({ eventId: event.id, body: updated });
                await eventQuery.refetch();
              }}
            />
          ) : null}

          <EditEventDialog
            isOpen={isEditOpen}
            editForm={editForm}
            editFieldErrors={editFieldErrors}
            editSchedulePreview={editSchedulePreview}
            minEventDate={minEventDate}
            editError={editError}
            editSuccess={editSuccess}
            editSubmitting={editSubmitting}
            onClose={() => setIsEditOpen(false)}
            onSubmit={handleEventEditSubmit}
            onChange={setEditForm}
            onFieldErrorsChange={setEditFieldErrors}
          />
        </>
      )}
    </main>
  );
}