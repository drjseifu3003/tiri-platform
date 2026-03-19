"use client";

import { getApiErrorMessage } from "@/lib/api/base-api";
import {
  useDeleteInvitationCardMutation,
  useGetStudioEventDetailQuery,
  useUpdateStudioEventMutation,
  useUploadEventAvatarMutation,
  useUploadInvitationCardMutation,
} from "@/lib/api/events-api";
import {
  useCreateStudioGuestMutation,
  useCreateStudioGuestsBulkMutation,
  useDeleteStudioGuestMutation,
  useUpdateStudioGuestMutation,
} from "@/lib/api/guests-api";
import { useCreateWhatsappBatchMutation, useSendTelegramBatchMutation } from "@/lib/api/invitations-api";
import { useCreateStudioMediaMutation, useDeleteStudioMediaMutation } from "@/lib/api/media-api";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EventHeader } from "@/components/event/EventHeader";
import { EventTabs } from "@/components/event/EventTabs";
import { AddGuestDialog } from "@/components/event/AddGuestDialog";
import { MediaUploadDialog } from "@/components/event/MediaUploadDialog";
import { AvatarUploadDialog } from "@/components/event/AvatarUploadDialog";
import { InviteChannelDialog } from "@/components/pages/studio/events/[eventId]/components/InviteChannelDialog";
import { GuestEditDialog } from "@/components/pages/studio/events/[eventId]/components/GuestEditDialog";
import { GuestDeleteDialog } from "@/components/pages/studio/events/[eventId]/components/GuestDeleteDialog";
import { MediaPreviewDialog } from "@/components/pages/studio/events/[eventId]/components/MediaPreviewDialog";
import { EventOverviewSection } from "@/components/pages/studio/events/[eventId]/components/EventOverviewSection";
import { EventGuestsSection } from "@/components/pages/studio/events/[eventId]/components/EventGuestsSection";
import { EventMediaSection } from "@/components/pages/studio/events/[eventId]/components/EventMediaSection";
import { EditEventDialog } from "@/components/pages/studio/events/[eventId]/components/EditEventDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { InvitationTab } from "@/components/event/InvitationTab";

type GuestItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
  checkedIn: boolean;
  checkedInAt: string | null;
  invitationStatus: "SENT" | "NOT_SENT";
  invitationChannel: "WHATSAPP" | "TELEGRAM" | "SMS" | null;
  invitationSentAt: string | null;
};

type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  groupLabel: string | null;
  createdAt: string;
};

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
  isPublished: boolean;
  guests: GuestItem[];
  media: MediaItem[];
};

type EventResponse = { event: EventDetail };

type EventTab = "overview" | "guests" | "media" | "invitation";

type GuestCategory = "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
type MediaType = "IMAGE" | "VIDEO";
type InviteChannel = "WHATSAPP" | "TELEGRAM" | "SMS";
type InviteActionChannel = "WHATSAPP" | "TELEGRAM";

type WhatsAppBatchInviteResponse = {
  results: Array<{
    guestId: string;
    guestName: string;
    whatsappLink: string | null;
    status: "READY" | "SKIPPED";
    reason: string | null;
  }>;
  summary: {
    requested: number;
    ready: number;
    skipped: number;
  };
};

type TelegramInviteResponse = {
  results: Array<{
    guestId: string;
    guestName: string;
    status: "SENT" | "SKIPPED" | "FAILED";
    reason: string | null;
  }>;
  summary: {
    requested: number;
    sent: number;
    skipped: number;
    failed: number;
  };
};

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

function labelForCategory(value: GuestItem["category"]) {
  if (value === "BRIDE_GUEST") return "Bride Guest";
  if (value === "GROOM_GUEST") return "Groom Guest";
  return "General";
}

function buildInvitationCode(prefix: string, index = 0) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  const seq = index > 0 ? `-${index}` : "";
  return `${prefix}-${stamp}-${random}${seq}`.slice(0, 40);
}

function labelForInviteChannel(channel: InviteChannel | null) {
  if (channel === "WHATSAPP") return "WhatsApp";
  if (channel === "TELEGRAM") return "Telegram";
  if (channel === "SMS") return "SMS";
  return "-";
}

function channelPillClasses(channel: InviteChannel | null) {
  if (channel === "WHATSAPP") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (channel === "TELEGRAM") return "border-sky-200 bg-sky-50 text-sky-700";
  if (channel === "SMS") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-zinc-200 bg-zinc-100 text-zinc-600";
}

function resolveEventStatus(event: Pick<EventDetail, "eventDate" | "isPublished" | "status">) {
  if (event.status) return event.status;

  const now = new Date();
  const eventDate = new Date(event.eventDate);
  if (eventDate < now) return "COMPLETED" as const;
  if (event.isPublished) return "SCHEDULED" as const;
  return "DRAFT" as const;
}

function eventStatusLabel(status: ReturnType<typeof resolveEventStatus>) {
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "LIVE") return "Live";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

function eventStatusPillClasses(status: ReturnType<typeof resolveEventStatus>) {
  if (status === "LIVE") return "border-rose-300 bg-rose-50 text-rose-800";
  if (status === "SCHEDULED") return "border-sky-300 bg-sky-50 text-sky-800";
  if (status === "COMPLETED") return "border-slate-300 bg-slate-100 text-slate-700";
  if (status === "CANCELLED") return "border-red-300 bg-red-50 text-red-700";
  if (status === "ARCHIVED") return "border-zinc-300 bg-zinc-100 text-zinc-700";
  return "border-amber-300 bg-amber-50 text-amber-800";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function mediaFileName(url: string) {
  if (URL.canParse(url)) {
    const parsed = new URL(url);
    const fileName = parsed.pathname.split("/").filter(Boolean).pop();
    return fileName || "media-file";
  }

  const fileName = url.split("/").filter(Boolean).pop();
  return fileName || "media-file";
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
  const [createGuest, createGuestState] = useCreateStudioGuestMutation();
  const [updateGuest, updateGuestState] = useUpdateStudioGuestMutation();
  const [deleteGuest, deleteGuestState] = useDeleteStudioGuestMutation();
  const [createGuestsBulk, createGuestsBulkState] = useCreateStudioGuestsBulkMutation();
  const [createMedia, createMediaState] = useCreateStudioMediaMutation();
  const [deleteMedia, deleteMediaState] = useDeleteStudioMediaMutation();
  const [uploadInvitationCard, uploadInvitationCardState] = useUploadInvitationCardMutation();
  const [deleteInvitationCard, deleteInvitationCardState] = useDeleteInvitationCardMutation();
  const [uploadAvatar, uploadAvatarState] = useUploadEventAvatarMutation();
  const [sendWhatsappBatch, sendWhatsappBatchState] = useCreateWhatsappBatchMutation();
  const [sendTelegramBatch, sendTelegramBatchState] = useSendTelegramBatchMutation();

  const [tab, setTab] = useState<EventTab>("overview");
  const event = (eventQuery.data as EventResponse | undefined)?.event ?? null;
  const loading = eventQuery.isLoading || eventQuery.isFetching;
  const error = eventQuery.isError ? getApiErrorMessage(eventQuery.error, "Unable to load event details") : null;

  const [singleGuest, setSingleGuest] = useState({
    name: "",
    phone: "",
    email: "",
    category: "GENERAL" as GuestCategory,
  });
  const [bulkGuestText, setBulkGuestText] = useState("");
  const [guestFormError, setGuestFormError] = useState<string | null>(null);
  const [guestFormSuccess, setGuestFormSuccess] = useState<string | null>(null);
  const guestSubmitting = createGuestState.isLoading || createGuestsBulkState.isLoading;
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [guestPage, setGuestPage] = useState(1);
  const [guestPageSize] = useState(10);
  const [openGuestMenuId, setOpenGuestMenuId] = useState<string | null>(null);
  const inviteSubmitting = sendWhatsappBatchState.isLoading || sendTelegramBatchState.isLoading;
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const guestDeleteLoading = deleteGuestState.isLoading;
  const [guestDeleteError, setGuestDeleteError] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const guestEditLoading = updateGuestState.isLoading;
  const [guestEditError, setGuestEditError] = useState<string | null>(null);
  const [guestEditForm, setGuestEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    category: "GENERAL" as GuestCategory,
  });
  const [guestToDelete, setGuestToDelete] = useState<GuestItem | null>(null);
  const [isInviteChannelDialogOpen, setIsInviteChannelDialogOpen] = useState(false);
  const [pendingInviteGuestIds, setPendingInviteGuestIds] = useState<string[]>([]);
  const [pendingInviteOpenFirst, setPendingInviteOpenFirst] = useState(false);

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
  const statusUpdating = uploadAvatarState.isLoading || (updateEventState.isLoading && !isEditOpen);
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

  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [addGuestError, setAddGuestError] = useState<string | null>(null);

  const [isMediaUploadDialogOpen, setIsMediaUploadDialogOpen] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);
  const [mediaDeleteLoadingId, setMediaDeleteLoadingId] = useState<string | null>(null);
  const invitationCardLoading = uploadInvitationCardState.isLoading || deleteInvitationCardState.isLoading;
  const [invitationCardError, setInvitationCardError] = useState<string | null>(null);
  const invitationCardInputRef = useRef<HTMLInputElement>(null);

  const [isAvatarUploadDialogOpen, setIsAvatarUploadDialogOpen] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  const [mediaForm, setMediaForm] = useState({
    type: "IMAGE" as MediaType,
    url: "",
    groupLabel: "",
  });
  
  const [mediaFormError, setMediaFormError] = useState<string | null>(null);
  const [mediaFormSuccess, setMediaFormSuccess] = useState<string | null>(null);
  const mediaSubmitting = createMediaState.isLoading;
  const [selectedMediaFolder, setSelectedMediaFolder] = useState<string | null>(null);
  const [mediaViewMode, setMediaViewMode] = useState<"grid" | "list">("list");
  const [previewMediaItem, setPreviewMediaItem] = useState<(MediaItem & { name: string; folder: string }) | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
  }, [router, status]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab === "overview" || requestedTab === "guests" || requestedTab === "media") {
      setTab(requestedTab);
    }
  }, [searchParams]);

  const checkedInCount = useMemo(() => {
    return event?.guests.filter((guest) => guest.checkedIn).length ?? 0;
  }, [event]);

  const mediaFolders = useMemo(() => {
    const groups: Record<string, MediaItem[]> = {};

    for (const item of event?.media ?? []) {
      const folder = item.groupLabel?.trim();
      if (!folder) continue;
      groups[folder] = [...(groups[folder] ?? []), item];
    }

    return Object.entries(groups)
      .map(([name, items]) => ({
        name,
        fileCount: items.length,
        lastModified: items
          .map((item) => item.createdAt)
          .sort((left, right) => right.localeCompare(left))[0],
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [event?.media]);

  const mediaUngroupedFiles = useMemo(() => {
    return (event?.media ?? [])
      .filter((item) => !item.groupLabel?.trim())
      .map((item) => ({
        ...item,
        name: mediaFileName(item.url),
        folder: "My Drive",
      }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }, [event?.media]);

  const mediaFilesInSelectedFolder = useMemo(() => {
    if (!selectedMediaFolder) return [];

    return (event?.media ?? [])
      .filter((item) => item.groupLabel?.trim() === selectedMediaFolder)
      .map((item) => ({ ...item, name: mediaFileName(item.url), folder: selectedMediaFolder }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }, [event?.media, selectedMediaFolder]);

  const mediaBrowserItems = useMemo(() => {
    const folderItems = selectedMediaFolder
      ? []
      : mediaFolders.map((folder) => ({
        kind: "folder" as const,
        id: `folder:${folder.name}`,
        name: folder.name,
        fileCount: folder.fileCount,
        lastModified: folder.lastModified,
      }));

    const fileItems = (selectedMediaFolder ? mediaFilesInSelectedFolder : mediaUngroupedFiles).map((file) => ({
      kind: "file" as const,
      id: file.id,
      file,
    }));

    return [...folderItems, ...fileItems];
  }, [mediaFilesInSelectedFolder, mediaFolders, mediaUngroupedFiles, selectedMediaFolder]);

  useEffect(() => {
    if (!selectedMediaFolder) return;
    if (mediaFolders.some((folder) => folder.name === selectedMediaFolder)) return;
    setSelectedMediaFolder(null);
  }, [mediaFolders, selectedMediaFolder]);

  const selectedCount = selectedGuestIds.length;
  const guestTotalItems = event?.guests.length ?? 0;
  const guestTotalPages = Math.max(1, Math.ceil(guestTotalItems / guestPageSize));
  const clampedGuestPage = Math.min(guestPage, guestTotalPages);
  const guestStartIndex = (clampedGuestPage - 1) * guestPageSize;
  const paginatedGuests = (event?.guests ?? []).slice(guestStartIndex, guestStartIndex + guestPageSize);
  const allGuestsSelected = paginatedGuests.length > 0 && paginatedGuests.every((guest) => selectedGuestIds.includes(guest.id));
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
    if (guestPage !== clampedGuestPage) {
      setGuestPage(clampedGuestPage);
    }
  }, [clampedGuestPage, guestPage]);

  useEffect(() => {
    setGuestPage(1);
  }, [event?.id]);

  function toggleGuestSelection(guestId: string, checked: boolean) {
    setSelectedGuestIds((current) => {
      if (checked) {
        if (current.includes(guestId)) return current;
        return [...current, guestId];
      }

      return current.filter((id) => id !== guestId);
    });
  }

  function toggleSelectAllGuests(checked: boolean) {
    const pageGuestIds = paginatedGuests.map((guest) => guest.id);

    setSelectedGuestIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...pageGuestIds]));
      }

      return current.filter((id) => !pageGuestIds.includes(id));
    });
  }

  async function sendInvites(channel: InviteActionChannel, guestIds: string[], openFirst = false) {
    if (!event || guestIds.length === 0) return;
    if (isCompletedEvent) {
      setInviteError(immutableMessage);
      return;
    }

    setInviteError(null);
    setInviteSuccess(null);

    if (channel === "WHATSAPP") {
      const result = await sendWhatsappBatch({ eventId: event.id, guestIds });
      if ("error" in result) {
        setInviteError(getApiErrorMessage(result.error, "Unable to send invitations right now."));
        return;
      }

      const payload = result.data as WhatsAppBatchInviteResponse;
        const readyItems = payload.results.filter((item) => item.status === "READY" && item.whatsappLink);

        if (openFirst && readyItems[0]?.whatsappLink) {
          window.open(readyItems[0].whatsappLink, "_blank", "noopener,noreferrer");
        }

        setInviteSuccess(`WhatsApp invites ready: ${payload.summary.ready}, skipped: ${payload.summary.skipped}.`);
    } else {
      const result = await sendTelegramBatch({ eventId: event.id, guestIds });
      if ("error" in result) {
        setInviteError(getApiErrorMessage(result.error, "Unable to send invitations right now."));
        return;
      }

      const payload = result.data as TelegramInviteResponse;

      const unlinkedGuestIds = payload.results
        .filter(
          (item) =>
            item.status === "SKIPPED" &&
            (item.reason ?? "").toLowerCase().includes("has not started the telegram bot")
        )
        .map((item) => item.guestId);

      if (unlinkedGuestIds.length > 0) {
        const fallbackResult = await sendWhatsappBatch({ eventId: event.id, guestIds: unlinkedGuestIds });
        if ("error" in fallbackResult) {
          setInviteError(getApiErrorMessage(fallbackResult.error, "Unable to send invitations right now."));
          return;
        }

        const whatsappFallbackPayload = fallbackResult.data as WhatsAppBatchInviteResponse;

        const fallbackReadyItems = whatsappFallbackPayload.results.filter(
          (item) => item.status === "READY" && item.whatsappLink
        );

        if (openFirst && fallbackReadyItems[0]?.whatsappLink) {
          window.open(fallbackReadyItems[0].whatsappLink, "_blank", "noopener,noreferrer");
        }

        setInviteSuccess(
          `Telegram: ${payload.summary.sent} sent, ${payload.summary.failed} failed. Auto-fallback WhatsApp ready: ${whatsappFallbackPayload.summary.ready}, skipped: ${whatsappFallbackPayload.summary.skipped}.`
        );
      } else {
        setInviteSuccess(
          `Telegram invites: ${payload.summary.sent} sent, ${payload.summary.skipped} skipped, ${payload.summary.failed} failed.`
        );
      }
    }

    await eventQuery.refetch();
  }

  function openInviteChannelDialog(guestIds: string[], openFirst = false) {
    if (guestIds.length === 0) return;
    if (isCompletedEvent) {
      setInviteError(immutableMessage);
      return;
    }
    setPendingInviteGuestIds(guestIds);
    setPendingInviteOpenFirst(openFirst);
    setIsInviteChannelDialogOpen(true);
  }

  async function confirmInviteChannel(channel: InviteActionChannel) {
    const guestIds = pendingInviteGuestIds;
    const openFirst = pendingInviteOpenFirst;

    setIsInviteChannelDialogOpen(false);
    setPendingInviteGuestIds([]);
    setPendingInviteOpenFirst(false);

    await sendInvites(channel, guestIds, openFirst);
  }

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

  async function handleAddGuestDialog(guestData: { name: string; phone: string; email: string; category: GuestCategory }): Promise<boolean> {
    if (!event) return false;
    if (isCompletedEvent) {
      setAddGuestError(immutableMessage);
      return false;
    }

    setAddGuestError(null);

    const name = guestData.name.trim();
    const phone = guestData.phone.trim();
    const email = guestData.email.trim();

    if (name.length < 2) {
      setAddGuestError("Guest name must be at least 2 characters.");
      return false;
    }

    if (phone.length > 0 && !isValidPhoneNumber(phone)) {
      setAddGuestError("Please enter a valid phone number.");
      return false;
    }

    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAddGuestError("Please enter a valid email address.");
      return false;
    }

    const result = await createGuest({
      eventId: event.id,
      name,
      phone: phone || undefined,
      email: email || undefined,
      category: guestData.category,
      invitationCode: buildInvitationCode("gst"),
    });

    if ("error" in result) {
      setAddGuestError(getApiErrorMessage(result.error, "Unable to add guest right now."));
      return false;
    }

    setIsAddGuestDialogOpen(false);
    await eventQuery.refetch();

    setGuestFormSuccess("Guest added successfully.");
    setTimeout(() => setGuestFormSuccess(null), 3000);
    return true;
  }

  function openGuestEditDialog(guest: GuestItem) {
    if (isCompletedEvent) {
      setGuestFormError(immutableMessage);
      return;
    }
    setGuestEditError(null);
    setEditingGuest(guest);
    setGuestEditForm({
      name: guest.name,
      phone: guest.phone ?? "",
      email: guest.email ?? "",
      category: guest.category,
    });
  }

  function closeGuestEditDialog() {
    setEditingGuest(null);
    setGuestEditError(null);
    setGuestEditForm({
      name: "",
      phone: "",
      email: "",
      category: "GENERAL",
    });
  }

  async function handleGuestEditSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!editingGuest) return;
    if (isCompletedEvent) {
      setGuestEditError(immutableMessage);
      return;
    }

    setGuestEditError(null);

    const name = guestEditForm.name.trim();
    const phone = guestEditForm.phone.trim();
    const email = guestEditForm.email.trim();

    if (name.length < 2) {
      setGuestEditError("Guest name must be at least 2 characters.");
      return;
    }

    if (phone.length > 0 && !isValidPhoneNumber(phone)) {
      setGuestEditError("Please enter a valid phone number.");
      return;
    }

    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setGuestEditError("Please enter a valid email address.");
      return;
    }

    const result = await updateGuest({
      guestId: editingGuest.id,
      body: {
        name,
        phone: phone || null,
        email: email || null,
        category: guestEditForm.category,
      },
    });

    if ("error" in result) {
      setGuestEditError(getApiErrorMessage(result.error, "Unable to update guest right now."));
      return;
    }

    closeGuestEditDialog();
    setGuestFormSuccess("Guest updated successfully.");
    setTimeout(() => setGuestFormSuccess(null), 3000);
    await eventQuery.refetch();
  }

  async function handleGuestDelete() {
    if (!guestToDelete) return;
    if (isCompletedEvent) {
      setGuestDeleteError(immutableMessage);
      return;
    }

    setGuestDeleteError(null);

    const result = await deleteGuest({ guestId: guestToDelete.id });
    if ("error" in result) {
      setGuestDeleteError(getApiErrorMessage(result.error, "Unable to delete guest right now."));
      return;
    }

    setGuestToDelete(null);
    setGuestFormSuccess("Guest removed successfully.");
    setTimeout(() => setGuestFormSuccess(null), 3000);
    await eventQuery.refetch();
  }

  async function handleMediaUploadDialog(data: { type: MediaType; groupLabel: string; files: File[] }): Promise<boolean> {
    if (!event) return false;

    setMediaUploadError(null);

    for (const file of data.files) {
      const formData = new FormData();
      formData.append("eventId", event.id);
      formData.append("type", data.type);
      formData.append("groupLabel", data.groupLabel);
      formData.append("file", file);

      const result = await createMedia(formData);
      if ("error" in result) {
        setMediaUploadError(getApiErrorMessage(result.error, "Unable to upload media right now."));
        return false;
      }
    }

    setIsMediaUploadDialogOpen(false);
    await eventQuery.refetch();
    setMediaFormSuccess(`${data.files.length} media file${data.files.length === 1 ? "" : "s"} uploaded successfully.`);
    setTimeout(() => setMediaFormSuccess(null), 3000);
    return true;
  }

  async function handleDeleteMedia(mediaId: string) {
    if (isCompletedEvent) {
      setMediaUploadError(immutableMessage);
      return;
    }
    setMediaUploadError(null);
    setMediaDeleteLoadingId(mediaId);

    const result = await deleteMedia({ mediaId });
    if ("error" in result) {
      setMediaUploadError(getApiErrorMessage(result.error, "Unable to delete media right now."));
      setMediaDeleteLoadingId(null);
      return;
    }

    if (previewMediaItem?.id === mediaId) {
      setPreviewMediaItem(null);
    }

    await eventQuery.refetch();
    setMediaFormSuccess("Media deleted successfully.");
    setTimeout(() => setMediaFormSuccess(null), 3000);
    setMediaDeleteLoadingId(null);
  }

  async function handleInvitationCardUpload(file: File) {
    if (!event) return;
    if (isCompletedEvent) {
      setInvitationCardError(immutableMessage);
      return;
    }

    setInvitationCardError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadInvitationCard({ eventId: event.id, body: formData });
    if ("error" in result) {
      setInvitationCardError(getApiErrorMessage(result.error, "Unable to upload invitation card right now."));
      if (invitationCardInputRef.current) {
        invitationCardInputRef.current.value = "";
      }
      return;
    }

    await eventQuery.refetch();
    setMediaFormSuccess("Invitation card uploaded successfully.");
    setTimeout(() => setMediaFormSuccess(null), 3000);
    if (invitationCardInputRef.current) {
      invitationCardInputRef.current.value = "";
    }
  }

  async function handleDeleteInvitationCard() {
    if (!event) return;
    if (isCompletedEvent) {
      setInvitationCardError(immutableMessage);
      return;
    }

    setInvitationCardError(null);

    const result = await deleteInvitationCard({ eventId: event.id });
    if ("error" in result) {
      setInvitationCardError(getApiErrorMessage(result.error, "Unable to remove invitation card right now."));
      return;
    }

    await eventQuery.refetch();
    setMediaFormSuccess("Invitation card removed successfully.");
    setTimeout(() => setMediaFormSuccess(null), 3000);
  }

  async function handleAvatarUpload(file: File) {
    if (!event) return;
    if (isCompletedEvent) {
      setAvatarUploadError(immutableMessage);
      return;
    }

    setAvatarUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar({ eventId: event.id, body: formData });
    if ("error" in result) {
      setAvatarUploadError(getApiErrorMessage(result.error, "Unable to upload avatar right now."));
      return;
    }

    setIsAvatarUploadDialogOpen(false);
    await eventQuery.refetch();
  }

  async function handleSingleGuestSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;
    if (isCompletedEvent) {
      setGuestFormError(immutableMessage);
      return;
    }

    setGuestFormError(null);
    setGuestFormSuccess(null);

    const name = singleGuest.name.trim();
    const phone = singleGuest.phone.trim();
    const email = singleGuest.email.trim();

    if (name.length < 2) {
      setGuestFormError("Guest name must be at least 2 characters.");
      return;
    }

    const result = await createGuest({
      eventId: event.id,
      name,
      phone: phone || undefined,
      email: email || undefined,
      category: singleGuest.category,
      invitationCode: buildInvitationCode("gst"),
    });

    if ("error" in result) {
      setGuestFormError(getApiErrorMessage(result.error, "Unable to add guest right now."));
      return;
    }

    setSingleGuest({ name: "", phone: "", email: "", category: "GENERAL" });
    setGuestFormSuccess("Guest added successfully.");
    await eventQuery.refetch();
  }

  async function handleBulkGuestSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;
    if (isCompletedEvent) {
      setGuestFormError(immutableMessage);
      return;
    }

    setGuestFormError(null);
    setGuestFormSuccess(null);

    const lines = bulkGuestText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setGuestFormError("Add at least one line for bulk guests.");
      return;
    }

    const guests = lines.map((line, index) => {
      const [rawName, rawPhone, rawEmail] = line.split(",").map((value) => value?.trim() || "");
      return {
        name: rawName,
        phone: rawPhone || undefined,
        email: rawEmail || undefined,
        category: "GENERAL" as GuestCategory,
        invitationCode: buildInvitationCode("bulk", index + 1),
      };
    });

    if (guests.some((guest) => guest.name.length < 2)) {
      setGuestFormError("Each line must start with a guest name of at least 2 characters.");
      return;
    }

    const result = await createGuestsBulk({
      eventId: event.id,
      guests,
    });

    if ("error" in result) {
      setGuestFormError(getApiErrorMessage(result.error, "Bulk guest import failed right now."));
      return;
    }

    setBulkGuestText("");
    setGuestFormSuccess(`${guests.length} guests added.`);
    await eventQuery.refetch();
  }

  async function handleMediaUploadSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;

    setMediaFormError(null);
    setMediaFormSuccess(null);

    const url = mediaForm.url.trim();
    const groupLabel = mediaForm.groupLabel.trim();

    if (!url) {
      setMediaFormError("Media URL is required.");
      return;
    }

    const result = await createMedia({
      eventId: event.id,
      type: mediaForm.type,
      url,
      groupLabel: groupLabel || undefined,
    });

    if ("error" in result) {
      setMediaFormError(getApiErrorMessage(result.error, "Unable to upload media right now."));
      return;
    }

    setMediaForm({ type: "IMAGE", url: "", groupLabel: "" });
    setMediaFormSuccess("Media uploaded successfully.");
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
            if (isCompletedEvent) {
              setAvatarUploadError(immutableMessage);
              return;
            }
            setIsAvatarUploadDialogOpen(true);
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
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Total Guests</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>
                {event.guests.length} guest{event.guests.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Media Files</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>{event.media.length} file{event.media.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="mt-5">
            <EventTabs
              activeTab={tab}
              onTabChange={setTab}
              guestCount={event.guests.length}
              mediaCount={event.media.length}
            />
          </div>

          {tab === "overview" ? (
            <EventOverviewSection
              event={event}
              invitationCardInputRef={invitationCardInputRef}
              invitationCardLoading={invitationCardLoading}
              invitationCardError={invitationCardError}
              isCompletedEvent={isCompletedEvent}
              immutableMessage={immutableMessage}
              onInvitationCardUpload={(file) => {
                void handleInvitationCardUpload(file);
              }}
              onInvitationCardDelete={() => {
                void handleDeleteInvitationCard();
              }}
              setInvitationCardError={setInvitationCardError}
            />
          ) : null}

          {tab === "guests" ? (
            <EventGuestsSection
              guests={event.guests}
              paginatedGuests={paginatedGuests}
              selectedGuestIds={selectedGuestIds}
              allGuestsSelected={allGuestsSelected}
              selectedCount={selectedCount}
              inviteSubmitting={inviteSubmitting}
              isCompletedEvent={isCompletedEvent}
              guestFormError={guestFormError}
              guestFormSuccess={guestFormSuccess}
              inviteError={inviteError}
              inviteSuccess={inviteSuccess}
              openGuestMenuId={openGuestMenuId}
              guestTotalItems={guestTotalItems}
              guestStartIndex={guestStartIndex}
              guestPageSize={guestPageSize}
              clampedGuestPage={clampedGuestPage}
              guestTotalPages={guestTotalPages}
              labelForCategory={labelForCategory}
              labelForInviteChannel={labelForInviteChannel}
              channelPillClasses={channelPillClasses}
              formatDateTime={formatDateTime}
              onAddGuest={() => setIsAddGuestDialogOpen(true)}
              onToggleSelectAll={toggleSelectAllGuests}
              onOpenInviteDialog={openInviteChannelDialog}
              onToggleGuestSelection={toggleGuestSelection}
              onOpenGuestMenu={setOpenGuestMenuId}
              onOpenGuestEdit={openGuestEditDialog}
              onRequestGuestDelete={(guest) => {
                setGuestDeleteError(null);
                setGuestToDelete(guest);
              }}
              onPrevPage={() => setGuestPage((current) => Math.max(1, current - 1))}
              onNextPage={() => setGuestPage((current) => Math.min(guestTotalPages, current + 1))}
              clearGuestMessages={() => {
                setGuestFormError(null);
                setGuestFormSuccess(null);
              }}
            />
          ) : null}

          {tab === "media" ? (
            <EventMediaSection
              mediaCount={event.media.length}
              mediaFormError={mediaFormError}
              mediaFormSuccess={mediaFormSuccess}
              mediaBrowserItems={mediaBrowserItems}
              selectedMediaFolder={selectedMediaFolder}
              mediaViewMode={mediaViewMode}
              isCompletedEvent={isCompletedEvent}
              mediaDeleteLoadingId={mediaDeleteLoadingId}
              formatDateTime={formatDateTime}
              onUploadMedia={() => setIsMediaUploadDialogOpen(true)}
              onBackToFolders={() => setSelectedMediaFolder(null)}
              onSetMediaViewMode={setMediaViewMode}
              onOpenFolder={setSelectedMediaFolder}
              onPreviewMedia={setPreviewMediaItem}
              onDeleteMedia={(mediaId) => {
                void handleDeleteMedia(mediaId);
              }}
            />
          ) : null}

          {tab === "invitation" ? (
            <InvitationTab
              event={event}
              onSave={async (updated) => {
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

          <AddGuestDialog
            isOpen={isAddGuestDialogOpen}
            onClose={() => setIsAddGuestDialogOpen(false)}
            onSubmit={handleAddGuestDialog}
            isLoading={guestSubmitting}
            error={addGuestError || undefined}
          />

          <MediaUploadDialog
            key={`gallery-${isMediaUploadDialogOpen ? "open" : "closed"}`}
            isOpen={isMediaUploadDialogOpen}
            onClose={() => setIsMediaUploadDialogOpen(false)}
            eventId={event.id}
            onMediaChanged={async () => {
              await eventQuery.refetch();
            }}
            isLoading={mediaSubmitting}
            error={mediaUploadError || undefined}
            dialogTitle="Upload Media"
            initialType="IMAGE"
            initialGroupLabel=""
            lockType={false}
          />

          <AvatarUploadDialog
            isOpen={isAvatarUploadDialogOpen}
            onClose={() => setIsAvatarUploadDialogOpen(false)}
            onSubmit={handleAvatarUpload}
            isLoading={statusUpdating}
            currentAvatarUrl={event?.coverImage || undefined}
            eventTitle={event?.title || "Event"}
            error={avatarUploadError || undefined}
          />

          <MediaPreviewDialog
            item={previewMediaItem}
            isDeleting={mediaDeleteLoadingId === previewMediaItem?.id}
            onClose={() => setPreviewMediaItem(null)}
            onDelete={(mediaId) => {
              void handleDeleteMedia(mediaId);
            }}
          />

          <InviteChannelDialog
            isOpen={isInviteChannelDialogOpen}
            pendingInviteGuestIds={pendingInviteGuestIds}
            onCancel={() => {
              setIsInviteChannelDialogOpen(false);
              setPendingInviteGuestIds([]);
              setPendingInviteOpenFirst(false);
            }}
            onConfirm={(channel) => {
              void confirmInviteChannel(channel);
            }}
          />

          <GuestEditDialog
            isOpen={Boolean(editingGuest)}
            isLoading={guestEditLoading}
            error={guestEditError}
            guestEditForm={guestEditForm}
            onChange={setGuestEditForm}
            onClose={closeGuestEditDialog}
            onSubmit={handleGuestEditSubmit}
          />

          <GuestDeleteDialog
            guestName={guestToDelete?.name ?? null}
            error={guestDeleteError}
            isLoading={guestDeleteLoading}
            onCancel={() => {
              if (guestDeleteLoading) return;
              setGuestToDelete(null);
              setGuestDeleteError(null);
            }}
            onConfirm={() => {
              void handleGuestDelete();
            }}
          />
        </>
      )}
    </main>
  );
}