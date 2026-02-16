import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { MediaType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createMediaSchema = z.object({
  eventId: z.string().uuid(),
  type: z.enum(MediaType),
  url: z.string().url(),
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
    const media = await prisma.media.findMany({
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
      take: 200,
    });

    return NextResponse.json({ media });
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  const media = await prisma.media.findMany({
    where: { eventId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ media });
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = createMediaSchema.safeParse(body);

  if (!parsed.success) {
    return badRequestResponse("Invalid media payload");
  }

  const event = await prisma.event.findFirst({
    where: { id: parsed.data.eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  const media = await prisma.media.create({
    data: {
      eventId: parsed.data.eventId,
      type: parsed.data.type,
      url: parsed.data.url,
    },
  });

  return NextResponse.json({ media }, { status: 201 });
}
