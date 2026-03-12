import { badRequestResponse, notFoundResponse, requireStudioSession } from "@/lib/api-auth";
import {
  buildGuestWhatsAppPackage,
  listInvitationGuests,
  markTelegramSent,
} from "@/modules/wedding-messaging/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  eventId: z.string().uuid(),
  guestIds: z.array(z.string().uuid()).min(1),
});

type TelegramSendResponse = {
  ok: boolean;
  description?: string;
};

async function sendTelegramMessage(input: { botToken: string; chatId: string; text: string }) {
  const response = await fetch(`https://api.telegram.org/bot${input.botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      text: input.text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as TelegramSendResponse;
  return {
    ok: response.ok && payload.ok,
    reason: payload.description ?? (response.ok ? null : "Telegram API error"),
  };
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return badRequestResponse("TELEGRAM_BOT_TOKEN is not configured");
  }

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
          status: "SKIPPED",
          reason: "Guest not found",
        };
      }

      if (!guest.profile.telegramChatId) {
        return {
          guestId,
          guestName: guest.name,
          status: "SKIPPED",
          reason: "Guest has not started the Telegram bot",
        };
      }

      const packageData = buildGuestWhatsAppPackage({
        guest,
        origin: request.nextUrl.origin,
      });

      const sendResult = await sendTelegramMessage({
        botToken: token,
        chatId: guest.profile.telegramChatId,
        text: packageData.message,
      });

      await markTelegramSent({
        guest,
        message: packageData.message,
        sent: sendResult.ok,
      });

      return {
        guestId: guest.id,
        guestName: guest.name,
        status: sendResult.ok ? "SENT" : "FAILED",
        reason: sendResult.reason,
      };
    })
  );

  return NextResponse.json({
    results,
    summary: {
      requested: results.length,
      sent: results.filter((item) => item.status === "SENT").length,
      skipped: results.filter((item) => item.status === "SKIPPED").length,
      failed: results.filter((item) => item.status === "FAILED").length,
    },
  });
}
