import { InvitationGuest } from "@/modules/wedding-messaging/types";

function cleanPhone(phone: string | null) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function buildInviteUrl(origin: string, token: string) {
  return `${origin}/invite/${encodeURIComponent(token)}`;
}

export function formatInviteDate(value: string | Date) {
  const dateValue = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dateValue);
}

export function buildInvitationMessage(input: {
  guest: InvitationGuest;
  inviteUrl: string;
  telegramGuestLink: string | null;
}) {
  const { guest, inviteUrl, telegramGuestLink } = input;
  const couple = [guest.brideName, guest.groomName].filter(Boolean).join(" & ") || guest.eventTitle;

  return [
    `Hello ${guest.name},`,
    "",
    `You are invited to the wedding of ${couple}.`,
    "",
    `Date: ${formatInviteDate(guest.eventDate)}`,
    guest.eventLocation ? `Venue: ${guest.eventLocation}` : null,
    "",
    "Please confirm your attendance:",
    inviteUrl,
    "",
    telegramGuestLink ? "Prefer Telegram updates?" : null,
    telegramGuestLink ? telegramGuestLink : null,
    "",
    guest.invitationCardUrl ? "Invitation card:" : null,
    guest.invitationCardUrl ? guest.invitationCardUrl : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export function buildWhatsAppLink(input: { phone: string | null; message: string }) {
  const normalizedPhone = cleanPhone(input.phone);
  const encodedMessage = encodeURIComponent(input.message);

  if (!normalizedPhone) {
    return `https://wa.me/?text=${encodedMessage}`;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export function buildTelegramBotStartLink(input: { botUsername: string | undefined; token: string }) {
  if (!input.botUsername) return null;
  return `https://t.me/${input.botUsername}?start=${encodeURIComponent(input.token)}`;
}
