import { badRequestResponse, notFoundResponse, requireStudioSession } from "@/lib/api-auth";
import { buildGuestWhatsAppPackage, listInvitationGuests, markWhatsAppGenerated } from "@/modules/wedding-messaging/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  eventId: z.string().uuid(),
  guestIds: z.array(z.string().uuid()).min(1),
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

  const guestMap = new Map(payload.guests.map((guest) => [guest.id, guest]));

  const results = await Promise.all(
    parsed.data.guestIds.map(async (guestId) => {
      const guest = guestMap.get(guestId);
      if (!guest) {
        return {
          guestId,
          guestName: "Unknown",
          whatsappLink: null,
          inviteUrl: null,
          message: null,
          status: "SKIPPED",
          reason: "Guest not found in this event",
        };
      }

      const packageData = buildGuestWhatsAppPackage({
        guest,
        origin: request.nextUrl.origin,
      });

      await markWhatsAppGenerated({ guest, message: packageData.message });

      return {
        guestId: guest.id,
        guestName: guest.name,
        whatsappLink: packageData.link,
        inviteUrl: packageData.inviteUrl,
        message: packageData.message,
        status: "READY",
        reason: null,
      };
    })
  );

  return NextResponse.json({
    results,
    summary: {
      requested: results.length,
      ready: results.filter((item) => item.status === "READY").length,
      skipped: results.filter((item) => item.status === "SKIPPED").length,
    },
  });
}
