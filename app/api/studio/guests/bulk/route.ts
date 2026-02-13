import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bulkGuestSchema = z.object({
  eventId: z.string().uuid(),
  guests: z
    .array(
      z.object({
        name: z.string().min(2),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        invitationCode: z.string().min(3),
      })
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = bulkGuestSchema.safeParse(body);

  if (!parsed.success) {
    return badRequestResponse("Invalid bulk guest payload");
  }

  const event = await prisma.event.findFirst({
    where: { id: parsed.data.eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  const created = await prisma.$transaction(
    parsed.data.guests.map((guest) =>
      prisma.guest.create({
        data: {
          eventId: parsed.data.eventId,
          name: guest.name,
          phone: guest.phone,
          email: guest.email,
          invitationCode: guest.invitationCode,
        },
      })
    )
  );

  return NextResponse.json({ guests: created }, { status: 201 });
}
