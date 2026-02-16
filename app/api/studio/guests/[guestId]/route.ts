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

type RouteContext = {
  params: Promise<{ guestId: string }>;
};

const updateGuestSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  category: z.nativeEnum(GuestCategory).optional(),
  invitationCode: z.string().min(3).optional(),
  checkedIn: z.boolean().optional(),
});

async function findStudioGuest(studioId: string, guestId: string) {
  try {
    return await prisma.guest.findFirst({
      where: {
        id: guestId,
        event: {
          studioId,
        },
      },
    });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        event: {
          studioId,
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
      },
    });

    return guest ? { ...guest, category: GuestCategory.GENERAL } : null;
  }
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

  try {
    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        ...parsed.data,
        checkedInAt: nextCheckedInAt,
      },
    });

    return NextResponse.json({ guest });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        invitationCode: parsed.data.invitationCode,
        checkedIn: parsed.data.checkedIn,
        checkedInAt: nextCheckedInAt,
      },
    });

    return NextResponse.json({ guest: { ...guest, category: GuestCategory.GENERAL } });
  }
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
