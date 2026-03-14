"use client";

import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EventHeader } from "@/components/event/EventHeader";
import { EventTabs } from "@/components/event/EventTabs";
import { AddGuestDialog } from "@/components/event/AddGuestDialog";
import { MediaUploadDialog } from "@/components/event/MediaUploadDialog";
import { AvatarUploadDialog } from "@/components/event/AvatarUploadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Eye, FolderOpen, MoreHorizontal, PencilLine, Send, Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type EventTab = "overview" | "guests" | "media";

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
  try {
    const parsed = new URL(url);
    const fileName = parsed.pathname.split("/").filter(Boolean).pop();
    return fileName || "media-file";
  } catch {
    const fileName = url.split("/").filter(Boolean).pop();
    return fileName || "media-file";
  }
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

  const [tab, setTab] = useState<EventTab>("overview");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [singleGuest, setSingleGuest] = useState({
    name: "",
    phone: "",
    email: "",
    category: "GENERAL" as GuestCategory,
  });
  const [bulkGuestText, setBulkGuestText] = useState("");
  const [guestFormError, setGuestFormError] = useState<string | null>(null);
  const [guestFormSuccess, setGuestFormSuccess] = useState<string | null>(null);
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [guestPage, setGuestPage] = useState(1);
  const [guestPageSize] = useState(10);
  const [openGuestMenuId, setOpenGuestMenuId] = useState<string | null>(null);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [guestDeleteLoading, setGuestDeleteLoading] = useState(false);
  const [guestDeleteError, setGuestDeleteError] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [guestEditLoading, setGuestEditLoading] = useState(false);
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
  const [editSubmitting, setEditSubmitting] = useState(false);
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
  const [statusUpdating, setStatusUpdating] = useState(false);
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
  const [invitationCardLoading, setInvitationCardLoading] = useState(false);
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
  const [mediaSubmitting, setMediaSubmitting] = useState(false);
  const [selectedMediaFolder, setSelectedMediaFolder] = useState<string | null>(null);
  const [mediaViewMode, setMediaViewMode] = useState<"grid" | "list">("list");
  const [previewMediaItem, setPreviewMediaItem] = useState<(MediaItem & { name: string; folder: string }) | null>(null);

  const loadEvent = useCallback(async (showSpinner = true) => {
    if (!params?.eventId) return;

    if (showSpinner) {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await fetch(`/api/studio/events/${params.eventId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load event");
      }

      const payload = (await response.json()) as EventResponse;
      setEvent(payload.event ?? null);
    } catch {
      setError("Unable to load event details");
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, [params?.eventId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;
    if (!params?.eventId) return;

    void loadEvent();
  }, [loadEvent, params?.eventId, router, status]);

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

    setInviteSubmitting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      if (channel === "WHATSAPP") {
        const response = await fetch("/api/invitations/whatsapp-batch", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: event.id, guestIds }),
        });

        if (!response.ok) {
          setInviteError("Unable to send invitations. Please try again.");
          return;
        }

        const payload = (await response.json()) as WhatsAppBatchInviteResponse;
        const readyItems = payload.results.filter((item) => item.status === "READY" && item.whatsappLink);

        if (openFirst && readyItems[0]?.whatsappLink) {
          window.open(readyItems[0].whatsappLink, "_blank", "noopener,noreferrer");
        }

        setInviteSuccess(`WhatsApp invites ready: ${payload.summary.ready}, skipped: ${payload.summary.skipped}.`);
      } else {
        const response = await fetch("/api/invitations/telegram/send", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: event.id, guestIds }),
        });

        if (!response.ok) {
          setInviteError("Unable to send Telegram invitations. Please try again.");
          return;
        }

        const payload = (await response.json()) as TelegramInviteResponse;

        const unlinkedGuestIds = payload.results
          .filter(
            (item) =>
              item.status === "SKIPPED" &&
              (item.reason ?? "").toLowerCase().includes("has not started the telegram bot")
          )
          .map((item) => item.guestId);

        if (unlinkedGuestIds.length > 0) {
          const whatsappFallbackResponse = await fetch("/api/invitations/whatsapp-batch", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId: event.id, guestIds: unlinkedGuestIds }),
          });

          if (!whatsappFallbackResponse.ok) {
            setInviteSuccess(
              `Telegram invites: ${payload.summary.sent} sent, ${payload.summary.skipped} skipped, ${payload.summary.failed} failed. WhatsApp fallback could not be prepared.`
            );
          } else {
            const whatsappFallbackPayload = (await whatsappFallbackResponse.json()) as WhatsAppBatchInviteResponse;
            const fallbackReadyItems = whatsappFallbackPayload.results.filter(
              (item) => item.status === "READY" && item.whatsappLink
            );

            if (openFirst && fallbackReadyItems[0]?.whatsappLink) {
              window.open(fallbackReadyItems[0].whatsappLink, "_blank", "noopener,noreferrer");
            }

            setInviteSuccess(
              `Telegram: ${payload.summary.sent} sent, ${payload.summary.failed} failed. Auto-fallback WhatsApp ready: ${whatsappFallbackPayload.summary.ready}, skipped: ${whatsappFallbackPayload.summary.skipped}.`
            );
          }
        } else {
          setInviteSuccess(
            `Telegram invites: ${payload.summary.sent} sent, ${payload.summary.skipped} skipped, ${payload.summary.failed} failed.`
          );
        }
      }

      await loadEvent(false);
    } catch {
      setInviteError("Unable to send invitations right now.");
    } finally {
      setInviteSubmitting(false);
    }
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

    setEditSubmitting(true);

    try {
      const response = await fetch(`/api/studio/events/${event.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          brideName: editForm.brideName.trim() || null,
          groomName: editForm.groomName.trim() || null,
          bridePhone: bridePhone || undefined,
          groomPhone: groomPhone || undefined,
          eventDate: parsedEventDate.toISOString(),
          location: editForm.location.trim() || null,
          googleMapAddress: editForm.googleMapAddress.trim() || undefined,
          description: editForm.description.trim() || null,
        }),
      });

      if (!response.ok) {
        setEditError("Unable to update event details.");
        return;
      }

      setEditSuccess("Event updated successfully.");
      setIsEditOpen(false);
      await loadEvent(false);
    } catch {
      setEditError("Unable to update event details right now.");
    } finally {
      setEditSubmitting(false);
    }
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
    setStatusUpdating(true);

    try {
      const response = await fetch(`/api/studio/events/${event.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          cancellationReason: nextStatus === "CANCELLED" ? cancellationReason : undefined,
        }),
      });

      if (!response.ok) {
        setStatusActionError("Unable to update event status.");
        return;
      }

      await loadEvent(false);
    } catch {
      setStatusActionError("Unable to update event status right now.");
    } finally {
      setStatusUpdating(false);
    }
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

    setGuestSubmitting(true);

    try {
      const response = await fetch("/api/studio/guests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name,
          phone: phone || undefined,
          email: email || undefined,
          category: guestData.category,
          invitationCode: buildInvitationCode("gst"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setAddGuestError(payload?.error || "Unable to add guest.");
        return false;
      }

      const payload = (await response.json().catch(() => null)) as { guest?: GuestItem } | null;
      const createdGuest = payload?.guest;

      if (createdGuest) {
        setEvent((current) => {
          if (!current) return current;

          return {
            ...current,
            guests: [
              {
                ...createdGuest,
                invitationStatus: "NOT_SENT",
                invitationChannel: null,
                invitationSentAt: null,
              },
              ...current.guests,
            ],
          };
        });
      }

      setIsAddGuestDialogOpen(false);
      if (!createdGuest) {
        await loadEvent(false);
      }
      setGuestFormSuccess("Guest added successfully.");
      setTimeout(() => setGuestFormSuccess(null), 3000);
      return true;
    } catch {
      setAddGuestError("Unable to add guest right now.");
      return false;
    } finally {
      setGuestSubmitting(false);
    }
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

    setGuestEditLoading(true);

    try {
      const response = await fetch(`/api/studio/guests/${editingGuest.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          email: email || null,
          category: guestEditForm.category,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setGuestEditError(payload?.error || "Unable to update guest.");
        return;
      }

      closeGuestEditDialog();
      setGuestFormSuccess("Guest updated successfully.");
      setTimeout(() => setGuestFormSuccess(null), 3000);
      await loadEvent(false);
    } catch {
      setGuestEditError("Unable to update guest right now.");
    } finally {
      setGuestEditLoading(false);
    }
  }

  async function handleGuestDelete() {
    if (!guestToDelete) return;
    if (isCompletedEvent) {
      setGuestDeleteError(immutableMessage);
      return;
    }

    setGuestDeleteError(null);
    setGuestDeleteLoading(true);

    try {
      const response = await fetch(`/api/studio/guests/${guestToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setGuestDeleteError(payload?.error || "Unable to delete guest.");
        return;
      }

      setGuestToDelete(null);
      setGuestFormSuccess("Guest removed successfully.");
      setTimeout(() => setGuestFormSuccess(null), 3000);
      await loadEvent(false);
    } catch {
      setGuestDeleteError("Unable to delete guest right now.");
    } finally {
      setGuestDeleteLoading(false);
    }
  }

  async function handleMediaUploadDialog(data: { type: MediaType; groupLabel: string; files: File[] }): Promise<boolean> {
    if (!event) return false;

    setMediaUploadError(null);
    setMediaSubmitting(true);

    try {
      for (const file of data.files) {
        const formData = new FormData();
        formData.append("eventId", event.id);
        formData.append("type", data.type);
        formData.append("groupLabel", data.groupLabel);
        formData.append("file", file);

        const response = await fetch("/api/studio/media", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          setMediaUploadError("Unable to upload media.");
          return false;
        }
      }

      setIsMediaUploadDialogOpen(false);
      await loadEvent(false);
      setMediaFormSuccess(`${data.files.length} media file${data.files.length === 1 ? "" : "s"} uploaded successfully.`);
      setTimeout(() => setMediaFormSuccess(null), 3000);
      return true;
    } catch {
      setMediaUploadError("Unable to upload media right now.");
      return false;
    } finally {
      setMediaSubmitting(false);
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    if (isCompletedEvent) {
      setMediaUploadError(immutableMessage);
      return;
    }
    setMediaUploadError(null);
    setMediaDeleteLoadingId(mediaId);

    try {
      const response = await fetch(`/api/studio/media/${mediaId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setMediaUploadError("Unable to delete media.");
        return;
      }

      if (previewMediaItem?.id === mediaId) {
        setPreviewMediaItem(null);
      }

      await loadEvent(false);
      setMediaFormSuccess("Media deleted successfully.");
      setTimeout(() => setMediaFormSuccess(null), 3000);
    } catch {
      setMediaUploadError("Unable to delete media right now.");
    } finally {
      setMediaDeleteLoadingId(null);
    }
  }

  async function handleInvitationCardUpload(file: File) {
    if (!event) return;
    if (isCompletedEvent) {
      setInvitationCardError(immutableMessage);
      return;
    }

    setInvitationCardError(null);
    setInvitationCardLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/studio/events/${event.id}/invitation-card`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setInvitationCardError(payload?.error || "Unable to upload invitation card.");
        return;
      }

      await loadEvent(false);
      setMediaFormSuccess("Invitation card uploaded successfully.");
      setTimeout(() => setMediaFormSuccess(null), 3000);
    } catch {
      setInvitationCardError("Unable to upload invitation card right now.");
    } finally {
      setInvitationCardLoading(false);
      if (invitationCardInputRef.current) {
        invitationCardInputRef.current.value = "";
      }
    }
  }

  async function handleDeleteInvitationCard() {
    if (!event) return;
    if (isCompletedEvent) {
      setInvitationCardError(immutableMessage);
      return;
    }

    setInvitationCardError(null);
    setInvitationCardLoading(true);

    try {
      const response = await fetch(`/api/studio/events/${event.id}/invitation-card`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setInvitationCardError(payload?.error || "Unable to remove invitation card.");
        return;
      }

      await loadEvent(false);
      setMediaFormSuccess("Invitation card removed successfully.");
      setTimeout(() => setMediaFormSuccess(null), 3000);
    } catch {
      setInvitationCardError("Unable to remove invitation card right now.");
    } finally {
      setInvitationCardLoading(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!event) return;
    if (isCompletedEvent) {
      setAvatarUploadError(immutableMessage);
      return;
    }

    setAvatarUploadError(null);
    setStatusUpdating(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/studio/events/${event.id}/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        setAvatarUploadError("Unable to upload avatar.");
        return;
      }

      setIsAvatarUploadDialogOpen(false);
      await loadEvent(false);
    } catch {
      setAvatarUploadError("Unable to upload avatar right now.");
    } finally {
      setStatusUpdating(false);
    }
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

    setGuestSubmitting(true);

    try {
      const response = await fetch("/api/studio/guests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name,
          phone: phone || undefined,
          email: email || undefined,
          category: singleGuest.category,
          invitationCode: buildInvitationCode("gst"),
        }),
      });

      if (!response.ok) {
        setGuestFormError("Unable to add guest. Please check values and try again.");
        return;
      }

      setSingleGuest({ name: "", phone: "", email: "", category: "GENERAL" });
      setGuestFormSuccess("Guest added successfully.");
      await loadEvent(false);
    } catch {
      setGuestFormError("Unable to add guest right now.");
    } finally {
      setGuestSubmitting(false);
    }
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

    setGuestSubmitting(true);

    try {
      const response = await fetch("/api/studio/guests/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          guests,
        }),
      });

      if (!response.ok) {
        setGuestFormError("Bulk guest import failed. Verify each line format.");
        return;
      }

      setBulkGuestText("");
      setGuestFormSuccess(`${guests.length} guests added.`);
      await loadEvent(false);
    } catch {
      setGuestFormError("Bulk guest import failed right now.");
    } finally {
      setGuestSubmitting(false);
    }
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

    setMediaSubmitting(true);

    try {
      const response = await fetch("/api/studio/media", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          type: mediaForm.type,
          url,
          groupLabel: groupLabel || undefined,
        }),
      });

      if (!response.ok) {
        setMediaFormError("Unable to upload media. Please check values and try again.");
        return;
      }

      setMediaForm({ type: "IMAGE", url: "", groupLabel: "" });
      setMediaFormSuccess("Media uploaded successfully.");
      await loadEvent(false);
    } catch {
      setMediaFormError("Unable to upload media right now.");
    } finally {
      setMediaSubmitting(false);
    }
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
            <section className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="ui-panel">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Event Overview</h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Bride Name</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {event.brideName || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Groom Name</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.groomName || "-"}</p>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Total Guests</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.guests.length} guest{event.guests.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Bride Phone</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.bridePhone || "-"}</p>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Groom Phone</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.groomPhone || "-"}</p>
                  </div>
                  <div className="rounded-lg border p-3 sm:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Location</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.location || "No location provided"}</p>
                  </div>
                </div>
              </div>

              <div className="ui-panel">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Event Location</h3>
                <p className="mt-3 break-all text-sm" style={{ color: "var(--text-secondary)" }}>{event.googleMapAddress || "Not provided"}</p>
                {event.googleMapAddress ? (
                  <a
                    href={event.googleMapAddress}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(to right, var(--primary), var(--primary-light))" }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open in Google Maps
                  </a>
                ) : null}
                {event.description ? (
                  <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
                ) : null}

                <div className="mt-5 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                      Invitation Card
                    </p>
                    <div className="flex items-center gap-2">
                      {event.invitationCardUrl ? (
                        <>
                          <a
                            href={event.invitationCardUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface)" }}
                            title="Open invitation card"
                            aria-label="Open invitation card"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              void handleDeleteInvitationCard();
                            }}
                            disabled={invitationCardLoading || isCompletedEvent}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
                            style={{ borderColor: "var(--error)", color: "var(--error)", background: "var(--surface)" }}
                            title="Delete invitation card"
                            aria-label="Delete invitation card"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => invitationCardInputRef.current?.click()}
                        disabled={invitationCardLoading || isCompletedEvent}
                        className="ui-button-secondary h-8 px-3 text-xs"
                      >
                        {event.invitationCardUrl ? "Replace" : "Upload"}
                      </button>
                    </div>
                  </div>

                  <input
                    ref={invitationCardInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(eventChange) => {
                      const file = eventChange.target.files?.[0];
                      if (!file) return;
                      if (isCompletedEvent) {
                        setInvitationCardError(immutableMessage);
                        return;
                      }
                      void handleInvitationCardUpload(file);
                    }}
                  />

                  {event.invitationCardUrl ? (
                    <div className="mt-3 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
                      <img src={event.invitationCardUrl} alt="Invitation card" className="h-44 w-full object-cover" />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      No invitation card uploaded.
                    </p>
                  )}

                  {invitationCardError ? (
                    <p className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>
                      {invitationCardError}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {tab === "guests" ? (
            <section className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Guest List</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {event?.guests.length || 0} guest{event?.guests.length !== 1 ? "s" : ""} invited
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddGuestDialogOpen(true)}
                  disabled={isCompletedEvent}
                  className="ui-button-primary h-10"
                >
                  Add Guest
                </button>
              </div>

              {guestFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{guestFormError}</p> : null}
              {guestFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{guestFormSuccess}</p> : null}
              {inviteError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{inviteError}</p> : null}
              {inviteSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{inviteSuccess}</p> : null}

              <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                      <input
                        type="checkbox"
                        checked={allGuestsSelected}
                        onChange={(changeEvent) => toggleSelectAllGuests(changeEvent.target.checked)}
                        disabled={isCompletedEvent}
                        className="h-4 w-4 rounded border"
                        style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
                      />
                      Select all
                    </label>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{selectedCount} selected</span>
                  </div>

                  {selectedCount > 0 ? (
                    <button
                      type="button"
                      disabled={selectedCount === 0 || inviteSubmitting || isCompletedEvent}
                      onClick={() => {
                        openInviteChannelDialog(selectedGuestIds);
                      }}
                      className="ui-button-primary h-9 px-3 text-sm"
                    >
                      {inviteSubmitting ? "Sending..." : `Send Invite (${selectedCount})`}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="ui-table rounded-lg flex min-h-0 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto md:hidden">
                  <div className="grid gap-3 p-3">
                    {paginatedGuests.map((guest) => (
                      <article key={`${guest.id}-mobile`} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                        <div className="flex items-start justify-between gap-2">
                          <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                            <input
                              type="checkbox"
                              checked={selectedGuestIds.includes(guest.id)}
                              onChange={(changeEvent) => toggleGuestSelection(guest.id, changeEvent.target.checked)}
                              disabled={isCompletedEvent}
                              className="h-4 w-4 rounded border"
                              style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
                            />
                            <span className="font-medium">{guest.name}</span>
                          </label>
                          <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${guest.invitationStatus === "SENT" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}>
                            {guest.invitationStatus === "SENT" ? "Invite sent" : "Not sent"}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                          <p>Category: {labelForCategory(guest.category)}</p>
                          <p>Phone: {guest.phone || "-"}</p>
                          <p>Email: {guest.email || "-"}</p>
                          <p>Sent via: {labelForInviteChannel(guest.invitationChannel)}</p>
                          <p>Sent at: {guest.invitationSentAt ? formatDateTime(guest.invitationSentAt) : "-"}</p>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Popover
                            open={openGuestMenuId === guest.id}
                            onOpenChange={(open) => setOpenGuestMenuId(open ? guest.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-secondary)" }}
                                aria-label="Open guest actions"
                              >
                                <MoreHorizontal size={15} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-44 p-1" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenGuestMenuId(null);
                                  setGuestFormError(null);
                                  setGuestFormSuccess(null);
                                  openGuestEditDialog(guest);
                                }}
                                disabled={isCompletedEvent}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenGuestMenuId(null);
                                  openInviteChannelDialog([guest.id]);
                                }}
                                disabled={inviteSubmitting || isCompletedEvent}
                                className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium disabled:opacity-60"
                                style={{ color: "var(--primary)" }}
                              >
                                Send invite
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenGuestMenuId(null);
                                  setGuestDeleteError(null);
                                  setGuestToDelete(guest);
                                }}
                                disabled={isCompletedEvent}
                                className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium"
                                style={{ color: "#b32543" }}
                              >
                                Delete
                              </button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 hidden flex-1 overflow-x-auto overflow-y-auto md:block">
                  <table className="min-w-[1100px] text-left text-sm">
                    <colgroup>
                      <col className="w-[72px]" />
                      <col className="w-[220px]" />
                      <col className="w-[150px]" />
                      <col className="w-[170px]" />
                      <col className="w-[260px]" />
                      <col className="w-[150px]" />
                      <col className="w-[130px]" />
                      <col className="w-[170px]" />
                      <col className="w-[120px]" />
                    </colgroup>
                    <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                      <tr>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Select</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Name</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Category</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Phone</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Email</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Invite Status</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Sent Via</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Sent At</th>
                        <th className="sticky top-0 z-10 px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedGuests.map((guest) => (
                        <tr key={guest.id} className="border-t align-middle transition" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedGuestIds.includes(guest.id)}
                              onChange={(changeEvent) => toggleGuestSelection(guest.id, changeEvent.target.checked)}
                              disabled={isCompletedEvent}
                              className="h-4 w-4 rounded border"
                              style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{guest.name}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{labelForCategory(guest.category)}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{guest.phone || "-"}</td>
                          <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{guest.email || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${guest.invitationStatus === "SENT" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}>
                              {guest.invitationStatus === "SENT" ? "Invite sent" : "Not sent"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${channelPillClasses(guest.invitationChannel)}`}>
                              {labelForInviteChannel(guest.invitationChannel)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{guest.invitationSentAt ? formatDateTime(guest.invitationSentAt) : "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <Popover
                                open={openGuestMenuId === guest.id}
                                onOpenChange={(open) => setOpenGuestMenuId(open ? guest.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                    style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-secondary)" }}
                                    aria-label="Open guest actions"
                                  >
                                    <MoreHorizontal size={15} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-44 p-1" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenGuestMenuId(null);
                                      openGuestEditDialog(guest);
                                    }}
                                    disabled={isCompletedEvent}
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface-muted)]"
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    <PencilLine size={14} />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    disabled={inviteSubmitting || isCompletedEvent}
                                    onClick={() => {
                                      setOpenGuestMenuId(null);
                                      openInviteChannelDialog([guest.id], true);
                                    }}
                                    className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{ color: "var(--secondary)" }}
                                  >
                                    <Send size={14} />
                                    Invite
                                  </button>

                                  <div className="my-1 border-t" style={{ borderColor: "var(--border-subtle)" }} />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenGuestMenuId(null);
                                      setGuestDeleteError(null);
                                      setGuestToDelete(guest);
                                    }}
                                    disabled={isCompletedEvent}
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface-muted)]"
                                    style={{ color: "#b32543" }}
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {event.guests.length === 0 ? <p className="px-4 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>No guests added yet.</p> : null}

                {event.guests.length > 0 ? (
                  <div className="flex items-center justify-between border-t px-4 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                    <p>
                      Showing {guestTotalItems === 0 ? 0 : guestStartIndex + 1}-{Math.min(guestStartIndex + guestPageSize, guestTotalItems)} of {guestTotalItems}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuestPage((current) => Math.max(1, current - 1))}
                        disabled={clampedGuestPage <= 1}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                      >
                        Previous
                      </button>
                      <span className="px-1 text-xs">Page {clampedGuestPage} / {guestTotalPages}</span>
                      <button
                        type="button"
                        onClick={() => setGuestPage((current) => Math.min(guestTotalPages, current + 1))}
                        disabled={clampedGuestPage >= guestTotalPages}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === "media" ? (
            <section className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Media Gallery</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {event?.media.length || 0} file{event?.media.length !== 1 ? "s" : ""} uploaded
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMediaUploadDialogOpen(true);
                    }}
                    className="ui-button-primary h-10"
                  >
                    Upload Media
                  </button>
                </div>
              </div>

              {mediaFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{mediaFormError}</p> : null}
              {mediaFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{mediaFormSuccess}</p> : null}

              {mediaBrowserItems.length === 0 ? (
                <p className="rounded-lg border px-4 py-5 text-sm text-zinc-600" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                  No folders or files uploaded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Path:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedMediaFolder(null)}
                        className="rounded-md border px-2.5 py-1.5 text-xs font-medium"
                        style={{
                          borderColor: selectedMediaFolder ? "var(--border-subtle)" : "var(--primary)",
                          background: selectedMediaFolder ? "var(--surface)" : "var(--primary)",
                          color: selectedMediaFolder ? "var(--text-primary)" : "white",
                        }}
                      >
                        My Drive
                      </button>
                      {selectedMediaFolder ? <span className="text-xs" style={{ color: "var(--text-secondary)" }}>/ {selectedMediaFolder}</span> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedMediaFolder ? (
                        <button
                          type="button"
                          onClick={() => setSelectedMediaFolder(null)}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface)" }}
                        >
                          Back to folders
                        </button>
                      ) : null}
                      <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                        <button
                          type="button"
                          onClick={() => setMediaViewMode("list")}
                          className="rounded px-2.5 py-1 text-xs font-medium"
                          style={{ color: mediaViewMode === "list" ? "white" : "var(--text-primary)", background: mediaViewMode === "list" ? "var(--primary)" : "transparent" }}
                        >
                          List
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaViewMode("grid")}
                          className="rounded px-2.5 py-1 text-xs font-medium"
                          style={{ color: mediaViewMode === "grid" ? "white" : "var(--text-primary)", background: mediaViewMode === "grid" ? "var(--primary)" : "transparent" }}
                        >
                          Grid
                        </button>
                      </div>
                    </div>
                  </div>

                  {mediaViewMode === "list" ? (
                    <div className="ui-table overflow-hidden">
                      <div className="grid gap-3 p-3 md:hidden">
                        {mediaBrowserItems.map((item) => (
                          <article key={`${item.id}-mobile`} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                            <p className="font-medium break-all" style={{ color: "var(--text-primary)" }}>{item.kind === "folder" ? item.name : item.file.name}</p>
                            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                              {item.kind === "folder" ? `Folder (${item.fileCount})` : item.file.type === "IMAGE" ? "Photo" : "Video"}
                            </p>
                            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                              {item.kind === "folder" ? (item.lastModified ? formatDateTime(item.lastModified) : "-") : formatDateTime(item.file.createdAt)}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              {item.kind === "folder" ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedMediaFolder(item.name)}
                                  className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                >
                                  Open folder
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewMediaItem(item.file)}
                                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                  >
                                    Preview
                                  </button>
                                  <a
                                    href={item.file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                  >
                                    Open
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void handleDeleteMedia(item.file.id);
                                    }}
                                    disabled={mediaDeleteLoadingId === item.file.id || isCompletedEvent}
                                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
                                    style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full text-left text-sm">
                          <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                            <tr>
                              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Name</th>
                              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Type</th>
                              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Modified</th>
                              <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mediaBrowserItems.map((item) => (
                              <tr key={item.id} className="border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                                <td className="px-4 py-3">
                                  {item.kind === "folder" ? (
                                    <button type="button" onClick={() => setSelectedMediaFolder(item.name)} className="flex items-center gap-2 text-left text-zinc-700 hover:underline">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" style={{ color: "var(--primary)" }} aria-hidden>
                                        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                                      </svg>
                                      <span>{item.name}</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewMediaItem(item.file)}
                                      className="flex items-center gap-2 text-left hover:underline"
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {item.file.type === "VIDEO" ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" style={{ color: "var(--text-secondary)" }} aria-hidden>
                                          <rect x="3" y="5" width="14" height="14" rx="2" />
                                          <path d="m17 10 4-2v8l-4-2z" />
                                        </svg>
                                      ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" style={{ color: "var(--text-secondary)" }} aria-hidden>
                                          <rect x="3" y="4" width="18" height="16" rx="2" />
                                          <circle cx="9" cy="10" r="1.5" />
                                          <path d="m7 17 4-4 3 3 3-4 3 5" />
                                        </svg>
                                      )}
                                      <span className="break-all">{item.file.name}</span>
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.kind === "folder" ? `Folder (${item.fileCount})` : item.file.type === "IMAGE" ? "Photo" : "Video"}</td>
                                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.kind === "folder" ? (item.lastModified ? formatDateTime(item.lastModified) : "-") : formatDateTime(item.file.createdAt)}</td>
                                <td className="px-4 py-3 text-right">
                                  {item.kind === "folder" ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMediaFolder(item.name)}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                      aria-label="Open folder"
                                      title="Open folder"
                                    >
                                      <FolderOpen size={14} />
                                    </button>
                                  ) : (
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewMediaItem(item.file)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                        style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                        aria-label="Preview media"
                                        title="Preview"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      <a
                                        href={item.file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                        style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                        aria-label="Open media in new tab"
                                        title="Open"
                                      >
                                        <ExternalLink size={14} />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          void handleDeleteMedia(item.file.id);
                                        }}
                                        disabled={mediaDeleteLoadingId === item.file.id || isCompletedEvent}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
                                        style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                                        aria-label="Delete media"
                                        title="Delete"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {mediaBrowserItems.map((item) => (
                        <div key={item.id} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                          {item.kind === "folder" ? (
                            <button type="button" onClick={() => setSelectedMediaFolder(item.name)} className="w-full text-left">
                              <div className="flex items-center gap-2">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" style={{ color: "var(--primary)" }} aria-hidden>
                                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                                </svg>
                                <p className="truncate text-sm font-medium text-zinc-700">{item.name}</p>
                              </div>
                              <p className="mt-3 text-xs text-zinc-500">{item.fileCount} file{item.fileCount !== 1 ? "s" : ""}</p>
                              <p className="mt-1 text-xs text-zinc-500">{item.lastModified ? formatDateTime(item.lastModified) : "-"}</p>
                            </button>
                          ) : (
                            <div>
                              <button type="button" onClick={() => setPreviewMediaItem(item.file)} className="block w-full">
                                <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-md border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                                  {item.file.type === "IMAGE" ? (
                                    <img src={item.file.url} alt={item.file.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <video src={item.file.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                                  )}
                                </div>
                              </button>
                              <p className="mt-2 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.file.name}</p>
                              <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>{formatDateTime(item.file.createdAt)}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewMediaItem(item.file)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                  aria-label="Preview media"
                                  title="Preview"
                                >
                                  <Eye size={14} />
                                </button>
                                <a
                                  href={item.file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                                  aria-label="Open media in new tab"
                                  title="Open"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleDeleteMedia(item.file.id);
                                  }}
                                  disabled={mediaDeleteLoadingId === item.file.id || isCompletedEvent}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
                                  style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                                  aria-label="Delete media"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : null}

          {isEditOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>Edit Event</h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Update details, schedule, and event status.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="h-8 w-8 cursor-pointer border-[var(--border-subtle)] bg-[var(--surface)] px-0 text-[var(--primary)] hover:bg-[var(--surface-muted)]"
                    aria-label="Close edit dialog"
                  >
                    <span aria-hidden className="text-lg leading-none" style={{ color: "var(--primary)" }}>
                      x
                    </span>
                  </Button>
                </div>

                <form className="space-y-4" onSubmit={handleEventEditSubmit}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block md:col-span-2 md:row-span-2">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Title *</span>
                      <input
                        value={editForm.title}
                        onChange={(event) => {
                          setEditForm((current) => ({ ...current, title: event.target.value }));
                          setEditFieldErrors((current) => ({ ...current, title: undefined }));
                        }}
                        className="ui-input"
                        required
                      />
                      {editFieldErrors.title ? (
                        <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.title}</p>
                      ) : null}
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Name</span>
                      <input value={editForm.brideName} onChange={(event) => setEditForm((current) => ({ ...current, brideName: event.target.value }))} className="ui-input" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Name</span>
                      <input value={editForm.groomName} onChange={(event) => setEditForm((current) => ({ ...current, groomName: event.target.value }))} className="ui-input" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Phone</span>
                      <PhoneInput
                        value={editForm.bridePhone}
                        onChange={(value) => {
                          setEditForm((current) => ({ ...current, bridePhone: value ?? "" }));
                          setEditFieldErrors((current) => ({ ...current, bridePhone: undefined }));
                        }}
                        defaultCountry="ET"
                        className="w-full"
                      />
                      {editFieldErrors.bridePhone ? (
                        <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.bridePhone}</p>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Phone</span>
                      <PhoneInput
                        value={editForm.groomPhone}
                        onChange={(value) => {
                          setEditForm((current) => ({ ...current, groomPhone: value ?? "" }));
                          setEditFieldErrors((current) => ({ ...current, groomPhone: undefined }));
                        }}
                        defaultCountry="ET"
                        className="w-full"
                      />
                      {editFieldErrors.groomPhone ? (
                        <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.groomPhone}</p>
                      ) : null}
                    </label>

                    <div className="rounded-xl border p-3 md:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Schedule *</span>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Local time</span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Date</span>
                          <input
                            type="date"
                            value={editForm.eventDate}
                            min={minEventDate}
                            onChange={(event) => {
                              setEditForm((current) => ({ ...current, eventDate: event.target.value }));
                              setEditFieldErrors((current) => ({ ...current, eventDate: undefined }));
                            }}
                            className="ui-input"
                            required
                          />
                          {editFieldErrors.eventDate ? (
                            <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.eventDate}</p>
                          ) : null}
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Time</span>
                          <input
                            type="time"
                            value={editForm.eventTime}
                            onChange={(event) => {
                              setEditForm((current) => ({ ...current, eventTime: event.target.value }));
                              setEditFieldErrors((current) => ({ ...current, eventTime: undefined }));
                            }}
                            className="ui-input"
                            required
                          />
                          {editFieldErrors.eventTime ? (
                            <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.eventTime}</p>
                          ) : null}
                        </label>
                      </div>

                      <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {editSchedulePreview ? `Scheduled for ${editSchedulePreview}` : "Pick a valid date and time."}
                      </p>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Location</span>
                      <input value={editForm.location} onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))} className="ui-input" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Google Map Address</span>
                      <input
                        value={editForm.googleMapAddress}
                        onChange={(event) => {
                          setEditForm((current) => ({ ...current, googleMapAddress: event.target.value }));
                          setEditFieldErrors((current) => ({ ...current, googleMapAddress: undefined }));
                        }}
                        className="ui-input"
                      />
                      {editFieldErrors.googleMapAddress ? (
                        <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.googleMapAddress}</p>
                      ) : null}
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Description</span>
                      <textarea value={editForm.description} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} className="ui-textarea" />
                    </label>
                  </div>

                  {editError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{editError}</p> : null}
                  {editSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{editSuccess}</p> : null}

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => setIsEditOpen(false)} className="ui-button-secondary">Cancel</button>
                    <button type="submit" disabled={editSubmitting} className="ui-button-primary">{editSubmitting ? "Saving..." : "Save changes"}</button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

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
              await loadEvent(false);
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

          {previewMediaItem ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
              <div className="w-full max-w-4xl rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--primary)" }}>{previewMediaItem.name}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{previewMediaItem.folder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={previewMediaItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}
                      aria-label="Open media in new tab"
                      title="Open"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteMedia(previewMediaItem.id);
                      }}
                      disabled={mediaDeleteLoadingId === previewMediaItem.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-60"
                      style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                      aria-label="Delete media"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMediaItem(null)}
                      className="inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-medium"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface)" }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex max-h-[72vh] items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                  {previewMediaItem.type === "IMAGE" ? (
                    <img src={previewMediaItem.url} alt={previewMediaItem.name} className="max-h-[72vh] w-auto max-w-full object-contain" />
                  ) : (
                    <video src={previewMediaItem.url} controls className="max-h-[72vh] w-full bg-black object-contain" />
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {isInviteChannelDialogOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
                <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Choose Invite Method</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Send invitation for {pendingInviteGuestIds.length} guest{pendingInviteGuestIds.length !== 1 ? "s" : ""} using:
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Telegram will auto-fallback to WhatsApp for guests who have not started the bot.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      void confirmInviteChannel("WHATSAPP");
                    }}
                    className="rounded-md border px-3 py-2 text-sm font-medium transition hover:opacity-90"
                    style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void confirmInviteChannel("TELEGRAM");
                    }}
                    className="rounded-md border px-3 py-2 text-sm font-medium transition hover:opacity-90"
                    style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}
                  >
                    Telegram
                  </button>
                </div>

                <div className="mt-5 flex justify-end border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteChannelDialogOpen(false);
                      setPendingInviteGuestIds([]);
                      setPendingInviteOpenFirst(false);
                    }}
                    className="ui-button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {editingGuest ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="mb-5">
                  <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Edit Guest</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Update guest details and category.</p>
                </div>

                <form className="space-y-3" onSubmit={handleGuestEditSubmit}>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Guest Name *</span>
                    <input
                      value={guestEditForm.name}
                      onChange={(event) => setGuestEditForm((current) => ({ ...current, name: event.target.value }))}
                      className="ui-input"
                      required
                      disabled={guestEditLoading}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Phone</span>
                    <PhoneInput
                      value={guestEditForm.phone}
                      onChange={(value) => setGuestEditForm((current) => ({ ...current, phone: value ?? "" }))}
                      defaultCountry="ET"
                      className="w-full"
                      disabled={guestEditLoading}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Email</span>
                    <input
                      type="email"
                      value={guestEditForm.email}
                      onChange={(event) => setGuestEditForm((current) => ({ ...current, email: event.target.value }))}
                      className="ui-input"
                      disabled={guestEditLoading}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Category</span>
                    <select
                      value={guestEditForm.category}
                      onChange={(event) =>
                        setGuestEditForm((current) => ({
                          ...current,
                          category: event.target.value as GuestCategory,
                        }))
                      }
                      className="ui-select"
                      disabled={guestEditLoading}
                    >
                      <option value="GENERAL">General Guest</option>
                      <option value="BRIDE_GUEST">Bride Guest</option>
                      <option value="GROOM_GUEST">Groom Guest</option>
                    </select>
                  </label>

                  {guestEditError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{guestEditError}</p> : null}

                  <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                    <button type="button" className="ui-button-secondary" onClick={closeGuestEditDialog} disabled={guestEditLoading}>
                      Cancel
                    </button>
                    <button type="submit" className="ui-button-primary" disabled={guestEditLoading}>
                      {guestEditLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          {guestToDelete ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="mb-5">
                  <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Delete Guest</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Are you sure you want to remove {guestToDelete.name} from this event?
                  </p>
                </div>

                <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#f6b1be", background: "#fff0f4", color: "#b32543" }}>
                  This action cannot be undone.
                </div>

                {guestDeleteError ? <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{guestDeleteError}</p> : null}

                <div className="mt-4 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <button
                    type="button"
                    className="ui-button-secondary"
                    onClick={() => {
                      if (guestDeleteLoading) return;
                      setGuestToDelete(null);
                      setGuestDeleteError(null);
                    }}
                    disabled={guestDeleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                    onClick={() => void handleGuestDelete()}
                    disabled={guestDeleteLoading}
                  >
                    {guestDeleteLoading ? "Deleting..." : "Delete Guest"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}

