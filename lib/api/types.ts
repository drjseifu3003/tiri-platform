export type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export type ApiPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrev?: boolean;
  hasNext?: boolean;
};

export type EventStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

export type StudioEventListItem = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone?: string | null;
  groomPhone?: string | null;
  eventDate: string;
  location: string | null;
  status?: EventStatus;
  isPublished?: boolean;
  _count?: {
    guests: number;
    media: number;
  };
};

export type StudioEventsResponse<TEvent = StudioEventListItem> = {
  events: TEvent[];
  pagination?: ApiPagination;
  checkedInByEvent?: Record<string, number>;
};

export type StudioMediaItem = {
  id: string;
  eventId: string;
  createdAt: string;
};

export type StudioMediaResponse = {
  media: StudioMediaItem[];
};

export type TeamRole = "EDITOR" | "CUSTOMER_SERVICE" | "EVENT_PLANNER" | "PHOTO_CREW";

export type TeamMember = {
  id: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  teamRole: TeamRole;
  createdAt: string;
};

export type TeamResponse = {
  members: TeamMember[];
};

export type AccountSettingsResponse = {
  user: {
    id: string;
    phone: string;
    role: "ADMIN" | "STAFF";
  };
  studio: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    logoUrl: string | null;
    primaryColor: string | null;
  } | null;
};

export type InvitationGuest = {
  id: string;
  name: string;
  phone: string | null;
  invitationCode: string;
  profile: {
    telegramChatId: string | null;
    rsvpStatus: "PENDING" | "ATTENDING" | "NOT_ATTENDING";
  };
};

export type InvitationGuestsResponse = {
  event: {
    id: string;
    title: string;
  };
  guests: InvitationGuest[];
};

export type WhatsAppBatchInviteResponse = {
  results: Array<{
    guestId: string;
    guestName: string;
    status: "READY" | "SKIPPED";
    reason?: string;
    whatsappLink?: string;
  }>;
  summary: {
    ready: number;
    skipped: number;
  };
};

export type TelegramInviteResponse = {
  results: Array<{
    guestId: string;
    guestName: string;
    status: "SENT" | "SKIPPED" | "FAILED";
    reason?: string;
  }>;
  summary: {
    sent: number;
    skipped: number;
    failed: number;
  };
};

export type InvitePayload = {
  guest: {
    id: string;
    name: string;
    profile: {
      rsvpStatus: "PENDING" | "ATTENDING" | "NOT_ATTENDING";
      rsvpPlusOne: number;
    };
  };
  event: {
    title: string;
    brideName: string | null;
    groomName: string | null;
    eventDate: string;
    location: string | null;
    description: string | null;
    googleMapAddress: string;
  };
};
