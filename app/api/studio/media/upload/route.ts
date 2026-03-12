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

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

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

  return NextResponse.json(
    {
      media,
      path: `uploads/${fileName}`,
      url,
    },
    { status: 201 }
  );
}
