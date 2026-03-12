import { badRequestResponse, notFoundResponse, requireStudioSession } from "@/lib/api-auth";
import { buildGuestWhatsAppPackage, listInvitationGuests, markWhatsAppGenerated } from "@/modules/wedding-messaging/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  eventId: z.string().uuid(),
  guestId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) return badRequestResponse("Invalid payload");

  const payload = await listInvitationGuests({
    studioId: session.studioId,
    eventId: parsed.data.eventId,
  });

  if (!payload) return notFoundResponse("Event not found");

  const guest = payload.guests.find((item) => item.id === parsed.data.guestId);
  if (!guest) return notFoundResponse("Guest not found");

  const packageData = buildGuestWhatsAppPackage({
    guest,
    origin: request.nextUrl.origin,
  });

  await markWhatsAppGenerated({ guest, message: packageData.message });

  return NextResponse.json({
    guestId: guest.id,
    guestName: guest.name,
    phone: guest.phone,
    whatsappLink: packageData.link,
    inviteUrl: packageData.inviteUrl,
    message: packageData.message,
  });
}
