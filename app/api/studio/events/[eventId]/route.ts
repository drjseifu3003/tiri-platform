import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateEventSchema = z.object({
  templateId: z.string().uuid().optional(),
  title: z.string().min(2).optional(),
  brideName: z.string().nullable().optional(),
  groomName: z.string().nullable().optional(),
  bridePhone: z.string().trim().min(1).optional(),
  groomPhone: z.string().trim().min(1).optional(),
  eventDate: z.coerce.date().optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  slug: z.string().min(2).optional(),
  subdomain: z.string().min(2).nullable().optional(),
  isPublished: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

async function findStudioEvent(studioId: string, eventId: string) {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      studioId,
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      studioId: session.studioId,
    },
    include: {
      template: true,
      guests: {
        orderBy: { createdAt: "desc" },
      },
      media: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) return notFoundResponse("Event not found");

  return NextResponse.json({ event });
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

  if (parsed.data.templateId) {
    const template = await prisma.template.findUnique({
      where: { id: parsed.data.templateId },
      select: { id: true, isActive: true },
    });

    if (!template || !template.isActive) {
      return badRequestResponse("Template not found or inactive");
    }
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: parsed.data,
  });

  return NextResponse.json({ event });
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
