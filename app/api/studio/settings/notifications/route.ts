import { requireStudioSession } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

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

  return NextResponse.json(
    { error: "Notification setting updates are temporarily disabled" },
    { status: 501 }
  );
}
