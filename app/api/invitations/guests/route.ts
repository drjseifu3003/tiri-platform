import { badRequestResponse, notFoundResponse, requireStudioSession } from "@/lib/api-auth";
import { listInvitationGuests } from "@/modules/wedding-messaging/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  eventId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const parsed = querySchema.safeParse({
    eventId: request.nextUrl.searchParams.get("eventId"),
  });

  if (!parsed.success) return badRequestResponse("eventId must be a valid UUID");

  const payload = await listInvitationGuests({
    studioId: session.studioId,
    eventId: parsed.data.eventId,
  });

  if (!payload) return notFoundResponse("Event not found");

  return NextResponse.json(payload);
}
