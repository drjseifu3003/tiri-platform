import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { GuestCategory } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function isMissingColumnError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2022";
}

const createGuestSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  category: z.nativeEnum(GuestCategory).optional(),
  invitationCode: z.string().min(3),
});

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const eventId = request.nextUrl.searchParams.get("eventId");
  const scope = request.nextUrl.searchParams.get("scope");

  if (!eventId && scope !== "studio") {
    return badRequestResponse("eventId query param is required, or set scope=studio");
  }

  if (scope === "studio") {
    try {
      const guests = await prisma.guest.findMany({
        where: {
          event: {
            studioId: session.studioId,
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return NextResponse.json({ guests });
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      const guests = await prisma.guest.findMany({
        where: {
          event: {
            studioId: session.studioId,
          },
        },
        select: {
          id: true,
          eventId: true,
          name: true,
          phone: true,
          email: true,
          invitationCode: true,
          checkedIn: true,
          checkedInAt: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return NextResponse.json({ guests: guests.map((guest) => ({ ...guest, category: GuestCategory.GENERAL })) });
    }
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId!, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  try {
    const guests = await prisma.guest.findMany({
      where: { eventId: eventId! },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const guests = await prisma.guest.findMany({
      where: { eventId: eventId! },
      select: {
        id: true,
        eventId: true,
        name: true,
        phone: true,
        email: true,
        invitationCode: true,
        checkedIn: true,
        checkedInAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ guests: guests.map((guest) => ({ ...guest, category: GuestCategory.GENERAL })) });
  }
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = createGuestSchema.safeParse(body);

  if (!parsed.success) {
    return badRequestResponse("Invalid guest payload");
  }

  const event = await prisma.event.findFirst({
    where: { id: parsed.data.eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  try {
    const guest = await prisma.guest.create({
      data: {
        eventId: parsed.data.eventId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        category: parsed.data.category ?? GuestCategory.GENERAL,
        invitationCode: parsed.data.invitationCode,
      },
    });

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const guest = await prisma.guest.create({
      data: {
        eventId: parsed.data.eventId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        invitationCode: parsed.data.invitationCode,
      },
    });

    return NextResponse.json({ guest: { ...guest, category: GuestCategory.GENERAL } }, { status: 201 });
  }
}
