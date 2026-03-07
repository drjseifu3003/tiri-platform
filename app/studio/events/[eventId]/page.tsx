"use client";

import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

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
  status?: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  isPublished: boolean;
  guests: GuestItem[];
  media: MediaItem[];
};

type EventResponse = { event: EventDetail };

type EventTab = "overview" | "guests" | "media" | "gifts";

type GuestCategory = "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
type MediaType = "IMAGE" | "VIDEO";
type InviteChannel = "WHATSAPP" | "TELEGRAM" | "SMS";
type SocialPlatform = "INSTAGRAM" | "FACEBOOK" | "TIKTOK";

type InviteResponse = {
  results: Array<{
    guestId: string;
    guestName: string;
    channel: InviteChannel;
    shareUrl: string | null;
    status: "sent" | "skipped";
    reason: string | null;
  }>;
  summary: {
    requested: number;
    sent: number;
    skipped: number;
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

function labelForSocialPlatform(platform: SocialPlatform) {
  if (platform === "INSTAGRAM") return "Instagram";
  if (platform === "FACEBOOK") return "Facebook";
  return "TikTok";
}

function socialPlatformIcon(platform: SocialPlatform, className = "h-4 w-4") {
  if (platform === "INSTAGRAM") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.1" className={`${className} shrink-0`} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="var(--primary)" stroke="none" />
      </svg>
    );
  }

  if (platform === "FACEBOOK") {
    return (
      <svg viewBox="0 0 24 24" fill="var(--primary)" className={`${className} shrink-0`} aria-hidden>
        <path d="M13.2 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.1V13h2.7v8h3.4z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="var(--primary)" className={`${className} shrink-0`} aria-hidden>
      <path d="M16.9 6.6c-1.2-.8-2-2.1-2.2-3.6h-2.9v12.4c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.2 0 .4 0 .6.1V10.6c-.2 0-.4-.1-.6-.1-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9 4.9-2.2 4.9-4.9V9.1c1 .8 2.3 1.2 3.6 1.2V7.4c-.5 0-1-.2-1.4-.8z" />
    </svg>
  );
}

function socialMediaRequirement(platform: SocialPlatform, kind: "IMAGE" | "VIDEO" | null) {
  if (platform === "INSTAGRAM") {
    return kind === "VIDEO"
      ? "Instagram video: 9:16 recommended, max 60s for feed, keep under 100 MB for quick upload."
      : "Instagram image: 1080x1350 (4:5) recommended, JPG/PNG, keep under 10 MB.";
  }

  if (platform === "FACEBOOK") {
    return kind === "VIDEO"
      ? "Facebook video: 1080x1080 or 1080x1350 recommended, MP4/MOV, keep under 200 MB for reliable upload."
      : "Facebook image: 1200x630 minimum for strong preview, JPG/PNG, keep under 10 MB.";
  }

  return kind === "VIDEO"
    ? "TikTok video: 9:16 vertical, MP4/MOV/WEBM, keep under 287 MB and ideally 10-60 seconds."
    : "TikTok photo mode: 1080x1920 recommended, JPG/PNG, keep under 10 MB.";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
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
  const [bulkInviteChannel, setBulkInviteChannel] = useState<InviteChannel>("WHATSAPP");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
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
    status: "DRAFT" as "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED",
  });

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<SocialPlatform>("INSTAGRAM");
  const [shareText, setShareText] = useState("");
  const [shareUploadFile, setShareUploadFile] = useState<File | null>(null);
  const [shareUploadKind, setShareUploadKind] = useState<"IMAGE" | "VIDEO" | null>(null);
  const [shareUploadPreview, setShareUploadPreview] = useState<string | null>(null);
  const [shareUploadError, setShareUploadError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const [mediaForm, setMediaForm] = useState({
    type: "IMAGE" as MediaType,
    url: "",
    groupLabel: "",
  });
  const [mediaFormError, setMediaFormError] = useState<string | null>(null);
  const [mediaFormSuccess, setMediaFormSuccess] = useState<string | null>(null);
  const [mediaSubmitting, setMediaSubmitting] = useState(false);

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
    if (requestedTab === "overview" || requestedTab === "guests" || requestedTab === "media" || requestedTab === "gifts") {
      setTab(requestedTab);
    }
  }, [searchParams]);

  const checkedInCount = useMemo(() => {
    return event?.guests.filter((guest) => guest.checkedIn).length ?? 0;
  }, [event]);

  const mediaByGroup = useMemo(() => {
    const groups: Record<string, MediaItem[]> = {};

    for (const item of event?.media ?? []) {
      const key = item.groupLabel?.trim() || "Ungrouped";
      groups[key] = [...(groups[key] ?? []), item];
    }

    return Object.entries(groups).sort(([left], [right]) => left.localeCompare(right));
  }, [event?.media]);

  const selectedCount = selectedGuestIds.length;
  const allGuestsSelected = !!event && event.guests.length > 0 && selectedCount === event.guests.length;
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
    return () => {
      if (shareUploadPreview) {
        URL.revokeObjectURL(shareUploadPreview);
      }
    };
  }, [shareUploadPreview]);

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
    if (!event) return;
    setSelectedGuestIds(checked ? event.guests.map((guest) => guest.id) : []);
  }

  async function sendInvites(guestIds: string[], channel: InviteChannel, openFirst = false) {
    if (!event || guestIds.length === 0) return;

    setInviteSubmitting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const response = await fetch(`/api/studio/events/${event.id}/invites`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestIds, channel }),
      });

      if (!response.ok) {
        setInviteError("Unable to send invitations. Please try again.");
        return;
      }

      const payload = (await response.json()) as InviteResponse;
      const sentItems = payload.results.filter((item) => item.status === "sent" && item.shareUrl);

      if (openFirst && sentItems[0]?.shareUrl) {
        window.open(sentItems[0].shareUrl, "_blank", "noopener,noreferrer");
      }

      setInviteSuccess(
        `Invites processed: ${payload.summary.sent} sent, ${payload.summary.skipped} skipped via ${labelForInviteChannel(
          channel
        )}.`
      );

      await loadEvent(false);
    } catch {
      setInviteError("Unable to send invitations right now.");
    } finally {
      setInviteSubmitting(false);
    }
  }

  function openEditModal() {
    if (!event) return;

    const parsedDate = new Date(event.eventDate);

    setEditError(null);
    setEditSuccess(null);
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
      status: resolveEventStatus(event),
    });
    setIsEditOpen(true);
  }

  async function handleEventEditSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;

    setEditError(null);
    setEditSuccess(null);

    if (editForm.title.trim().length < 2) {
      setEditError("Event title must be at least 2 characters.");
      return;
    }

    if (!editForm.eventDate) {
      setEditError("Event date is required.");
      return;
    }

    if (!editForm.eventTime) {
      setEditError("Event time is required.");
      return;
    }

    const parsedEventDate = new Date(`${editForm.eventDate}T${editForm.eventTime}`);
    if (!isValidDate(parsedEventDate)) {
      setEditError("Please provide a valid event schedule.");
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
          bridePhone: editForm.bridePhone.trim() || undefined,
          groomPhone: editForm.groomPhone.trim() || undefined,
          eventDate: parsedEventDate.toISOString(),
          location: editForm.location.trim() || null,
          googleMapAddress: editForm.googleMapAddress.trim() || undefined,
          description: editForm.description.trim() || null,
          status: editForm.status,
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

  async function handleQuickStatusChange(nextStatus: "SCHEDULED" | "LIVE" | "COMPLETED") {
    if (!event) return;

    setStatusActionError(null);
    setStatusUpdating(true);

    try {
      const response = await fetch(`/api/studio/events/${event.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
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

  function openShareModal(platform: SocialPlatform) {
    if (!event) return;

    setSharePlatform(platform);
    setShareText(
      event.description?.trim() ||
        `${event.title}${event.location ? ` - ${event.location}` : ""} (${formatDateTime(event.eventDate)})`
    );
    setShareUploadFile(null);
    setShareUploadKind(null);
    setShareUploadError(null);
    if (shareUploadPreview) {
      URL.revokeObjectURL(shareUploadPreview);
    }
    setShareUploadPreview(null);
    setShareCopied(false);
    setIsShareOpen(true);
  }

  function handleShareUploadChange(changeEvent: React.ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0];
    if (!file) return;

    setShareUploadError(null);

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setShareUploadError("Only image or video files are allowed.");
      return;
    }

    const maxBytes = isImage ? 10 * 1024 * 1024 : 200 * 1024 * 1024;
    if (file.size > maxBytes) {
      setShareUploadError(`File too large. ${isImage ? "Image" : "Video"} must be under ${isImage ? "10 MB" : "200 MB"}.`);
      return;
    }

    if (shareUploadPreview) {
      URL.revokeObjectURL(shareUploadPreview);
    }

    setShareUploadFile(file);
    setShareUploadKind(isImage ? "IMAGE" : "VIDEO");
    setShareUploadPreview(URL.createObjectURL(file));
  }

  function handleOpenSocialShare() {
    const url =
      sharePlatform === "INSTAGRAM"
        ? "https://www.instagram.com/"
        : sharePlatform === "FACEBOOK"
          ? "https://www.facebook.com/"
          : "https://www.tiktok.com/upload";
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copySharePayload() {
    const payload = [
      shareText.trim(),
      shareUploadFile ? `Media file: ${shareUploadFile.name}` : "",
      shareUploadKind ? `Media type: ${shareUploadKind}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    if (!payload) return;

    try {
      await navigator.clipboard.writeText(payload);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  }

  async function handleSingleGuestSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;

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
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading wedding details...</p>
      </main>
    );
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--border-subtle)", background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/studio/events" className="text-xs font-medium" style={{ color: "var(--secondary)" }}>
              {"<- Back to Events"}
            </Link>
            <h2 className="ui-title mt-1">{event?.title ?? "Wedding Details"}</h2>
            <p className="ui-subtitle">A modern overview for schedule, guests, media, and sharing.</p>
          </div>

          <button
            type="button"
            onClick={openEditModal}
            disabled={!event || loading}
            className="ui-button-primary h-10"
          >
            Edit Event
          </button>
        </div>

        {!loading && event ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${eventStatusPillClasses(resolveEventStatus(event))}`}>
              {eventStatusLabel(resolveEventStatus(event))}
            </span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Quick status:</span>
            {[
              { value: "SCHEDULED", label: "Scheduled" },
              { value: "LIVE", label: "Live" },
              { value: "COMPLETED", label: "Complete" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  void handleQuickStatusChange(item.value as "SCHEDULED" | "LIVE" | "COMPLETED");
                }}
                disabled={statusUpdating || resolveEventStatus(event) === item.value}
                className="rounded-lg border px-2.5 py-1.5 text-xs font-medium"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-primary)" }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading wedding details...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : !event ? (
        <p className="mt-5 text-sm text-zinc-600">Wedding not found.</p>
      ) : (
        <>
          {statusActionError ? <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{statusActionError}</p> : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Event date</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>{formatDateTime(event.eventDate)}</p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Guests checked in</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>
                {checkedInCount} / {event.guests.length}
              </p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Media files</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>{event.media.length}</p>
            </div>
          </div>

          <div className="mt-5 inline-flex flex-wrap gap-2 rounded-xl border p-1.5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            {[
              ["overview", "Overview"],
              ["guests", "Guests"],
              ["media", "Media"],
              ["gifts", "Gifts"],
            ].map(([value, label]) => {
              const active = tab === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value as EventTab)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    active ? "text-white shadow-sm" : "text-zinc-600 hover:opacity-80"
                  }`}
                  style={
                    active
                      ? { background: "linear-gradient(to right, var(--primary), var(--primary-light))" }
                      : { background: "transparent" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {tab === "overview" ? (
            <section className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="ui-panel">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Wedding Overview</h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Status</p>
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${eventStatusPillClasses(resolveEventStatus(event))}`}>
                      {eventStatusLabel(resolveEventStatus(event))}
                    </span>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Couple</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {[event.brideName, event.groomName].filter(Boolean).join(" & ") || "Pending names"}
                    </p>
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
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Google Map Address</h3>
                <p className="mt-3 break-all text-sm" style={{ color: "var(--text-secondary)" }}>{event.googleMapAddress || "Not provided"}</p>
                {event.googleMapAddress ? (
                  <a
                    href={event.googleMapAddress}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-md px-3 py-1.5 text-xs font-medium text-white"
                    style={{ background: "linear-gradient(to right, var(--primary), var(--primary-light))" }}
                  >
                    Open in Google Maps
                  </a>
                ) : null}
                {event.description ? (
                  <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
                ) : null}

                <div className="mt-4 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Share Event</p>
                  <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    Share custom post content with uploaded image/video (no links).
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openShareModal("INSTAGRAM")} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium" style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}>{socialPlatformIcon("INSTAGRAM")}Instagram</button>
                    <button type="button" onClick={() => openShareModal("FACEBOOK")} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium" style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}>{socialPlatformIcon("FACEBOOK")}Facebook</button>
                    <button type="button" onClick={() => openShareModal("TIKTOK")} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium" style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "var(--surface-muted)" }}>{socialPlatformIcon("TIKTOK")}TikTok</button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {tab === "guests" ? (
            <section className="mt-5 space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <form className="ui-panel space-y-3" onSubmit={handleSingleGuestSubmit}>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Add Single Guest</h3>
                  <input
                    value={singleGuest.name}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, name: changeEvent.target.value }))}
                    placeholder="Guest full name"
                    className="ui-input"
                    required
                  />
                  <input
                    value={singleGuest.phone}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, phone: changeEvent.target.value }))}
                    placeholder="Phone number"
                    className="ui-input"
                  />
                  <input
                    type="email"
                    value={singleGuest.email}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, email: changeEvent.target.value }))}
                    placeholder="Email"
                    className="ui-input"
                  />
                  <select
                    value={singleGuest.category}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, category: changeEvent.target.value as GuestCategory }))}
                    className="ui-select"
                  >
                    <option value="GENERAL">General</option>
                    <option value="BRIDE_GUEST">Bride Guest</option>
                    <option value="GROOM_GUEST">Groom Guest</option>
                  </select>
                  <button type="submit" disabled={guestSubmitting} className="ui-button-primary">
                    {guestSubmitting ? "Adding..." : "Add Guest"}
                  </button>
                </form>

                <form className="ui-panel space-y-3" onSubmit={handleBulkGuestSubmit}>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Bulk Add Guests</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    One guest per line: Name, Phone, Email
                  </p>
                  <textarea
                    value={bulkGuestText}
                    onChange={(changeEvent) => setBulkGuestText(changeEvent.target.value)}
                    className="ui-textarea"
                    placeholder={"Abebe Kebede,+251900000000,abebe@example.com\nMimi Alemu,+251911111111,mimi@example.com"}
                  />
                  <button type="submit" disabled={guestSubmitting} className="ui-button-primary">
                    {guestSubmitting ? "Importing..." : "Import Guests"}
                  </button>
                </form>
              </div>

              {guestFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{guestFormError}</p> : null}
              {guestFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{guestFormSuccess}</p> : null}
              {inviteError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{inviteError}</p> : null}
              {inviteSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{inviteSuccess}</p> : null}

              <div className="ui-panel flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                    <input
                      type="checkbox"
                      checked={allGuestsSelected}
                      onChange={(changeEvent) => toggleSelectAllGuests(changeEvent.target.checked)}
                      className="h-4 w-4 rounded border"
                      style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
                    />
                    Select all guests
                  </label>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{selectedCount} selected</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={bulkInviteChannel}
                    onChange={(changeEvent) => setBulkInviteChannel(changeEvent.target.value as InviteChannel)}
                    className="ui-select h-9 w-40"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="TELEGRAM">Telegram</option>
                    <option value="SMS">SMS</option>
                  </select>
                  <button
                    type="button"
                    disabled={selectedCount === 0 || inviteSubmitting}
                    onClick={() => {
                      void sendInvites(selectedGuestIds, bulkInviteChannel);
                    }}
                    className="ui-button-primary h-9"
                  >
                    {inviteSubmitting ? "Sending..." : `Send to selected (${selectedCount})`}
                  </button>
                </div>
              </div>

              <div className="ui-table">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Select</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Name</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Category</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Phone</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Email</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Invite Status</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Sent Via</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Sent At</th>
                        <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide">Invite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.guests.map((guest) => (
                        <tr key={guest.id} className="border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedGuestIds.includes(guest.id)}
                              onChange={(changeEvent) => toggleGuestSelection(guest.id, changeEvent.target.checked)}
                              className="h-4 w-4 rounded border"
                              style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
                            />
                          </td>
                          <td className="px-4 py-3 text-zinc-700">{guest.name}</td>
                          <td className="px-4 py-3 text-zinc-600">{labelForCategory(guest.category)}</td>
                          <td className="px-4 py-3 text-zinc-600">{guest.phone || "—"}</td>
                          <td className="px-4 py-3 text-zinc-600">{guest.email || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${guest.invitationStatus === "SENT" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}>
                              {guest.invitationStatus === "SENT" ? "Invite sent" : "Not sent"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${channelPillClasses(guest.invitationChannel)}`}>
                              {labelForInviteChannel(guest.invitationChannel)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-600">{guest.invitationSentAt ? formatDateTime(guest.invitationSentAt) : "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                disabled={inviteSubmitting}
                                onClick={() => {
                                  void sendInvites([guest.id], "WHATSAPP", true);
                                }}
                                className="rounded-md border px-2 py-1 text-xs font-medium"
                                style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}
                              >
                                WhatsApp
                              </button>
                              <button
                                type="button"
                                disabled={inviteSubmitting}
                                onClick={() => {
                                  void sendInvites([guest.id], "TELEGRAM", true);
                                }}
                                className="rounded-md border px-2 py-1 text-xs font-medium"
                                style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}
                              >
                                Telegram
                              </button>
                              <button
                                type="button"
                                disabled={inviteSubmitting}
                                onClick={() => {
                                  void sendInvites([guest.id], "SMS", true);
                                }}
                                className="rounded-md border px-2 py-1 text-xs font-medium"
                                style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}
                              >
                                SMS
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {event.guests.length === 0 ? <p className="px-4 py-5 text-sm text-zinc-600">No guests added yet.</p> : null}
              </div>
            </section>
          ) : null}

          {tab === "media" ? (
            <section className="mt-5 space-y-4">
              <form className="ui-panel grid gap-3 md:grid-cols-4" onSubmit={handleMediaUploadSubmit}>
                <select
                  value={mediaForm.type}
                  onChange={(changeEvent) => setMediaForm((current) => ({ ...current, type: changeEvent.target.value as MediaType }))}
                  className="ui-select"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
                <input
                  value={mediaForm.groupLabel}
                  onChange={(changeEvent) => setMediaForm((current) => ({ ...current, groupLabel: changeEvent.target.value }))}
                  placeholder="Group (Photoshoot, Wedding, Reception)"
                  className="ui-input"
                />
                <input
                  value={mediaForm.url}
                  onChange={(changeEvent) => setMediaForm((current) => ({ ...current, url: changeEvent.target.value }))}
                  placeholder="https://..."
                  className="ui-input md:col-span-2"
                  required
                />
                <button type="submit" disabled={mediaSubmitting} className="ui-button-primary md:col-span-4 md:w-fit">
                  {mediaSubmitting ? "Uploading..." : "Upload Media"}
                </button>
              </form>

              {mediaFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{mediaFormError}</p> : null}
              {mediaFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{mediaFormSuccess}</p> : null}

              {mediaByGroup.length === 0 ? (
                <p className="rounded-lg border px-4 py-5 text-sm text-zinc-600" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                  No media uploaded yet.
                </p>
              ) : (
                mediaByGroup.map(([group, items]) => (
                  <div key={group} className="ui-table">
                    <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>{group}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{items.length} item(s)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                          <tr>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Type</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Uploaded</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                              <td className="px-4 py-3 text-zinc-700">{item.type}</td>
                              <td className="px-4 py-3 text-zinc-600">{formatDateTime(item.createdAt)}</td>
                              <td className="px-4 py-3 text-zinc-600 break-all">
                                <a href={item.url} target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--secondary)" }}>
                                  Open media
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </section>
          ) : null}

          {tab === "gifts" ? (
            <section className="mt-5 ui-panel">
              <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Gifts</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                No gifts recorded for this wedding yet.
              </p>
            </section>
          ) : null}

          {isEditOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
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
                      ×
                    </span>
                  </Button>
                </div>

                <form className="space-y-4" onSubmit={handleEventEditSubmit}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block md:col-span-2 md:row-span-2">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Title *</span>
                      <input value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} className="ui-input" required />
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
                      <input value={editForm.bridePhone} onChange={(event) => setEditForm((current) => ({ ...current, bridePhone: event.target.value }))} className="ui-input" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Phone</span>
                      <input value={editForm.groomPhone} onChange={(event) => setEditForm((current) => ({ ...current, groomPhone: event.target.value }))} className="ui-input" />
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
                            onChange={(event) => setEditForm((current) => ({ ...current, eventDate: event.target.value }))}
                            className="ui-input"
                            required
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Time</span>
                          <input
                            type="time"
                            value={editForm.eventTime}
                            onChange={(event) => setEditForm((current) => ({ ...current, eventTime: event.target.value }))}
                            className="ui-input"
                            required
                          />
                        </label>
                      </div>

                      <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {editSchedulePreview ? `Scheduled for ${editSchedulePreview}` : "Pick a valid date and time."}
                      </p>
                    </div>

                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Status</span>
                      <select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as typeof current.status }))} className="ui-input">
                        <option value="DRAFT">Draft</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="LIVE">Live</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Location</span>
                      <input value={editForm.location} onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))} className="ui-input" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Google Map Address</span>
                      <input value={editForm.googleMapAddress} onChange={(event) => setEditForm((current) => ({ ...current, googleMapAddress: event.target.value }))} className="ui-input" />
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

          {isShareOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-white shadow-xl" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="border-b px-5 py-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--primary-lighter)", color: "var(--primary)" }}>
                        {socialPlatformIcon(sharePlatform, "h-4 w-4")}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Share to {labelForSocialPlatform(sharePlatform)}</h3>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Create a polished post package: caption plus uploaded image or video.</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsShareOpen(false)}
                      className="h-8 w-8 cursor-pointer border-[var(--border-subtle)] bg-[var(--surface)] px-0 text-[var(--primary)] hover:bg-[var(--surface-muted)]"
                      aria-label="Close share dialog"
                    >
                      <span aria-hidden className="text-lg leading-none" style={{ color: "var(--primary)" }}>
                        ×
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(["INSTAGRAM", "FACEBOOK", "TIKTOK"] as SocialPlatform[]).map((platform) => {
                      const active = sharePlatform === platform;
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => setSharePlatform(platform)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition"
                          style={
                            active
                              ? { borderColor: "var(--primary)", color: "var(--primary)", background: "var(--primary-lighter)" }
                              : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface)" }
                          }
                        >
                          {socialPlatformIcon(platform, "h-4 w-4")}
                          <span>{labelForSocialPlatform(platform)}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Recommended Spec</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{socialMediaRequirement(sharePlatform, shareUploadKind)}</p>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Post caption</span>
                    <textarea value={shareText} onChange={(event) => setShareText(event.target.value)} className="ui-textarea" placeholder="Write your post caption" />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Upload media</span>
                    <input type="file" accept="image/*,video/*" onChange={handleShareUploadChange} className="ui-input" />
                  </label>

                  {shareUploadError ? (
                    <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>
                      {shareUploadError}
                    </p>
                  ) : null}

                  {shareUploadFile ? (
                    <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{shareUploadFile.name}</p>
                        <span className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>{formatBytes(shareUploadFile.size)}</span>
                      </div>
                      {shareUploadPreview && shareUploadKind === "IMAGE" ? (
                        <img src={shareUploadPreview} alt="Share preview" className="mt-2 max-h-52 w-full rounded-md border object-contain" style={{ borderColor: "var(--border-subtle)" }} />
                      ) : null}
                      {shareUploadPreview && shareUploadKind === "VIDEO" ? (
                        <video src={shareUploadPreview} controls className="mt-2 max-h-52 w-full rounded-md border" style={{ borderColor: "var(--border-subtle)" }} />
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                    <button type="button" onClick={() => setIsShareOpen(false)} className="ui-button-secondary">Cancel</button>
                    <button type="button" onClick={copySharePayload} className="ui-button-secondary">{shareCopied ? "Copied" : "Copy content"}</button>
                    <button type="button" onClick={handleOpenSocialShare} className="ui-button-primary inline-flex items-center gap-1.5">{socialPlatformIcon(sharePlatform, "h-4 w-4")}Open {labelForSocialPlatform(sharePlatform)}</button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
