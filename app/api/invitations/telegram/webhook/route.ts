import { badRequestResponse } from "@/lib/api-auth";
import { linkTelegramGuestByToken } from "@/modules/wedding-messaging/service";
import { isMessagingProfileTableMissing } from "@/modules/wedding-messaging/storage";
import { NextRequest, NextResponse } from "next/server";

function parseStartToken(text: string | undefined) {
  if (!text) return null;

  const match = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/i);
  if (!match) return null;

  return match[1]?.trim() ?? null;
}

async function sendTelegramText(input: { chatId: string; text: string }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      text: input.text,
    }),
  }).catch(() => undefined);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        message?: {
          text?: string;
          chat?: { id?: number | string; username?: string };
          from?: { username?: string };
        };
      }
    | null;

  if (!body?.message?.chat?.id) {
    return badRequestResponse("Invalid Telegram update payload");
  }

  const startToken = parseStartToken(body.message.text);
  const chatId = String(body.message.chat.id);

  if (!startToken) {
    await sendTelegramText({
      chatId,
      text: "To connect your invitation, open the invite link from your planner or send: /start YOUR_INVITE_CODE",
    });
    return NextResponse.json({ ok: true });
  }

  const username = body.message.from?.username ?? body.message.chat.username ?? null;

  try {
    const linkedGuest = await linkTelegramGuestByToken({
      token: startToken,
      telegramChatId: chatId,
      telegramUsername: username,
    });

    if (!linkedGuest) {
      await sendTelegramText({
        chatId,
        text: "We could not find that invite code. Please use the exact invite link or ask your planner for the correct code.",
      });
      return NextResponse.json({ ok: true, linked: false, reason: "Invite token not found" });
    }

    const couple = [linkedGuest.event.brideName, linkedGuest.event.groomName].filter(Boolean).join(" & ") || linkedGuest.event.title;
    await sendTelegramText({
      chatId,
      text: `Welcome ${linkedGuest.name}. Your Telegram notifications are now connected for ${couple}.`,
    });

    return NextResponse.json({ ok: true, linked: true, guestId: linkedGuest.id });
  } catch (error) {
    if (!isMessagingProfileTableMissing(error)) throw error;

    return NextResponse.json(
      {
        ok: false,
        error: "GuestMessagingProfile table is missing. Run Prisma migrations.",
      },
      { status: 500 }
    );
  }
}
