"use client";

import { useSession } from "@/lib/session-context";
import { MobileFilterSheet } from "@/components/ui/mobile-filter-sheet";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
};

type InvitationGuest = {
  id: string;
  name: string;
  phone: string | null;
  invitationCode: string;
  profile: {
    telegramChatId: string | null;
    rsvpStatus: "PENDING" | "ATTENDING" | "NOT_ATTENDING";
  };
};

type GuestsResponse = {
  event: {
    id: string;
    title: string;
  };
  guests: InvitationGuest[];
};

type EventsResponse = {
  events: EventListItem[];
};

function rsvpBadge(status: InvitationGuest["profile"]["rsvpStatus"]) {
  if (status === "ATTENDING") return "text-emerald-700";
  if (status === "NOT_ATTENDING") return "text-rose-700";
  return "text-zinc-500";
}

export default function StudioInvitationsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [guests, setGuests] = useState<InvitationGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    const response = await fetch("/api/studio/events", { credentials: "include" });
    if (!response.ok) throw new Error("Unable to load events");

    const payload = (await response.json()) as EventsResponse;
    const items = payload.events ?? [];
    setEvents(items);
    setSelectedEventId((current) => current || items[0]?.id || "");
  }, []);

  const loadGuests = useCallback(async (eventId: string) => {
    if (!eventId) {
      setGuests([]);
      return;
    }

    const response = await fetch(`/api/invitations/guests?eventId=${encodeURIComponent(eventId)}`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Unable to load invitation guests");

    const payload = (await response.json()) as GuestsResponse;
    setGuests(payload.guests ?? []);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        await loadEvents();
      } catch {
        if (!cancelled) setError("Unable to load invitations dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadEvents, router, status]);

  useEffect(() => {
    if (!selectedEventId) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadGuests(selectedEventId);
      } catch {
        if (!cancelled) setError("Unable to load invitation guests.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadGuests, selectedEventId]);

  const selectedGuests = useMemo(
    () => guests.filter((guest) => selectedGuestIds.includes(guest.id)),
    [guests, selectedGuestIds]
  );

  async function sendSingleWhatsApp(guestId: string) {
    if (!selectedEventId) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/invitations/whatsapp-link", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, guestId }),
      });

      if (!response.ok) {
        throw new Error("Unable to build WhatsApp invitation");
      }

      const payload = (await response.json()) as { whatsappLink: string; guestName: string };
      window.open(payload.whatsappLink, "_blank", "noopener,noreferrer");
      setSuccess(`WhatsApp invitation prepared for ${payload.guestName}.`);
    } catch {
      setError("Unable to generate WhatsApp invitation.");
    } finally {
      setWorking(false);
    }
  }

  async function sendBatchWhatsApp() {
    if (!selectedEventId || selectedGuestIds.length === 0) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/invitations/whatsapp-batch", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, guestIds: selectedGuestIds }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate WhatsApp batch links");
      }

      const payload = (await response.json()) as {
        results: Array<{ whatsappLink: string | null; status: string }>;
        summary: { ready: number; skipped: number };
      };

      payload.results
        .filter((item) => item.status === "READY" && item.whatsappLink)
        .forEach((item, index) => {
          window.setTimeout(() => {
            window.open(item.whatsappLink!, "_blank", "noopener,noreferrer");
          }, index * 900);
        });

      setSuccess(`Prepared ${payload.summary.ready} WhatsApp chats. Skipped ${payload.summary.skipped}.`);
    } catch {
      setError("Unable to generate WhatsApp batch invitations.");
    } finally {
      setWorking(false);
    }
  }

  async function sendBatchTelegram() {
    if (!selectedEventId || selectedGuestIds.length === 0) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/invitations/telegram/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, guestIds: selectedGuestIds }),
      });

      if (!response.ok) {
        throw new Error("Unable to send Telegram invitations");
      }

      const payload = (await response.json()) as {
        summary: { sent: number; skipped: number; failed: number };
      };

      setSuccess(
        `Telegram: ${payload.summary.sent} sent, ${payload.summary.skipped} skipped, ${payload.summary.failed} failed.`
      );
      await loadGuests(selectedEventId);
    } catch {
      setError("Unable to send Telegram invitations.");
    } finally {
      setWorking(false);
    }
  }

  function toggleGuest(guestId: string) {
    setSelectedGuestIds((current) =>
      current.includes(guestId) ? current.filter((id) => id !== guestId) : [...current, guestId]
    );
  }

  function toggleSelectAll() {
    if (selectedGuests.length === guests.length) {
      setSelectedGuestIds([]);
      return;
    }

    setSelectedGuestIds(guests.map((guest) => guest.id));
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <h2 className="ui-title">Wedding Messaging</h2>
          <p className="ui-subtitle">Dedicated invitation module for WhatsApp and Telegram workflows.</p>
        </div>
      </div>

      <section className="ui-panel mt-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,320px)_1fr]">
          <div className="md:hidden">
            <MobileFilterSheet title="Invitation Filters" triggerLabel="Filters">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Event</span>
                <select
                  className="ui-select"
                  value={selectedEventId}
                  onChange={(event) => {
                    setSelectedEventId(event.target.value);
                    setSelectedGuestIds([]);
                  }}
                >
                  {events.map((eventItem) => (
                    <option key={`mobile-${eventItem.id}`} value={eventItem.id}>
                      {eventItem.title}
                    </option>
                  ))}
                </select>
              </label>
            </MobileFilterSheet>
          </div>

          <label className="hidden md:block">
            <span className="mb-1 block text-xs font-medium text-zinc-600">Event</span>
            <select
              className="ui-select"
              value={selectedEventId}
              onChange={(event) => {
                setSelectedEventId(event.target.value);
                setSelectedGuestIds([]);
              }}
            >
              {events.map((eventItem) => (
                <option key={eventItem.id} value={eventItem.id}>
                  {eventItem.title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              className="ui-button-primary"
              disabled={working || selectedGuestIds.length === 0}
              onClick={() => {
                void sendBatchWhatsApp();
              }}
            >
              Send Invitations (WhatsApp)
            </button>
            <button
              type="button"
              className="ui-button-secondary"
              disabled={working || selectedGuestIds.length === 0}
              onClick={() => {
                void sendBatchTelegram();
              }}
            >
              Send Telegram (Automated)
            </button>
          </div>
        </div>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <div className="grid gap-3 p-3 md:hidden">
            {loading ? (
              <p className="rounded-lg border border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500">Loading invitations...</p>
            ) : guests.length === 0 ? (
              <p className="rounded-lg border border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500">No guests found for this event.</p>
            ) : (
              guests.map((guest) => (
                <article key={`${guest.id}-mobile`} className="rounded-lg border border-zinc-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">{guest.name}</p>
                      <p className="text-xs text-zinc-500">Token: {guest.invitationCode}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedGuestIds.includes(guest.id)}
                      onChange={() => toggleGuest(guest.id)}
                    />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-zinc-700">
                    <p>Phone: {guest.phone || "-"}</p>
                    <p>Telegram: {guest.profile.telegramChatId ? "Linked" : "Not linked"}</p>
                    <p className={rsvpBadge(guest.profile.rsvpStatus)}>RSVP: {guest.profile.rsvpStatus}</p>
                  </div>
                  <button
                    type="button"
                    className="ui-button-secondary mt-4"
                    disabled={working}
                    onClick={() => {
                      void sendSingleWhatsApp(guest.id);
                    }}
                  >
                    Send WhatsApp
                  </button>
                </article>
              ))
            )}
          </div>

          <table className="hidden w-full text-sm md:table">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={guests.length > 0 && selectedGuestIds.length === guests.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-3 py-3">Guest</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Telegram</th>
                <th className="px-3 py-3">RSVP</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                    Loading invitations...
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                    No guests found for this event.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="border-t border-zinc-100">
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedGuestIds.includes(guest.id)}
                        onChange={() => toggleGuest(guest.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-900">{guest.name}</p>
                      <p className="text-xs text-zinc-500">Token: {guest.invitationCode}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{guest.phone || "-"}</td>
                    <td className="px-3 py-3 text-zinc-700">
                      {guest.profile.telegramChatId ? "Linked" : "Not linked"}
                    </td>
                    <td className={`px-3 py-3 font-medium ${rsvpBadge(guest.profile.rsvpStatus)}`}>
                      {guest.profile.rsvpStatus}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="ui-button-secondary"
                        disabled={working}
                        onClick={() => {
                          void sendSingleWhatsApp(guest.id);
                        }}
                      >
                        Send WhatsApp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

