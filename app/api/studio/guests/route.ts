import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createGuestSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  invitationCode: z.string().min(3),
});

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return badRequestResponse("eventId query param is required");
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  const guests = await prisma.guest.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ guests });
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

  const guest = await prisma.guest.create({
    data: {
      eventId: parsed.data.eventId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      invitationCode: parsed.data.invitationCode,
    },
  });

  return NextResponse.json({ guest }, { status: 201 });
}
