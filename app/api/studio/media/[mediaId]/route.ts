import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { MediaType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ mediaId: string }>;
};

const updateMediaSchema = z.object({
  type: z.enum(MediaType).optional(),
  url: z.string().url().optional(),
});

async function findStudioMedia(studioId: string, mediaId: string) {
  return prisma.media.findFirst({
    where: {
      id: mediaId,
      event: {
        studioId,
      },
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { mediaId } = await context.params;
  const media = await findStudioMedia(session.studioId, mediaId);

  if (!media) return notFoundResponse("Media not found");
  return NextResponse.json({ media });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { mediaId } = await context.params;
  const existing = await findStudioMedia(session.studioId, mediaId);
  if (!existing) return notFoundResponse("Media not found");

  const body = await request.json().catch(() => null);
  const parsed = updateMediaSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse("Invalid media payload");

  const media = await prisma.media.update({
    where: { id: mediaId },
    data: parsed.data,
  });

  return NextResponse.json({ media });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { mediaId } = await context.params;
  const existing = await findStudioMedia(session.studioId, mediaId);
  if (!existing) return notFoundResponse("Media not found");

  await prisma.media.delete({ where: { id: mediaId } });
  return NextResponse.json({ ok: true });
}
