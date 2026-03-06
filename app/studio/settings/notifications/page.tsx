"use client";

import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NotificationPreferences = {
  rsvpUpdates: boolean;
  checkInAlerts: boolean;
  draftReminders: boolean;
  mediaUploads: boolean;
  weeklySummary: boolean;
};

type NotificationResponse = {
  preferences: NotificationPreferences;
};

const defaultPreferences: NotificationPreferences = {
  rsvpUpdates: true,
  checkInAlerts: true,
  draftReminders: true,
  mediaUploads: true,
  weeklySummary: false,
};

export default function StudioNotificationSettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadPreferences() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/studio/settings/notifications", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load notifications settings");
        }

        const data = (await response.json()) as NotificationResponse;
        if (!cancelled) setPreferences(data.preferences ?? defaultPreferences);
      } catch {
        if (!cancelled) setError("Unable to load notifications settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  const toggleItems: Array<{ key: keyof NotificationPreferences; title: string; description: string }> = [
    {
      key: "rsvpUpdates",
      title: "RSVP Updates",
      description: "Get notified when RSVP records change across events.",
    },
    {
      key: "checkInAlerts",
      title: "Check-in Alerts",
      description: "Track live check-in activity during event operations.",
    },
    {
      key: "draftReminders",
      title: "Draft Reminders",
      description: "Receive reminders for events still not published.",
    },
    {
      key: "mediaUploads",
      title: "Media Upload Milestones",
      description: "Get updates when albums and videos are uploaded.",
    },
    {
      key: "weeklySummary",
      title: "Weekly Summary",
      description: "Receive a compact studio operations summary every week.",
    },
  ];

  return (
    <main className="ui-page">
      <div>
        <h2 className="ui-title">Notification Settings</h2>
        <p className="ui-subtitle">Notification updates are temporarily disabled. Preferences are currently read-only.</p>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading notification settings...</p>
      ) : (
        <section className="ui-panel mt-5">
          <div className="space-y-3">
            {toggleItems.map((item) => (
              <label
                key={item.key}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
                </div>
                <input type="checkbox" checked={preferences[item.key]} readOnly disabled className="mt-1 h-4 w-4 rounded border-zinc-300 text-cyan-500 opacity-60" />
              </label>
            ))}
          </div>

          {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </section>
      )}
    </main>
  );
}
