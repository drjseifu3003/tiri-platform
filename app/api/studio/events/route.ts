import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(2),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  bridePhone: z.string().trim().min(1),
  groomPhone: z.string().trim().min(1),
  eventDate: z.coerce.date(),
  location: z.string().optional(),
  googleMapAddress: z.string().trim().min(1),
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

  const event = await prisma.event.create({
    data: {
      studioId: session.studioId,
      title: parsed.data.title,
      brideName: parsed.data.brideName,
      groomName: parsed.data.groomName,
      bridePhone: parsed.data.bridePhone,
      groomPhone: parsed.data.groomPhone,
      eventDate: parsed.data.eventDate,
      location: parsed.data.location,
      googleMapAddress: parsed.data.googleMapAddress,
      description: parsed.data.description,
      coverImage: parsed.data.coverImage,
      slug: parsed.data.slug,
      subdomain: parsed.data.subdomain,
      isPublished: parsed.data.isPublished ?? false,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
