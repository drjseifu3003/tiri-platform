import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const eventStatusValues = ["DRAFT", "SCHEDULED", "LIVE", "COMPLETED", "CANCELLED", "ARCHIVED"] as const;
const eventStatusSchema = z.enum(eventStatusValues);
type EventStatus = (typeof eventStatusValues)[number];

function toPublishedFlag(status: EventStatus) {
  return status === "SCHEDULED" || status === "LIVE" || status === "COMPLETED";
}

function statusFromLegacy(input: { eventDate: Date; isPublished?: boolean; status?: EventStatus }) {
  if (input.status) return input.status;
  if (input.eventDate < new Date()) return "COMPLETED" as const;
  return input.isPublished ? "SCHEDULED" : "DRAFT";
}

type InvitationChannel = "WHATSAPP" | "TELEGRAM" | "SMS";

type LatestInvitationRow = {
  channel: InvitationChannel;
  sentAt: Date;
};

function isInvitationTableMissingError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code?: string }).code === "42P01" ||
      (error as { code?: string }).code === "42703")
  );
}

function isMissingColumnError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2022";
}

function isUnknownPrismaArgumentError(error: unknown, argument: string) {
  if (!(error instanceof Error)) return false;
  return error.message.includes(`Unknown argument \`${argument}\``);
}

function isWorkflowFieldMismatchError(error: unknown) {
  return (
    isUnknownPrismaArgumentError(error, "status") ||
    isUnknownPrismaArgumentError(error, "startedAt") ||
    isUnknownPrismaArgumentError(error, "completedAt") ||
    isUnknownPrismaArgumentError(error, "cancelledAt") ||
    isUnknownPrismaArgumentError(error, "archivedAt")
  );
}

const updateEventSchema = z.object({
  title: z.string().min(2).optional(),
  brideName: z.string().nullable().optional(),
  groomName: z.string().nullable().optional(),
  bridePhone: z.string().trim().min(1).optional(),
  groomPhone: z.string().trim().min(1).optional(),
  eventDate: z.coerce.date().optional(),
  location: z.string().nullable().optional(),
  googleMapAddress: z.string().trim().optional(),
  description: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  slug: z.string().min(2).optional(),
  subdomain: z.string().min(2).nullable().optional(),
  isPublished: z.boolean().optional(),
  status: eventStatusSchema.optional(),
});

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

async function findStudioEvent(studioId: string, eventId: string) {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        studioId,
      },
      select: {
        id: true,
        studioId: true,
        eventDate: true,
        isPublished: true,
        googleMapAddress: true,
        startedAt: true,
        completedAt: true,
        cancelledAt: true,
        archivedAt: true,
      },
    });

    return event;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const legacyEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        studioId,
      },
      select: {
        id: true,
        studioId: true,
        eventDate: true,
        isPublished: true,
        googleMapAddress: true,
      },
    });

    return legacyEvent
      ? {
          ...legacyEvent,
          startedAt: null,
          completedAt: null,
          cancelledAt: null,
          archivedAt: null,
        }
      : null;
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;

  let event:
    | {
        id: string;
        title: string;
        brideName: string | null;
        groomName: string | null;
        bridePhone: string | null;
        groomPhone: string | null;
        eventDate: Date;
        location: string | null;
        googleMapAddress: string;
        description: string | null;
        coverImage: string | null;
        isPublished: boolean;
        status?: EventStatus;
        guests: Array<{
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          category: "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
          checkedIn: boolean;
          checkedInAt: Date | null;
          createdAt: Date;
        }>;
        media: Array<{
          id: string;
          type: "IMAGE" | "VIDEO";
          url: string;
          groupLabel: string | null;
          createdAt: Date;
        }>;
      }
    | null = null;

  try {
    event = await prisma.event.findFirst({
      where: {
        id: eventId,
        studioId: session.studioId,
      },
      select: {
        id: true,
        title: true,
        brideName: true,
        groomName: true,
        bridePhone: true,
        groomPhone: true,
        eventDate: true,
        location: true,
        googleMapAddress: true,
        description: true,
        coverImage: true,
        isPublished: true,
        status: true,
        guests: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            category: true,
            checkedIn: true,
            checkedInAt: true,
            createdAt: true,
          },
        },
        media: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            url: true,
            groupLabel: true,
            createdAt: true,
          },
        },
      },
    });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const legacyEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        studioId: session.studioId,
      },
      select: {
        id: true,
        title: true,
        brideName: true,
        groomName: true,
        bridePhone: true,
        groomPhone: true,
        eventDate: true,
        location: true,
        googleMapAddress: true,
        description: true,
        coverImage: true,
        isPublished: true,
        guests: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            checkedIn: true,
            checkedInAt: true,
            createdAt: true,
          },
        },
        media: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            url: true,
            createdAt: true,
          },
        },
      },
    });

    event = legacyEvent
      ? {
          ...legacyEvent,
          status: undefined,
          guests: legacyEvent.guests.map((guest) => ({ ...guest, category: "GENERAL" as const })),
          media: legacyEvent.media.map((item) => ({ ...item, groupLabel: null })),
        }
      : null;
  }

  if (!event) return notFoundResponse("Event not found");

  let latestInviteByGuest: Record<
    string,
    { invitationChannel: InvitationChannel; invitationSentAt: string }
  > = {};

  try {
    const latestRows = await Promise.all(
      event.guests.map((guest) =>
        prisma.$queryRaw<LatestInvitationRow[]>`
          SELECT channel AS "channel", "sentAt" AS "sentAt"
          FROM "GuestInvitation"
          WHERE "guestId" = ${guest.id}
          ORDER BY "sentAt" DESC
          LIMIT 1
        `
      )
    );

    latestInviteByGuest = Object.fromEntries(
      latestRows
        .map((rows, index) => {
          const latest = rows[0];
          if (!latest) return null;

          return [
            event.guests[index].id,
            {
              invitationChannel: latest.channel,
              invitationSentAt: latest.sentAt.toISOString(),
            },
          ];
        })
        .filter((row): row is [string, { invitationChannel: InvitationChannel; invitationSentAt: string }] => !!row)
    );
  } catch (error) {
    if (!isInvitationTableMissingError(error)) throw error;
  }

  const enrichedEvent = {
    ...event,
    guests: event.guests.map((guest) => {
      const latestInvite = latestInviteByGuest[guest.id];
      return {
        ...guest,
        invitationStatus: latestInvite ? "SENT" : "NOT_SENT",
        invitationChannel: latestInvite?.invitationChannel ?? null,
        invitationSentAt: latestInvite?.invitationSentAt ?? null,
      };
    }),
  };

  return NextResponse.json({ event: enrichedEvent });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;
  const existingEvent = await findStudioEvent(session.studioId, eventId);

  if (!existingEvent) return notFoundResponse("Event not found");

  const body = await request.json().catch(() => null);
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse("Invalid event payload");
  }

  const { status: requestedStatus, ...patchableData } = parsed.data;

  const nextEventDate = patchableData.eventDate ?? existingEvent.eventDate;
  const resolvedStatus = statusFromLegacy({
    eventDate: nextEventDate,
    isPublished: patchableData.isPublished,
    status: requestedStatus,
  });

  const dataWithWorkflow = {
    ...patchableData,
    googleMapAddress: patchableData.googleMapAddress ?? existingEvent.googleMapAddress,
    status: resolvedStatus,
    isPublished: toPublishedFlag(resolvedStatus),
    startedAt: resolvedStatus === "LIVE" ? existingEvent.startedAt ?? new Date() : existingEvent.startedAt,
    completedAt: resolvedStatus === "COMPLETED" ? existingEvent.completedAt ?? new Date() : existingEvent.completedAt,
    cancelledAt: resolvedStatus === "CANCELLED" ? existingEvent.cancelledAt ?? new Date() : existingEvent.cancelledAt,
    archivedAt: resolvedStatus === "ARCHIVED" ? existingEvent.archivedAt ?? new Date() : existingEvent.archivedAt,
  };

  const legacyData = {
    ...patchableData,
    googleMapAddress: patchableData.googleMapAddress ?? existingEvent.googleMapAddress,
    isPublished: toPublishedFlag(resolvedStatus),
  };

  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: dataWithWorkflow,
    });

    return NextResponse.json({ event });
  } catch (error) {
    if (!isWorkflowFieldMismatchError(error) && !isMissingColumnError(error)) {
      throw error;
    }

    // Backward compatibility: client may be generated from an older schema without workflow fields.
    const event = await prisma.event.update({
      where: { id: eventId },
      data: legacyData,
    });

    return NextResponse.json({ event, workflowFieldsSkipped: true });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;
  const existingEvent = await findStudioEvent(session.studioId, eventId);

  if (!existingEvent) return notFoundResponse("Event not found");

  await prisma.event.delete({ where: { id: eventId } });
  return NextResponse.json({ ok: true });
}
