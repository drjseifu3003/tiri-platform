"use client";

import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
};

type GuestItem = {
  id: string;
  eventId: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
  invitationCode: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
  };
};

type GuestsResponse = { guests: GuestItem[] };
type EventsResponse = { events: EventListItem[] };

function generateInvitationCode(name: string) {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 5) || "GUEST";
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${base}${suffix}`;
}

export default function StudioGuestsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST">("all");
  const [checkInFilter, setCheckInFilter] = useState<"all" | "checked-in" | "not-checked-in">("all");
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventId: "",
    name: "",
    phone: "",
    email: "",
    category: "GENERAL" as "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST",
    invitationCode: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [guestsRes, eventsRes] = await Promise.all([
        fetch("/api/studio/guests?scope=studio", { credentials: "include" }),
        fetch("/api/studio/events", { credentials: "include" }),
      ]);

      if (!guestsRes.ok || !eventsRes.ok) {
        throw new Error("Unable to load guests");
      }

      const guestsJson = (await guestsRes.json()) as GuestsResponse;
      const eventsJson = (await eventsRes.json()) as EventsResponse;

      setGuests(guestsJson.guests ?? []);
      setEvents(eventsJson.events ?? []);
    } catch {
      setError("Unable to load guests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;
    void loadData();
  }, [loadData, router, status]);

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return guests.filter((guest) => {
      const matchesSearch =
        query.length === 0 ||
        guest.name.toLowerCase().includes(query) ||
        (guest.phone ?? "").toLowerCase().includes(query) ||
        (guest.email ?? "").toLowerCase().includes(query) ||
        guest.invitationCode.toLowerCase().includes(query) ||
        (guest.event?.title ?? "").toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (selectedEventId !== "all" && guest.eventId !== selectedEventId) return false;
      if (categoryFilter !== "all" && guest.category !== categoryFilter) return false;
      if (checkInFilter === "checked-in" && !guest.checkedIn) return false;
      if (checkInFilter === "not-checked-in" && guest.checkedIn) return false;
      return true;
    });
  }, [categoryFilter, checkInFilter, guests, search, selectedEventId]);

  const summary = useMemo(() => {
    const checkedIn = guests.filter((guest) => guest.checkedIn).length;
    const brideGuests = guests.filter((guest) => guest.category === "BRIDE_GUEST").length;
    const groomGuests = guests.filter((guest) => guest.category === "GROOM_GUEST").length;
    return { checkedIn, brideGuests, groomGuests };
  }, [guests]);

  async function handleCreateGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateLoading(true);
    setActionError(null);
    setSuccess(null);

    const name = formData.name.trim();
    const eventId = formData.eventId;
    const invitationCode = (formData.invitationCode.trim() || generateInvitationCode(name)).toUpperCase();

    if (!eventId) {
      setActionError("Please select an event.");
      setCreateLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/studio/guests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          category: formData.category,
          invitationCode,
        }),
      });

      if (!response.ok) {
        setActionError("Unable to add guest. Invitation code may already exist.");
        return;
      }

      setFormData({
        eventId: "",
        name: "",
        phone: "",
        email: "",
        category: "GENERAL",
        invitationCode: "",
      });
      setSuccess("Guest added successfully.");
      await loadData();
    } catch {
      setActionError("Unable to add guest.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleToggleCheckIn(guest: GuestItem) {
    setActionError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/studio/guests/${guest.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkedIn: !guest.checkedIn }),
      });

      if (!response.ok) {
        setActionError("Unable to update guest check-in status.");
        return;
      }

      setSuccess(`Guest ${guest.checkedIn ? "marked as not checked-in" : "checked-in"}.`);
      await loadData();
    } catch {
      setActionError("Unable to update guest check-in status.");
    }
  }

  async function handleDeleteGuest(guest: GuestItem) {
    setActionError(null);
    setSuccess(null);

    const confirmed = window.confirm(`Delete guest \"${guest.name}\"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/studio/guests/${guest.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setActionError("Unable to delete guest.");
        return;
      }

      setSuccess("Guest deleted.");
      await loadData();
    } catch {
      setActionError("Unable to delete guest.");
    }
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <h2 className="ui-title">Guests</h2>
          <p className="ui-subtitle">Track invitees, category split, invitations, and check-ins.</p>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search guest, event, phone, code"
          className="ui-input max-w-xs"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Total guests</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{guests.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Checked-in</p>
          <p className="mt-1 text-xl font-semibold text-cyan-700">{summary.checkedIn}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Bride guests</p>
          <p className="mt-1 text-xl font-semibold text-violet-700">{summary.brideGuests}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Groom guests</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{summary.groomGuests}</p>
        </div>
      </div>

      <section className="ui-panel mt-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-800">Add Guest</h3>
          <p className="mt-1 text-sm text-zinc-600">Create a guest with category and invitation code.</p>
        </div>

        <form className="space-y-4" onSubmit={handleCreateGuest}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Event *</span>
              <select
                value={formData.eventId}
                onChange={(event) => setFormData((current) => ({ ...current, eventId: event.target.value }))}
                className="ui-select"
                required
              >
                <option value="">Select event</option>
                {events.map((studioEvent) => (
                  <option key={studioEvent.id} value={studioEvent.id}>
                    {studioEvent.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Guest Name *</span>
              <input
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                className="ui-input"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Phone</span>
              <input
                value={formData.phone}
                onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                className="ui-input"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                className="ui-input"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Category *</span>
              <select
                value={formData.category}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    category: event.target.value as "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST",
                  }))
                }
                className="ui-select"
              >
                <option value="GENERAL">General</option>
                <option value="BRIDE_GUEST">Bride Guest</option>
                <option value="GROOM_GUEST">Groom Guest</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Invitation Code</span>
              <input
                value={formData.invitationCode}
                onChange={(event) => setFormData((current) => ({ ...current, invitationCode: event.target.value.toUpperCase() }))}
                placeholder="Auto-generated if empty"
                className="ui-input"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createLoading}
              className="ui-button-primary"
            >
              {createLoading ? "Adding..." : "Add Guest"}
            </button>
          </div>
        </form>
      </section>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={selectedEventId}
          onChange={(event) => setSelectedEventId(event.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700"
        >
          <option value="all">All events</option>
          {events.map((studioEvent) => (
            <option key={studioEvent.id} value={studioEvent.id}>
              {studioEvent.title}
            </option>
          ))}
        </select>

        {["all", "GENERAL", "BRIDE_GUEST", "GROOM_GUEST"].map((value) => {
          const active = categoryFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value as "all" | "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white"
                  : "border border-zinc-300 bg-zinc-50 text-zinc-600"
              }`}
            >
              {value === "all" ? "All categories" : value}
            </button>
          );
        })}

        {["all", "checked-in", "not-checked-in"].map((value) => {
          const active = checkInFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setCheckInFilter(value as "all" | "checked-in" | "not-checked-in")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white"
                  : "border border-zinc-300 bg-zinc-50 text-zinc-600"
              }`}
            >
              {value === "all" ? "All check-in" : value}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading guests...</p>
      ) : (
        <div className="ui-table">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Guest</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Invitation Code</th>
                  <th className="px-4 py-3 font-medium">Check-in</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-t border-zinc-100 align-top hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">{guest.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{guest.phone ?? "No phone"}</p>
                      <p className="text-xs text-zinc-500">{guest.email ?? "No email"}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{guest.event?.title ?? "Unknown event"}</td>
                    <td className="px-4 py-3 text-zinc-700">{guest.category}</td>
                    <td className="px-4 py-3 text-zinc-700">{guest.invitationCode}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${
                          guest.checkedIn
                            ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                            : "border-zinc-200 bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {guest.checkedIn ? "Checked-in" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => void handleToggleCheckIn(guest)}
                          className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs text-violet-700"
                        >
                          {guest.checkedIn ? "Undo" : "Check-in"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteGuest(guest)}
                          className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGuests.length === 0 ? (
            <p className="px-4 py-5 text-sm text-zinc-600">No guests match your filters.</p>
          ) : null}
        </div>
      )}
    </main>
  );
}
