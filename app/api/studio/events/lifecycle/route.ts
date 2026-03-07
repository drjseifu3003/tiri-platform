import { requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function normalizePhone(phone: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

function buildStartedNotificationMessage(eventTitle: string) {
  return `Wedding update: ${eventTitle} has started. Please proceed to the venue and follow on-site guidance.`;
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const now = new Date();

  const dueEvents = await prisma.event.findMany({
    where: {
      studioId: session.studioId,
      status: "SCHEDULED",
      eventDate: { lte: now },
      startNotificationSentAt: null,
    },
    include: {
      guests: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  if (dueEvents.length === 0) {
    return NextResponse.json({
      transitioned: 0,
      notificationsPrepared: 0,
      events: [],
    });
  }

  const transitionedEvents: Array<{
    eventId: string;
    title: string;
    guestNotifications: Array<{ guestId: string; guestName: string; channel: "SMS"; message: string; shareUrl: string | null }>;
  }> = [];

  for (const event of dueEvents) {
    const updated = await prisma.event.updateMany({
      where: {
        id: event.id,
        status: "SCHEDULED",
        startNotificationSentAt: null,
      },
      data: {
        status: "LIVE",
        startedAt: now,
        startNotificationSentAt: now,
        isPublished: true,
      },
    });

    if (updated.count === 0) {
      continue;
    }

    const message = buildStartedNotificationMessage(event.title);
    const rows = event.guests.map((guest) => {
      const phone = normalizePhone(guest.phone);
      const shareUrl = phone ? `sms:${phone}?body=${encodeURIComponent(message)}` : null;

      return {
        guestId: guest.id,
        guestName: guest.name,
        channel: "SMS" as const,
        message,
        shareUrl,
      };
    });

    const inviteRows = rows.map((row) =>
      prisma.$executeRaw`
        INSERT INTO "GuestInvitation" ("guestId", "eventId", "channel", "status", "sentAt", "message")
        VALUES (${row.guestId}, ${event.id}, ${row.channel}, 'EVENT_STARTED', NOW(), ${row.message})
      `
    );

    if (inviteRows.length > 0) {
      await prisma.$transaction(inviteRows);
    }

    transitionedEvents.push({
      eventId: event.id,
      title: event.title,
      guestNotifications: rows,
    });
  }

  return NextResponse.json({
    transitioned: transitionedEvents.length,
    notificationsPrepared: transitionedEvents.reduce((sum, item) => sum + item.guestNotifications.length, 0),
    events: transitionedEvents,
  });
}
