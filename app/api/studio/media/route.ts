import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { MediaType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createMediaSchema = z.object({
  eventId: z.string().uuid(),
  type: z.enum(MediaType),
  url: z.string().url(),
  groupLabel: z.string().trim().min(1).optional(),
});

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const VIDEO_MIME_TO_EXT: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

function extensionForUpload(type: MediaType, mimeType: string) {
  if (type === "IMAGE") {
    return IMAGE_MIME_TO_EXT[mimeType] ?? "";
  }

  return VIDEO_MIME_TO_EXT[mimeType] ?? "";
}

function maxBytesForMedia(type: MediaType) {
  return type === "IMAGE" ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
}

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

  if (!eventId) {
    return badRequestResponse("eventId query param is required");
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

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return badRequestResponse("Invalid media payload");
    }

    const eventId = String(formData.get("eventId") || "").trim();
    const typeRaw = String(formData.get("type") || "").trim();
    const groupLabelRaw = String(formData.get("groupLabel") || "").trim();
    const file = formData.get("file");

    if (!eventId) {
      return badRequestResponse("eventId is required");
    }

    if (typeRaw !== "IMAGE" && typeRaw !== "VIDEO") {
      return badRequestResponse("type must be IMAGE or VIDEO");
    }

    if (!(file instanceof File)) {
      return badRequestResponse("Media file is required");
    }

    const type = typeRaw as MediaType;
    const extension = extensionForUpload(type, file.type);
    if (!extension) {
      return badRequestResponse(type === "IMAGE" ? "Only JPG, PNG, WEBP, or GIF images are allowed" : "Only MP4, MOV, or WEBM videos are allowed");
    }

    if (file.size > maxBytesForMedia(type)) {
      return badRequestResponse(type === "IMAGE" ? "Image is too large (max 10MB)" : "Video is too large (max 100MB)");
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
    const media = await prisma.media.create({
      data: {
        eventId,
        type,
        url,
        groupLabel: groupLabelRaw || undefined,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  }

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
      groupLabel: parsed.data.groupLabel,
    },
  });

  return NextResponse.json({ media }, { status: 201 });
}
