import { badRequestResponse, requireAdmin, requireStudioSession } from "@/lib/api-auth";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

function extensionForMime(mimeType: string) {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  if (mimeType === "image/svg+xml") return ".svg";
  return "";
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return badRequestResponse("Invalid upload payload");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return badRequestResponse("Logo file is required");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return badRequestResponse("Only image files are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    return badRequestResponse("File is too large (max 5MB)");
  }

  const extension = extensionForMime(file.type);
  if (!extension) {
    return badRequestResponse("Unsupported image format");
  }

  const uploadsDir = path.join(process.cwd(), "uploads");
  const fileName = `${randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(filePath, fileBuffer);

  const url = `${request.nextUrl.origin}/api/uploads/${fileName}`;
  return NextResponse.json({ url }, { status: 201 });
}
