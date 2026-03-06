import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

type InvitationChannel = "WHATSAPP" | "TELEGRAM" | "SMS";

const sendInvitesSchema = z.object({
  guestIds: z.array(z.string().uuid()).min(1),
  channel: z.enum(["WHATSAPP", "TELEGRAM", "SMS"]),
});

function isInvitationTableMissingError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code?: string }).code === "42P01" ||
      (error as { code?: string }).code === "42703")
  );
}

function formatInviteDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function normalizePhone(phone: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

function buildGuestShareUrl(input: {
  channel: InvitationChannel;
  phone: string | null;
  message: string;
  targetUrl: string;
}) {
  const encodedMessage = encodeURIComponent(input.message);
  const encodedTarget = encodeURIComponent(input.targetUrl);
  const phone = normalizePhone(input.phone);

  if (input.channel === "WHATSAPP") {
    if (phone) {
      return `https://wa.me/${phone}?text=${encodedMessage}`;
    }

    return `https://wa.me/?text=${encodedMessage}`;
  }

  if (input.channel === "TELEGRAM") {
    return `https://t.me/share/url?url=${encodedTarget}&text=${encodedMessage}`;
  }

  if (!phone) return null;
  return `sms:${phone}?body=${encodedMessage}`;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = sendInvitesSchema.safeParse(body);

  if (!parsed.success) return badRequestResponse("Invalid invite payload");

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      studioId: session.studioId,
    },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
      googleMapAddress: true,
    },
  });

  if (!event) return notFoundResponse("Event not found");

  const guests = await prisma.guest.findMany({
    where: {
      id: { in: parsed.data.guestIds },
      eventId: event.id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
    },
  });

  if (guests.length !== parsed.data.guestIds.length) {
    return badRequestResponse("One or more guests were not found in this event");
  }

  const mapOrFallbackUrl = event.googleMapAddress.startsWith("http")
    ? event.googleMapAddress
    : `${request.nextUrl.origin}/studio/events/${event.id}`;

  const rows = guests.map((guest) => {
    const message = `Hi ${guest.name}, you are invited to ${event.title} on ${formatInviteDate(
      event.eventDate
    )}.${event.location ? ` Venue: ${event.location}.` : ""} Details: ${mapOrFallbackUrl}`;

    const shareUrl = buildGuestShareUrl({
      channel: parsed.data.channel,
      phone: guest.phone,
      message,
      targetUrl: mapOrFallbackUrl,
    });

    return {
      guestId: guest.id,
      guestName: guest.name,
      channel: parsed.data.channel,
      shareUrl,
      message,
      status: shareUrl ? "sent" : "skipped",
      reason: shareUrl ? null : "No phone number available for SMS.",
    };
  });

  const sentRows = rows.filter((row) => row.status === "sent");

  if (sentRows.length > 0) {
    try {
      await prisma.$transaction(
        sentRows.map((row) =>
          prisma.$executeRaw`
            INSERT INTO "GuestInvitation" ("guestId", "eventId", "channel", "status", "sentAt", "message")
            VALUES (${row.guestId}, ${event.id}, ${row.channel}, 'SENT', NOW(), ${row.message})
          `
        )
      );
    } catch (error) {
      if (!isInvitationTableMissingError(error)) throw error;
    }
  }

  return NextResponse.json({
    results: rows,
    summary: {
      requested: rows.length,
      sent: sentRows.length,
      skipped: rows.length - sentRows.length,
    },
  });
}
