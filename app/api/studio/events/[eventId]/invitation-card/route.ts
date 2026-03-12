import { badRequestResponse, notFoundResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

const INVITATION_CARD_LABEL = "INVITATION_CARD";

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return badRequestResponse("Invalid invitation card payload");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return badRequestResponse("Invitation card image is required");
  }

  const extension = IMAGE_MIME_TO_EXT[file.type] ?? "";
  if (!extension) {
    return badRequestResponse("Only JPG, PNG, WEBP, or GIF images are allowed");
  }

  if (file.size > 10 * 1024 * 1024) {
    return badRequestResponse("Image is too large (max 10MB)");
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  const uploadsDir = path.join(process.cwd(), "uploads");
  const fileName = `${randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(filePath, fileBuffer);

  const url = `${request.nextUrl.origin}/api/uploads/${fileName}`;

  await prisma.$transaction([
    prisma.media.deleteMany({
      where: {
        eventId: event.id,
        groupLabel: INVITATION_CARD_LABEL,
      },
    }),
    prisma.media.create({
      data: {
        eventId: event.id,
        type: "IMAGE",
        url,
        groupLabel: INVITATION_CARD_LABEL,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, invitationCardUrl: url });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;
  const event = await prisma.event.findFirst({
    where: { id: eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  await prisma.media.deleteMany({
    where: {
      eventId: event.id,
      groupLabel: INVITATION_CARD_LABEL,
    },
  });

  return NextResponse.json({ ok: true });
}
