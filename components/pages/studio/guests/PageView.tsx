"use client";

import { getApiErrorMessage } from "@/lib/api/base-api";
import { useLazyGetStudioEventsQuery } from "@/lib/api/events-api";
import {
  useCreateStudioGuestMutation,
  useDeleteStudioGuestMutation,
  useLazyGetStudioGuestsQuery,
  useUpdateStudioGuestMutation,
} from "@/lib/api/guests-api";
import type { StudioEventListItem, StudioEventsResponse } from "@/lib/api/types";
import { useSession } from "@/lib/session-context";
import { PhoneInput } from "@/components/ui/phone-input";
import { MobileFilterSheet } from "@/components/ui/mobile-filter-sheet";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type EventListItem = Pick<StudioEventListItem, "id" | "title">;

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
  const [fetchGuests] = useLazyGetStudioGuestsQuery();
  const [fetchEvents] = useLazyGetStudioEventsQuery();
  const [createGuest] = useCreateStudioGuestMutation();
  const [updateGuest] = useUpdateStudioGuestMutation();
  const [deleteGuest] = useDeleteStudioGuestMutation();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [guestsResult, eventsResult] = await Promise.all([
      fetchGuests({ scope: "studio" }, false),
      fetchEvents({}, false),
    ]);

    if ("error" in guestsResult) {
      setError(getApiErrorMessage(guestsResult.error, "Unable to load guests"));
      setLoading(false);
      return;
    }

    if ("error" in eventsResult) {
      setError(getApiErrorMessage(eventsResult.error, "Unable to load guests"));
      setLoading(false);
      return;
    }

    const guestsJson = guestsResult.data as GuestsResponse;
    const eventsJson = eventsResult.data as StudioEventsResponse<EventListItem>;

    setGuests(guestsJson.guests ?? []);
    setEvents(eventsJson.events ?? []);
    setLoading(false);
  }, [fetchEvents, fetchGuests]);

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

    const result = await createGuest({
      eventId,
      name,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      category: formData.category,
      invitationCode,
    });

    if ("error" in result) {
      setActionError(getApiErrorMessage(result.error, "Unable to add guest."));
      setCreateLoading(false);
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
    setCreateLoading(false);
  }

  async function handleToggleCheckIn(guest: GuestItem) {
    setActionError(null);
    setSuccess(null);

    const result = await updateGuest({ guestId: guest.id, body: { checkedIn: !guest.checkedIn } });
    if ("error" in result) {
      setActionError(getApiErrorMessage(result.error, "Unable to update guest check-in status."));
      return;
    }

    setSuccess(`Guest ${guest.checkedIn ? "marked as not checked-in" : "checked-in"}.`);
    await loadData();
  }

  async function handleDeleteGuest(guest: GuestItem) {
    setActionError(null);
    setSuccess(null);

    const confirmed = window.confirm(`Delete guest \"${guest.name}\"?`);
    if (!confirmed) return;

    const result = await deleteGuest({ guestId: guest.id });
    if ("error" in result) {
      setActionError(getApiErrorMessage(result.error, "Unable to delete guest."));
      return;
    }

    setSuccess("Guest deleted.");
    await loadData();
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
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData((current) => ({ ...current, phone: value ?? "" }))}
                defaultCountry="ET"
                className="w-full"
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

      <div className="mt-4 md:hidden">
        <MobileFilterSheet title="Guest Filters" triggerLabel="Filters">
          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 w-full"
          >
            <option value="all">All events</option>
            {events.map((studioEvent) => (
              <option key={studioEvent.id} value={studioEvent.id}>
                {studioEvent.title}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            {["all", "GENERAL", "BRIDE_GUEST", "GROOM_GUEST"].map((value) => {
              const active = categoryFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategoryFilter(value as "all" | "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    active
                      ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white"
                      : "border border-zinc-300 bg-zinc-50 text-zinc-600"
                  }`}
                >
                  {value === "all" ? "All categories" : value}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {["all", "checked-in", "not-checked-in"].map((value) => {
              const active = checkInFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCheckInFilter(value as "all" | "checked-in" | "not-checked-in")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
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
        </MobileFilterSheet>
      </div>

      <div className="mt-4 hidden flex-wrap gap-2 md:flex">
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
          <div className="grid gap-3 p-3 md:hidden">
            {filteredGuests.map((guest) => (
              <article key={guest.id} className="rounded-lg border p-3" style={{ borderColor: "#e4e4e7", background: "white" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-800">{guest.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{guest.phone ?? "No phone"}</p>
                    <p className="text-xs text-zinc-500">{guest.email ?? "No email"}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-medium ${
                      guest.checkedIn
                        ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                        : "border-zinc-200 bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {guest.checkedIn ? "Checked-in" : "Pending"}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-zinc-700">
                  <p>Event: {guest.event?.title ?? "Unknown event"}</p>
                  <p>Category: {guest.category}</p>
                  <p>Code: {guest.invitationCode}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
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
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
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

