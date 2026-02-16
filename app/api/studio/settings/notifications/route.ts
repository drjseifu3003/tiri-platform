import { requireStudioSession } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const NOTIFICATION_COOKIE = "studio_notifications";

type NotificationPreferences = {
  rsvpUpdates: boolean;
  checkInAlerts: boolean;
  draftReminders: boolean;
  mediaUploads: boolean;
  weeklySummary: boolean;
};

const defaultPreferences: NotificationPreferences = {
  rsvpUpdates: true,
  checkInAlerts: true,
  draftReminders: true,
  mediaUploads: true,
  weeklySummary: false,
};

const notificationSchema = z.object({
  rsvpUpdates: z.boolean(),
  checkInAlerts: z.boolean(),
  draftReminders: z.boolean(),
  mediaUploads: z.boolean(),
  weeklySummary: z.boolean(),
});

function readPreferences(rawValue: string | undefined) {
  if (!rawValue) return defaultPreferences;

  try {
    const parsed = JSON.parse(rawValue) as Partial<NotificationPreferences>;
    return {
      rsvpUpdates: parsed.rsvpUpdates ?? defaultPreferences.rsvpUpdates,
      checkInAlerts: parsed.checkInAlerts ?? defaultPreferences.checkInAlerts,
      draftReminders: parsed.draftReminders ?? defaultPreferences.draftReminders,
      mediaUploads: parsed.mediaUploads ?? defaultPreferences.mediaUploads,
      weeklySummary: parsed.weeklySummary ?? defaultPreferences.weeklySummary,
    };
  } catch {
    return defaultPreferences;
  }
}

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const raw = request.cookies.get(NOTIFICATION_COOKIE)?.value;
  const preferences = readPreferences(raw);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
  }

  const response = NextResponse.json({ preferences: parsed.data });
  response.cookies.set({
    name: NOTIFICATION_COOKIE,
    value: JSON.stringify(parsed.data),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
