import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ guestId: string }>;
};

const updateGuestSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  invitationCode: z.string().min(3).optional(),
  checkedIn: z.boolean().optional(),
});

async function findStudioGuest(studioId: string, guestId: string) {
  return prisma.guest.findFirst({
    where: {
      id: guestId,
      event: {
        studioId,
      },
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { guestId } = await context.params;
  const guest = await findStudioGuest(session.studioId, guestId);
  if (!guest) return notFoundResponse("Guest not found");

  return NextResponse.json({ guest });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { guestId } = await context.params;
  const existing = await findStudioGuest(session.studioId, guestId);
  if (!existing) return notFoundResponse("Guest not found");

  const body = await request.json().catch(() => null);
  const parsed = updateGuestSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse("Invalid guest payload");

  const nextCheckedInAt =
    parsed.data.checkedIn === undefined
      ? undefined
      : parsed.data.checkedIn
        ? existing.checkedInAt ?? new Date()
        : null;

  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      ...parsed.data,
      checkedInAt: nextCheckedInAt,
    },
  });

  return NextResponse.json({ guest });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { guestId } = await context.params;
  const existing = await findStudioGuest(session.studioId, guestId);
  if (!existing) return notFoundResponse("Guest not found");

  await prisma.guest.delete({ where: { id: guestId } });
  return NextResponse.json({ ok: true });
}
