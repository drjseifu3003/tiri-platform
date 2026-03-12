export type RsvpStatus = "PENDING" | "ATTENDING" | "NOT_ATTENDING";

export type GuestMessagingProfile = {
  guestId: string;
  telegramChatId: string | null;
  telegramUsername: string | null;
  rsvpStatus: RsvpStatus;
  rsvpPlusOne: number;
  rsvpRespondedAt: string | null;
};

export type InvitationGuest = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  invitationCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  brideName: string | null;
  groomName: string | null;
  invitationCardUrl: string | null;
  profile: GuestMessagingProfile;
};

export type MessageChannel = "WHATSAPP" | "TELEGRAM";
