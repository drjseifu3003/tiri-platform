import { notFoundResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ guestId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { guestId } = await context.params;

  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      event: {
        studioId: session.studioId,
      },
    },
    select: { id: true, checkedIn: true },
  });

  if (!guest) return notFoundResponse("Guest not found");

  const updatedGuest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      checkedIn: true,
      checkedInAt: guest.checkedIn ? undefined : new Date(),
    },
  });

  return NextResponse.json({ guest: updatedGuest });
}
