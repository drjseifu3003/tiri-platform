import { prisma } from "@/lib/prisma";
import {
  getProfilesByGuestIds,
  isMessagingProfileTableMissing,
  updateRsvpProfile,
  upsertTelegramProfile,
  withDefaultProfile,
} from "@/modules/wedding-messaging/storage";
import {
  buildInvitationMessage,
  buildInviteUrl,
  buildTelegramBotStartLink,
  buildWhatsAppLink,
} from "@/modules/wedding-messaging/templates";
import { InvitationGuest, MessageChannel, RsvpStatus } from "@/modules/wedding-messaging/types";

const INVITATION_CARD_LABEL = "INVITATION_CARD";

function isGuestInvitationMissingColumn(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42703";
}

async function appendGuestInvitationLog(input: {
  guestId: string;
  eventId: string;
  channel: MessageChannel;
  status: string;
  message: string;
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO "GuestInvitation" ("guestId", "eventId", "channel", "status", "sentAt", "message", "createdAt")
      VALUES (${input.guestId}, ${input.eventId}, ${input.channel}, ${input.status}, NOW(), ${input.message}, NOW())
    `;
  } catch (error) {
    if (isGuestInvitationMissingColumn(error)) return;
    throw error;
  }
}

export async function listInvitationGuests(input: { studioId: string; eventId: string }) {
  const event = await prisma.event.findFirst({
    where: { id: input.eventId, studioId: input.studioId },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
      brideName: true,
      groomName: true,
      media: {
        where: { groupLabel: INVITATION_CARD_LABEL },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          url: true,
        },
      },
      guests: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          invitationCode: true,
          eventId: true,
        },
      },
    },
  });

  if (!event) return null;

  let profileMap = new Map();
  try {
    profileMap = await getProfilesByGuestIds(event.guests.map((guest) => guest.id));
  } catch (error) {
    if (!isMessagingProfileTableMissing(error)) throw error;
  }

  const guests: InvitationGuest[] = event.guests.map((guest) => ({
    id: guest.id,
    name: guest.name,
    phone: guest.phone,
    email: guest.email,
    invitationCode: guest.invitationCode,
    eventId: guest.eventId,
    eventTitle: event.title,
    eventDate: event.eventDate.toISOString(),
    eventLocation: event.location,
    brideName: event.brideName,
    groomName: event.groomName,
    invitationCardUrl: event.media[0]?.url ?? null,
    profile: withDefaultProfile(guest.id, profileMap.get(guest.id)),
  }));

  return {
    event: {
      id: event.id,
      title: event.title,
      eventDate: event.eventDate.toISOString(),
      location: event.location,
      brideName: event.brideName,
      groomName: event.groomName,
    },
    guests,
  };
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function resolveInviteBaseUrl(requestOrigin: string) {
  const baseUrlFromEnv =
    process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

  if (baseUrlFromEnv.trim()) {
    return normalizeBaseUrl(baseUrlFromEnv.trim());
  }

  return normalizeBaseUrl(requestOrigin);
}

function toAppBaseOwnedUrl(input: { value: string | null; baseUrl: string }) {
  if (!input.value) return null;

  try {
    const parsed = new URL(input.value);
    if (parsed.pathname.startsWith("/api/uploads/")) {
      return `${input.baseUrl}${parsed.pathname}${parsed.search}`;
    }
    return input.value;
  } catch {
    const normalized = input.value.startsWith("/") ? input.value : `/${input.value}`;
    return `${input.baseUrl}${normalized}`;
  }
}

export function buildGuestWhatsAppPackage(input: { guest: InvitationGuest; origin: string }) {
  const inviteBaseUrl = resolveInviteBaseUrl(input.origin);
  const inviteUrl = buildInviteUrl(inviteBaseUrl, input.guest.invitationCode);
  const telegramGuestLink = buildTelegramBotStartLink({
    botUsername: process.env.TELEGRAM_BOT_USERNAME,
    token: input.guest.invitationCode,
  });

  const invitationCardUrl = toAppBaseOwnedUrl({
    value: input.guest.invitationCardUrl,
    baseUrl: inviteBaseUrl,
  });

  const message = buildInvitationMessage({
    guest: {
      ...input.guest,
      invitationCardUrl,
    },
    inviteUrl,
    telegramGuestLink,
  });
  const link = buildWhatsAppLink({ phone: input.guest.phone, message });

  return {
    inviteUrl,
    message,
    link,
  };
}

export async function markWhatsAppGenerated(input: { guest: InvitationGuest; message: string }) {
  await appendGuestInvitationLog({
    guestId: input.guest.id,
    eventId: input.guest.eventId,
    channel: "WHATSAPP",
    status: "LINK_GENERATED",
    message: input.message,
  });
}

export async function markTelegramSent(input: { guest: InvitationGuest; message: string; sent: boolean }) {
  await appendGuestInvitationLog({
    guestId: input.guest.id,
    eventId: input.guest.eventId,
    channel: "TELEGRAM",
    status: input.sent ? "SENT" : "FAILED",
    message: input.message,
  });
}

export async function linkTelegramGuestByToken(input: {
  token: string;
  telegramChatId: string;
  telegramUsername: string | null;
}) {
  const guest = await prisma.guest.findFirst({
    where: { invitationCode: input.token },
    select: {
      id: true,
      name: true,
      invitationCode: true,
      event: {
        select: {
          title: true,
          brideName: true,
          groomName: true,
        },
      },
    },
  });

  if (!guest) return null;

  await upsertTelegramProfile({
    guestId: guest.id,
    telegramChatId: input.telegramChatId,
    telegramUsername: input.telegramUsername,
  });

  return guest;
}

export async function getGuestByInviteToken(token: string) {
  const guest = await prisma.guest.findFirst({
    where: { invitationCode: token },
    select: {
      id: true,
      name: true,
      invitationCode: true,
      eventId: true,
      event: {
        select: {
          title: true,
          brideName: true,
          groomName: true,
          eventDate: true,
          location: true,
          googleMapAddress: true,
          description: true,
          coverImage: true,
        },
      },
    },
  });

  if (!guest) return null;

  let profile = withDefaultProfile(guest.id);
  try {
    const profileMap = await getProfilesByGuestIds([guest.id]);
    profile = withDefaultProfile(guest.id, profileMap.get(guest.id));
  } catch (error) {
    if (!isMessagingProfileTableMissing(error)) throw error;
  }

  return {
    guest: {
      id: guest.id,
      name: guest.name,
      invitationCode: guest.invitationCode,
      eventId: guest.eventId,
      profile,
    },
    event: {
      title: guest.event.title,
      brideName: guest.event.brideName,
      groomName: guest.event.groomName,
      eventDate: guest.event.eventDate.toISOString(),
      location: guest.event.location,
      googleMapAddress: guest.event.googleMapAddress,
      description: guest.event.description,
      coverImage: guest.event.coverImage,
    },
  };
}

export async function saveGuestRsvp(input: { guestId: string; status: RsvpStatus; plusOne: number }) {
  await updateRsvpProfile({
    guestId: input.guestId,
    rsvpStatus: input.status,
    plusOne: input.plusOne,
  });
}

export function buildTelegramStartLink(token: string) {
  return buildTelegramBotStartLink({
    botUsername: process.env.TELEGRAM_BOT_USERNAME,
    token,
  });
}
