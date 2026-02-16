import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createEventSchema = z.object({
  templateId: z.string().uuid(),
  title: z.string().min(2),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  bridePhone: z.string().trim().min(1),
  groomPhone: z.string().trim().min(1),
  eventDate: z.coerce.date(),
  location: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  slug: z.string().min(2),
  subdomain: z.string().min(2).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const events = await prisma.event.findMany({
    where: { studioId: session.studioId },
    include: {
      template: true,
      _count: {
        select: {
          guests: true,
          media: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse("Invalid event payload");
  }

  const template = await prisma.template.findUnique({
    where: { id: parsed.data.templateId },
    select: { id: true, isActive: true },
  });

  if (!template || !template.isActive) {
    return badRequestResponse("Template not found or inactive");
  }

  const event = await prisma.event.create({
    data: {
      studioId: session.studioId,
      templateId: parsed.data.templateId,
      title: parsed.data.title,
      brideName: parsed.data.brideName,
      groomName: parsed.data.groomName,
      bridePhone: parsed.data.bridePhone,
      groomPhone: parsed.data.groomPhone,
      eventDate: parsed.data.eventDate,
      location: parsed.data.location,
      description: parsed.data.description,
      coverImage: parsed.data.coverImage,
      slug: parsed.data.slug,
      subdomain: parsed.data.subdomain,
      isPublished: parsed.data.isPublished ?? false,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
