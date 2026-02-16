"use client";

import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  title: string;
};

type MediaItem = {
  id: string;
  eventId: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
  };
};

type MediaResponse = { media: MediaItem[] };
type EventsResponse = { events: EventListItem[] };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function StudioMediaPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "IMAGE" | "VIDEO">("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventId: "",
    type: "IMAGE" as "IMAGE" | "VIDEO",
    url: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [mediaRes, eventsRes] = await Promise.all([
        fetch("/api/studio/media?scope=studio", { credentials: "include" }),
        fetch("/api/studio/events", { credentials: "include" }),
      ]);

      if (!mediaRes.ok || !eventsRes.ok) {
        throw new Error("Unable to load media");
      }

      const mediaJson = (await mediaRes.json()) as MediaResponse;
      const eventsJson = (await eventsRes.json()) as EventsResponse;

      setMedia(mediaJson.media ?? []);
      setEvents(eventsJson.events ?? []);
    } catch {
      setError("Unable to load media");
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

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();
    return media.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.url.toLowerCase().includes(query) ||
        (item.event?.title ?? "").toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (eventFilter !== "all" && item.eventId !== eventFilter) return false;
      return true;
    });
  }, [eventFilter, media, search, typeFilter]);

  const summary = useMemo(() => {
    const images = media.filter((item) => item.type === "IMAGE").length;
    const videos = media.filter((item) => item.type === "VIDEO").length;
    return { images, videos };
  }, [media]);

  async function handleCreateMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/studio/media", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: formData.eventId,
          type: formData.type,
          url: formData.url.trim(),
        }),
      });

      if (!response.ok) {
        setActionError("Unable to add media. Please validate event and URL.");
        return;
      }

      setFormData({ eventId: "", type: "IMAGE", url: "" });
      setSuccess("Media added successfully.");
      await loadData();
    } catch {
      setActionError("Unable to add media.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleToggleType(item: MediaItem) {
    setActionError(null);
    setSuccess(null);

    const nextType = item.type === "IMAGE" ? "VIDEO" : "IMAGE";

    try {
      const response = await fetch(`/api/studio/media/${item.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: nextType }),
      });

      if (!response.ok) {
        setActionError("Unable to update media type.");
        return;
      }

      setSuccess("Media type updated.");
      await loadData();
    } catch {
      setActionError("Unable to update media type.");
    }
  }

  async function handleDeleteMedia(item: MediaItem) {
    setActionError(null);
    setSuccess(null);

    const confirmed = window.confirm("Delete this media item?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/studio/media/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setActionError("Unable to delete media.");
        return;
      }

      setSuccess("Media deleted.");
      await loadData();
    } catch {
      setActionError("Unable to delete media.");
    }
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <h2 className="ui-title">Media</h2>
          <p className="ui-subtitle">Organize image/video assets for all studio events.</p>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search event title or URL"
          className="ui-input max-w-xs"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Total media</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{media.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Images</p>
          <p className="mt-1 text-xl font-semibold text-cyan-700">{summary.images}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Videos</p>
          <p className="mt-1 text-xl font-semibold text-violet-700">{summary.videos}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Events with media</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{new Set(media.map((item) => item.eventId)).size}</p>
        </div>
      </div>

      <section className="ui-panel mt-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-800">Add Media</h3>
          <p className="mt-1 text-sm text-zinc-600">Attach image/video links to an event timeline.</p>
        </div>

        <form className="space-y-4" onSubmit={handleCreateMedia}>
          <div className="grid gap-3 md:grid-cols-3">
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
              <span className="mb-1 block text-xs font-medium text-zinc-600">Type *</span>
              <select
                value={formData.type}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    type: event.target.value as "IMAGE" | "VIDEO",
                  }))
                }
                className="ui-select"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
            </label>

            <label className="block md:col-span-1">
              <span className="mb-1 block text-xs font-medium text-zinc-600">Media URL *</span>
              <input
                type="url"
                value={formData.url}
                onChange={(event) => setFormData((current) => ({ ...current, url: event.target.value }))}
                className="ui-input"
                required
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createLoading}
              className="ui-button-primary"
            >
              {createLoading ? "Adding..." : "Add Media"}
            </button>
          </div>
        </form>
      </section>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {["all", "IMAGE", "VIDEO"].map((value) => {
          const active = typeFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value as "all" | "IMAGE" | "VIDEO")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white"
                  : "border border-zinc-300 bg-zinc-50 text-zinc-600"
              }`}
            >
              {value === "all" ? "All types" : value}
            </button>
          );
        })}

        <select
          value={eventFilter}
          onChange={(event) => setEventFilter(event.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700"
        >
          <option value="all">All events</option>
          {events.map((studioEvent) => (
            <option key={studioEvent.id} value={studioEvent.id}>
              {studioEvent.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading media...</p>
      ) : (
        <div className="ui-table">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-100 align-top hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-700">{item.event?.title ?? "Unknown event"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${
                          item.type === "IMAGE"
                            ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                            : "border-violet-200 bg-violet-50 text-violet-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-cyan-700 underline underline-offset-2">
                        Open media
                      </a>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => void handleToggleType(item)}
                          className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs text-violet-700"
                        >
                          Toggle Type
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteMedia(item)}
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

          {filteredMedia.length === 0 ? <p className="px-4 py-5 text-sm text-zinc-600">No media match your filters.</p> : null}
        </div>
      )}
    </main>
  );
}
