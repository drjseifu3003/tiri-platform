import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { eventId } = await context.params;
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return badRequestResponse("No file provided");
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return badRequestResponse("Invalid file type. Must be JPG, PNG, or WebP");
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return badRequestResponse("File too large. Maximum size is 5MB");
  }

  try {
    // Get event to verify ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        studioId: session.studioId,
      },
    });

    if (!event) {
      return badRequestResponse("Event not found");
    }

    // Read file as base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update event with avatar
    await prisma.event.update({
      where: { id: eventId },
      data: {
        coverImage: dataUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
