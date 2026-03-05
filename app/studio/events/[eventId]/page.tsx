"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type GuestItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
  checkedIn: boolean;
  checkedInAt: string | null;
};

type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  groupLabel: string | null;
  createdAt: string;
};

type EventDetail = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone: string | null;
  groomPhone: string | null;
  eventDate: string;
  location: string | null;
  googleMapAddress: string;
  description: string | null;
  isPublished: boolean;
  guests: GuestItem[];
  media: MediaItem[];
};

type EventResponse = { event: EventDetail };

type EventTab = "overview" | "guests" | "media" | "gifts";

type GuestCategory = "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
type MediaType = "IMAGE" | "VIDEO";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function labelForCategory(value: GuestItem["category"]) {
  if (value === "BRIDE_GUEST") return "Bride Guest";
  if (value === "GROOM_GUEST") return "Groom Guest";
  return "General";
}

function buildInvitationCode(prefix: string, index = 0) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  const seq = index > 0 ? `-${index}` : "";
  return `${prefix}-${stamp}-${random}${seq}`.slice(0, 40);
}

export default function EventDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<EventTab>("overview");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [singleGuest, setSingleGuest] = useState({
    name: "",
    phone: "",
    email: "",
    category: "GENERAL" as GuestCategory,
  });
  const [bulkGuestText, setBulkGuestText] = useState("");
  const [guestFormError, setGuestFormError] = useState<string | null>(null);
  const [guestFormSuccess, setGuestFormSuccess] = useState<string | null>(null);
  const [guestSubmitting, setGuestSubmitting] = useState(false);

  const [mediaForm, setMediaForm] = useState({
    type: "IMAGE" as MediaType,
    url: "",
    groupLabel: "",
  });
  const [mediaFormError, setMediaFormError] = useState<string | null>(null);
  const [mediaFormSuccess, setMediaFormSuccess] = useState<string | null>(null);
  const [mediaSubmitting, setMediaSubmitting] = useState(false);

  const loadEvent = useCallback(async (showSpinner = true) => {
    if (!params?.eventId) return;

    if (showSpinner) {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await fetch(`/api/studio/events/${params.eventId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load event");
      }

      const payload = (await response.json()) as EventResponse;
      setEvent(payload.event ?? null);
    } catch {
      setError("Unable to load event details");
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, [params?.eventId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;
    if (!params?.eventId) return;

    void loadEvent();
  }, [loadEvent, params?.eventId, router, status]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab === "overview" || requestedTab === "guests" || requestedTab === "media" || requestedTab === "gifts") {
      setTab(requestedTab);
    }
  }, [searchParams]);

  const checkedInCount = useMemo(() => {
    return event?.guests.filter((guest) => guest.checkedIn).length ?? 0;
  }, [event]);

  const mediaByGroup = useMemo(() => {
    const groups: Record<string, MediaItem[]> = {};

    for (const item of event?.media ?? []) {
      const key = item.groupLabel?.trim() || "Ungrouped";
      groups[key] = [...(groups[key] ?? []), item];
    }

    return Object.entries(groups).sort(([left], [right]) => left.localeCompare(right));
  }, [event?.media]);

  async function handleSingleGuestSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;

    setGuestFormError(null);
    setGuestFormSuccess(null);

    const name = singleGuest.name.trim();
    const phone = singleGuest.phone.trim();
    const email = singleGuest.email.trim();

    if (name.length < 2) {
      setGuestFormError("Guest name must be at least 2 characters.");
      return;
    }

    setGuestSubmitting(true);

    try {
      const response = await fetch("/api/studio/guests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name,
          phone: phone || undefined,
          email: email || undefined,
          category: singleGuest.category,
          invitationCode: buildInvitationCode("gst"),
        }),
      });

      if (!response.ok) {
        setGuestFormError("Unable to add guest. Please check values and try again.");
        return;
      }

      setSingleGuest({ name: "", phone: "", email: "", category: "GENERAL" });
      setGuestFormSuccess("Guest added successfully.");
      await loadEvent(false);
    } catch {
      setGuestFormError("Unable to add guest right now.");
    } finally {
      setGuestSubmitting(false);
    }
  }

  async function handleBulkGuestSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;

    setGuestFormError(null);
    setGuestFormSuccess(null);

    const lines = bulkGuestText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setGuestFormError("Add at least one line for bulk guests.");
      return;
    }

    const guests = lines.map((line, index) => {
      const [rawName, rawPhone, rawEmail] = line.split(",").map((value) => value?.trim() || "");
      return {
        name: rawName,
        phone: rawPhone || undefined,
        email: rawEmail || undefined,
        category: "GENERAL" as GuestCategory,
        invitationCode: buildInvitationCode("bulk", index + 1),
      };
    });

    if (guests.some((guest) => guest.name.length < 2)) {
      setGuestFormError("Each line must start with a guest name of at least 2 characters.");
      return;
    }

    setGuestSubmitting(true);

    try {
      const response = await fetch("/api/studio/guests/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          guests,
        }),
      });

      if (!response.ok) {
        setGuestFormError("Bulk guest import failed. Verify each line format.");
        return;
      }

      setBulkGuestText("");
      setGuestFormSuccess(`${guests.length} guests added.`);
      await loadEvent(false);
    } catch {
      setGuestFormError("Bulk guest import failed right now.");
    } finally {
      setGuestSubmitting(false);
    }
  }

  async function handleMediaUploadSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event) return;

    setMediaFormError(null);
    setMediaFormSuccess(null);

    const url = mediaForm.url.trim();
    const groupLabel = mediaForm.groupLabel.trim();

    if (!url) {
      setMediaFormError("Media URL is required.");
      return;
    }

    setMediaSubmitting(true);

    try {
      const response = await fetch("/api/studio/media", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          type: mediaForm.type,
          url,
          groupLabel: groupLabel || undefined,
        }),
      });

      if (!response.ok) {
        setMediaFormError("Unable to upload media. Please check values and try again.");
        return;
      }

      setMediaForm({ type: "IMAGE", url: "", groupLabel: "" });
      setMediaFormSuccess("Media uploaded successfully.");
      await loadEvent(false);
    } catch {
      setMediaFormError("Unable to upload media right now.");
    } finally {
      setMediaSubmitting(false);
    }
  }

  if (status === "idle" || status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Loading wedding details...</p>
      </main>
    );
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <Link href="/studio/events" className="text-xs font-medium" style={{ color: "var(--secondary)" }}>
            ← Back to Events
          </Link>
          <h2 className="ui-title mt-1">{event?.title ?? "Wedding Details"}</h2>
          <p className="ui-subtitle">Overview, guests, media, and gifts for this wedding.</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading wedding details...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-700">{error}</p>
      ) : !event ? (
        <p className="mt-5 text-sm text-zinc-600">Wedding not found.</p>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Event date</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>{formatDateTime(event.eventDate)}</p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Guests checked in</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>
                {checkedInCount} / {event.guests.length}
              </p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Media files</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>{event.media.length}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["overview", "Overview"],
              ["guests", "Guests"],
              ["media", "Media"],
              ["gifts", "Gifts"],
            ].map(([value, label]) => {
              const active = tab === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value as EventTab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    active ? "text-white" : "border text-zinc-600 hover:opacity-75"
                  }`}
                  style={
                    active
                      ? { background: "linear-gradient(to right, var(--primary), var(--primary-light))" }
                      : { borderColor: "var(--border-subtle)", background: "var(--surface)" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {tab === "overview" ? (
            <section className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="ui-panel">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Wedding Overview</h3>
                <div className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p><span className="font-medium" style={{ color: "var(--text-primary)" }}>Couple:</span> {[event.brideName, event.groomName].filter(Boolean).join(" & ") || "Pending names"}</p>
                  <p><span className="font-medium" style={{ color: "var(--text-primary)" }}>Bride Phone:</span> {event.bridePhone || "—"}</p>
                  <p><span className="font-medium" style={{ color: "var(--text-primary)" }}>Groom Phone:</span> {event.groomPhone || "—"}</p>
                  <p><span className="font-medium" style={{ color: "var(--text-primary)" }}>Location:</span> {event.location || "No location"}</p>
                  <p><span className="font-medium" style={{ color: "var(--text-primary)" }}>Published:</span> {event.isPublished ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="ui-panel">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Google Map Address</h3>
                <p className="mt-3 break-all text-sm" style={{ color: "var(--text-secondary)" }}>{event.googleMapAddress}</p>
                <a
                  href={event.googleMapAddress}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-md px-3 py-1.5 text-xs font-medium text-white"
                  style={{ background: "linear-gradient(to right, var(--primary), var(--primary-light))" }}
                >
                  Open in Google Maps
                </a>
                {event.description ? (
                  <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === "guests" ? (
            <section className="mt-5 space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <form className="ui-panel space-y-3" onSubmit={handleSingleGuestSubmit}>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Add Single Guest</h3>
                  <input
                    value={singleGuest.name}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, name: changeEvent.target.value }))}
                    placeholder="Guest full name"
                    className="ui-input"
                    required
                  />
                  <input
                    value={singleGuest.phone}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, phone: changeEvent.target.value }))}
                    placeholder="Phone number"
                    className="ui-input"
                  />
                  <input
                    type="email"
                    value={singleGuest.email}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, email: changeEvent.target.value }))}
                    placeholder="Email"
                    className="ui-input"
                  />
                  <select
                    value={singleGuest.category}
                    onChange={(changeEvent) => setSingleGuest((current) => ({ ...current, category: changeEvent.target.value as GuestCategory }))}
                    className="ui-select"
                  >
                    <option value="GENERAL">General</option>
                    <option value="BRIDE_GUEST">Bride Guest</option>
                    <option value="GROOM_GUEST">Groom Guest</option>
                  </select>
                  <button type="submit" disabled={guestSubmitting} className="ui-button-primary">
                    {guestSubmitting ? "Adding..." : "Add Guest"}
                  </button>
                </form>

                <form className="ui-panel space-y-3" onSubmit={handleBulkGuestSubmit}>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Bulk Add Guests</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    One guest per line: Name, Phone, Email
                  </p>
                  <textarea
                    value={bulkGuestText}
                    onChange={(changeEvent) => setBulkGuestText(changeEvent.target.value)}
                    className="ui-textarea"
                    placeholder={"Abebe Kebede,+251900000000,abebe@example.com\nMimi Alemu,+251911111111,mimi@example.com"}
                  />
                  <button type="submit" disabled={guestSubmitting} className="ui-button-primary">
                    {guestSubmitting ? "Importing..." : "Import Guests"}
                  </button>
                </form>
              </div>

              {guestFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{guestFormError}</p> : null}
              {guestFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{guestFormSuccess}</p> : null}

              <div className="ui-table">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Name</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Category</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Phone</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Email</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.guests.map((guest) => (
                        <tr key={guest.id} className="border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                          <td className="px-4 py-3 text-zinc-700">{guest.name}</td>
                          <td className="px-4 py-3 text-zinc-600">{labelForCategory(guest.category)}</td>
                          <td className="px-4 py-3 text-zinc-600">{guest.phone || "—"}</td>
                          <td className="px-4 py-3 text-zinc-600">{guest.email || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${guest.checkedIn ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}>
                              {guest.checkedIn ? "Checked in" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {event.guests.length === 0 ? <p className="px-4 py-5 text-sm text-zinc-600">No guests added yet.</p> : null}
              </div>
            </section>
          ) : null}

          {tab === "media" ? (
            <section className="mt-5 space-y-4">
              <form className="ui-panel grid gap-3 md:grid-cols-4" onSubmit={handleMediaUploadSubmit}>
                <select
                  value={mediaForm.type}
                  onChange={(changeEvent) => setMediaForm((current) => ({ ...current, type: changeEvent.target.value as MediaType }))}
                  className="ui-select"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
                <input
                  value={mediaForm.groupLabel}
                  onChange={(changeEvent) => setMediaForm((current) => ({ ...current, groupLabel: changeEvent.target.value }))}
                  placeholder="Group (Photoshoot, Wedding, Reception)"
                  className="ui-input"
                />
                <input
                  value={mediaForm.url}
                  onChange={(changeEvent) => setMediaForm((current) => ({ ...current, url: changeEvent.target.value }))}
                  placeholder="https://..."
                  className="ui-input md:col-span-2"
                  required
                />
                <button type="submit" disabled={mediaSubmitting} className="ui-button-primary md:col-span-4 md:w-fit">
                  {mediaSubmitting ? "Uploading..." : "Upload Media"}
                </button>
              </form>

              {mediaFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{mediaFormError}</p> : null}
              {mediaFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{mediaFormSuccess}</p> : null}

              {mediaByGroup.length === 0 ? (
                <p className="rounded-lg border px-4 py-5 text-sm text-zinc-600" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                  No media uploaded yet.
                </p>
              ) : (
                mediaByGroup.map(([group, items]) => (
                  <div key={group} className="ui-table">
                    <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>{group}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{items.length} item(s)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                          <tr>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Type</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Uploaded</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                              <td className="px-4 py-3 text-zinc-700">{item.type}</td>
                              <td className="px-4 py-3 text-zinc-600">{formatDateTime(item.createdAt)}</td>
                              <td className="px-4 py-3 text-zinc-600 break-all">
                                <a href={item.url} target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--secondary)" }}>
                                  Open media
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </section>
          ) : null}

          {tab === "gifts" ? (
            <section className="mt-5 ui-panel">
              <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Gifts</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                No gifts recorded for this wedding yet.
              </p>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
