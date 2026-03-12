import { badRequestResponse, notFoundResponse } from "@/lib/api-auth";
import { getGuestByInviteToken, saveGuestRsvp } from "@/modules/wedding-messaging/service";
import { isMessagingProfileTableMissing } from "@/modules/wedding-messaging/storage";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ token: string }>;
};

const rsvpSchema = z.object({
  status: z.enum(["ATTENDING", "NOT_ATTENDING"]),
  plusOne: z.coerce.number().int().min(0).max(5).default(0),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  const payload = await getGuestByInviteToken(token);
  if (!payload) return notFoundResponse("Invitation not found");

  return NextResponse.json(payload);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  const payload = await getGuestByInviteToken(token);
  if (!payload) return notFoundResponse("Invitation not found");

  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);

  if (!parsed.success) return badRequestResponse("Invalid RSVP payload");

  try {
    await saveGuestRsvp({
      guestId: payload.guest.id,
      status: parsed.data.status,
      plusOne: parsed.data.plusOne,
    });
  } catch (error) {
    if (!isMessagingProfileTableMissing(error)) throw error;

    return NextResponse.json(
      { error: "RSVP storage table is missing. Run Prisma migrations." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    guestId: payload.guest.id,
    status: parsed.data.status,
    plusOne: parsed.data.plusOne,
  });
}
