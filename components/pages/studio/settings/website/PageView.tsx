"use client";

import { useSession } from "@/lib/session-context";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type WebsiteTab = "featured" | "packages" | "gallery";

type FeaturedEventConfig = {
  id: number;
  eventId?: string | null;
  photo: string;
  coupleName: string;
  place: string;
  date: string;
};

type StudioEventOption = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  eventDate: string;
  location: string | null;
};

type StudioEventsResponse = {
  events?: StudioEventOption[];
  pagination?: {
    hasNext?: boolean;
  };
};

type PackageConfig = {
  id: string;
  name: string;
  price: string;
  description: string;
  isActive: boolean;
  facilities: Array<{
    id: string;
    label: string;
    active: boolean;
  }>;
};

type WebsiteConfigStorage = {
  featuredEvents: FeaturedEventConfig[];
  packages: PackageConfig[];
  gallery: string[];
};

function createDefaultFeaturedEvents(): FeaturedEventConfig[] {
  return [
    { id: 1, eventId: null, photo: "", coupleName: "", place: "", date: "" },
    { id: 2, eventId: null, photo: "", coupleName: "", place: "", date: "" },
    { id: 3, eventId: null, photo: "", coupleName: "", place: "", date: "" },
  ];
}

function createDefaultPackages(): PackageConfig[] {
  return [
    {
      id: `pkg-${Date.now()}`,
      name: "",
      price: "",
      description: "",
      isActive: true,
      facilities: [],
    },
  ];
}

function eventCoupleLabel(event: StudioEventOption) {
  const couple = [event.brideName, event.groomName].filter(Boolean).join(" & ");
  return couple || event.title;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeFacilities(value: unknown): PackageConfig["facilities"] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;

        const maybeLabel = "label" in item ? String(item.label ?? "").trim() : "";
        if (!maybeLabel) return null;

        const maybeId = "id" in item && typeof item.id === "string" ? item.id : `fac-${Date.now()}-${index}`;
        const maybeActive = "active" in item ? Boolean(item.active) : true;

        return {
          id: maybeId,
          label: maybeLabel,
          active: maybeActive,
        };
      })
      .filter((item): item is PackageConfig["facilities"][number] => item !== null);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line, index) => ({
        id: `fac-${Date.now()}-${index}`,
        label: line.trim(),
        active: true,
      }))
      .filter((item) => item.label.length > 0);
  }

  return [];
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function StudioWebsiteSettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<WebsiteTab>("featured");
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEventConfig[]>(createDefaultFeaturedEvents);
  const [packages, setPackages] = useState<PackageConfig[]>(createDefaultPackages);
  const [gallery, setGallery] = useState<string[]>([]);
  const [facilityDraftByPackage, setFacilityDraftByPackage] = useState<Record<string, string>>({});
  const [openFeaturedPickerId, setOpenFeaturedPickerId] = useState<number | null>(null);
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState("");
  const [featuredSearchResults, setFeaturedSearchResults] = useState<StudioEventOption[]>([]);
  const [featuredSearchLoading, setFeaturedSearchLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    let didCancel = false;

    async function initialize() {
      setLoading(true);
      setError(null);

      try {
        let nextFeatured = createDefaultFeaturedEvents();
        let nextPackages = createDefaultPackages();
        let nextGallery: string[] = [];

        const settingsResponse = await fetch("/api/studio/settings/website", {
          credentials: "include",
        });

        if (!settingsResponse.ok) {
          throw new Error("Unable to load website settings");
        }

        const parsed = (await settingsResponse.json()) as WebsiteConfigStorage;

        if (Array.isArray(parsed.featuredEvents) && parsed.featuredEvents.length > 0) {
          nextFeatured = createDefaultFeaturedEvents().map((slot) => {
            const incoming = parsed.featuredEvents.find((item) => item.id === slot.id);
            return {
              ...slot,
              ...(incoming ?? {}),
              eventId: typeof incoming?.eventId === "string" ? incoming.eventId : null,
            };
          });
        }

        if (Array.isArray(parsed.packages) && parsed.packages.length > 0) {
          nextPackages = parsed.packages.map((pkg, index) => ({
            id: typeof pkg?.id === "string" ? pkg.id : `pkg-${Date.now()}-${index}`,
            name: typeof pkg?.name === "string" ? pkg.name : "",
            price: typeof pkg?.price === "string" ? pkg.price : "",
            description: typeof pkg?.description === "string" ? pkg.description : "",
            isActive: typeof pkg?.isActive === "boolean" ? pkg.isActive : true,
            facilities: normalizeFacilities((pkg as { facilities?: unknown } | null)?.facilities),
          }));
        }

        if (Array.isArray(parsed.gallery)) {
          nextGallery = parsed.gallery.filter((value) => typeof value === "string");
        }

        if (!didCancel) {
          setFeaturedEvents(nextFeatured);
          setPackages(nextPackages);
          setGallery(nextGallery);
        }
      } catch {
        if (!didCancel) {
          setError("Saved website configuration could not be loaded.");
        }
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      didCancel = true;
    };
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (openFeaturedPickerId === null) return;

    let didCancel = false;

    async function searchEvents() {
      setFeaturedSearchLoading(true);

      try {
        const params = new URLSearchParams({
          page: "1",
          pageSize: "12",
          filter: "all",
        });

        const trimmedQuery = featuredSearchQuery.trim();
        if (trimmedQuery.length > 0) {
          params.set("search", trimmedQuery);
        }

        const response = await fetch(`/api/studio/events?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to search events");
        }

        const payload = (await response.json()) as StudioEventsResponse;
        if (!didCancel) {
          setFeaturedSearchResults(payload.events ?? []);
        }
      } catch {
        if (!didCancel) {
          setFeaturedSearchResults([]);
        }
      } finally {
        if (!didCancel) {
          setFeaturedSearchLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      void searchEvents();
    }, 250);

    return () => {
      didCancel = true;
      clearTimeout(timer);
    };
  }, [featuredSearchQuery, openFeaturedPickerId, status]);

  const packageCount = packages.length;
  const galleryCount = gallery.length;
  const featuredReadyCount = featuredEvents.filter((item) => item.photo || item.coupleName || item.place || item.date).length;

  const canSave = useMemo(() => {
    return featuredEvents.length === 3;
  }, [featuredEvents.length]);

  async function handleFeaturedImageUpload(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const dataUrl = await fileToDataUrl(file);
      setFeaturedEvents((current) =>
        current.map((item, itemIndex) => (itemIndex === index ? { ...item, photo: dataUrl } : item))
      );
    } catch {
      setError("Unable to upload featured event photo.");
    }
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError(null);

    try {
      const uploads = await Promise.all(files.map((file) => fileToDataUrl(file)));
      setGallery((current) => [...uploads, ...current]);
    } catch {
      setError("Unable to upload one or more gallery photos.");
    }
  }

  function handleAddPackage() {
    setPackages((current) => [
      ...current,
      {
        id: `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: "",
        price: "",
        description: "",
        isActive: true,
        facilities: [],
      },
    ]);
  }

  function handleRemovePackage(id: string) {
    setPackages((current) => current.filter((item) => item.id !== id));
  }

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: WebsiteConfigStorage = {
        featuredEvents,
        packages,
        gallery,
      };

      const response = await fetch("/api/studio/settings/website", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to save website configuration");
      }

      setSuccess("Website configuration saved.");
    } catch {
      setError("Unable to save website configuration.");
    } finally {
      setSaving(false);
    }
  }

  function updateFeaturedEvent(index: number, patch: Partial<FeaturedEventConfig>) {
    setFeaturedEvents((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry))
    );
  }

  function handleFeaturedEventSelect(index: number, selectedEvent: StudioEventOption | null) {
    if (!selectedEvent) {
      updateFeaturedEvent(index, {
        eventId: null,
        coupleName: "",
        place: "",
        date: "",
      });
      return;
    }

    updateFeaturedEvent(index, {
      eventId: selectedEvent.id,
      coupleName: eventCoupleLabel(selectedEvent),
      place: selectedEvent.location ?? "",
      date: selectedEvent.eventDate,
    });
  }

  function updatePackage(id: string, patch: Partial<PackageConfig>) {
    setPackages((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }

  function addFacilityToPackage(packageId: string) {
    const draft = (facilityDraftByPackage[packageId] ?? "").trim();
    if (!draft) return;

    updatePackage(packageId, {
      facilities: (
        packages.find((pkg) => pkg.id === packageId)?.facilities ?? []
      ).concat({
        id: `fac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: draft,
        active: true,
      }),
    });

    setFacilityDraftByPackage((current) => ({ ...current, [packageId]: "" }));
  }

  function toggleFacility(packageId: string, facilityId: string) {
    const target = packages.find((pkg) => pkg.id === packageId);
    if (!target) return;

    updatePackage(packageId, {
      facilities: target.facilities.map((facility) =>
        facility.id === facilityId ? { ...facility, active: !facility.active } : facility
      ),
    });
  }

  function removeFacility(packageId: string, facilityId: string) {
    const target = packages.find((pkg) => pkg.id === packageId);
    if (!target) return;

    updatePackage(packageId, {
      facilities: target.facilities.filter((facility) => facility.id !== facilityId),
    });
  }

  if (status === "idle" || status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading website settings...</p>
      </main>
    );
  }

  return (
    <main className="ui-page rounded-lg flex min-h-[calc(100dvh-7rem)] flex-col p-4">
      <div>
        <h2 className="ui-title">Settings</h2>
        <p className="ui-subtitle">Configure how your public website showcases events, packages, and galleries.</p>
      </div>

      <div className="mt-4 flex gap-8 border-b pb-2" style={{ borderColor: "var(--border-subtle)" }}>
        <Link
          href="/studio/settings/account"
          className="relative py-3 text-sm font-medium"
          style={{ color: "var(--text-secondary)", borderBottom: "2px solid transparent", marginBottom: "-2px" }}
        >
          Account
        </Link>
        <Link
          href="/studio/settings/team"
          className="relative py-3 text-sm font-medium"
          style={{ color: "var(--text-secondary)", borderBottom: "2px solid transparent", marginBottom: "-2px" }}
        >
          Team
        </Link>
        <Link
          href="/studio/settings/website"
          className="relative py-3 text-sm font-medium"
          style={{ color: "var(--primary)", borderBottom: "2px solid var(--primary)", marginBottom: "-2px" }}
        >
          Website
        </Link>
      </div>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Featured Slots</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{featuredReadyCount}/3</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Configured homepage highlights</p>
        </article>
        <article className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Packages</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{packageCount}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Pricing options on your website</p>
        </article>
        <article className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Gallery Photos</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{galleryCount}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Images visible in public gallery</p>
        </article>
      </section>

      <div className="mt-4 flex gap-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("featured")}
            className="relative py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "featured" ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === "featured" ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            Featured Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className="relative py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "packages" ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === "packages" ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            Packages ({packageCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className="relative py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "gallery" ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === "gallery" ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            Gallery ({galleryCount})
          </button>
      </div>

      {loading ? (
        <section className="mt-5 flex min-h-[18rem] items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading website configuration...</p>
        </section>
      ) : null}

      {!loading && activeTab === "featured" ? (
        <section className="mt-5 grid gap-4 xl:grid-cols-3">
          {featuredEvents.map((item, index) => (
            <article key={item.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              {(() => {
                const selectedLabel = item.coupleName || "Search and select an event";

                return (
                  <>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Featured Event #{item.id}</h3>
                <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
                  Slot {item.id}
                </span>
              </div>

              <div className="mt-3 block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Select Event</span>
                <Popover
                  open={openFeaturedPickerId === item.id}
                  onOpenChange={(isOpen) => {
                    setOpenFeaturedPickerId(isOpen ? item.id : null);
                    setFeaturedSearchQuery("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-between rounded-lg border px-3 text-left text-sm"
                      style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-primary)" }}
                    >
                      <span className="truncate">
                        {selectedLabel}
                      </span>
                      <svg className="ml-3 h-4 w-4 shrink-0" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(32rem,calc(100vw-2rem))] p-0" align="start">
                    <div className="border-b border-zinc-200 p-3">
                      <Input
                        value={featuredSearchQuery}
                        onChange={(event) => setFeaturedSearchQuery(event.target.value)}
                        placeholder="Search by event, couple, or location..."
                        className="h-10"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleFeaturedEventSelect(index, null);
                          setOpenFeaturedPickerId(null);
                        }}
                        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition hover:bg-zinc-100"
                      >
                        Clear selection
                      </button>

                      {featuredSearchLoading ? (
                        <p className="px-3 py-4 text-sm text-zinc-500">Searching events...</p>
                      ) : featuredSearchResults.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-zinc-500">No matching events found.</p>
                      ) : (
                        featuredSearchResults.map((eventOption) => (
                          <button
                            key={eventOption.id}
                            type="button"
                            onClick={() => {
                              handleFeaturedEventSelect(index, eventOption);
                              setOpenFeaturedPickerId(null);
                            }}
                            className="flex w-full items-start rounded-md px-3 py-2 text-left transition hover:bg-zinc-100"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-zinc-900">{eventOption.title}</p>
                              <p className="truncate text-xs text-zinc-500">
                                {eventCoupleLabel(eventOption)}
                                {eventOption.location ? ` · ${eventOption.location}` : ""}
                                {` · ${formatEventDate(eventOption.eventDate)}`}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                {item.photo ? (
                  <img src={item.photo} alt={`Featured event ${item.id}`} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                    No photo uploaded
                  </div>
                )}
              </div>

              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleFeaturedImageUpload(index, event)}
                  className="ui-input"
                />
              </label>

              <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-secondary)" }}>Selected Event Details</p>
                <div className="mt-3 grid gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Couple</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.coupleName || "No event selected"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Location</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.place || "No location provided"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Date</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.date ? formatEventDate(item.date) : "No date selected"}</p>
                  </div>
                </div>
              </div>
                  </>
                );
              })()}
            </article>
          ))}
        </section>
      ) : null}

      {!loading && activeTab === "packages" ? (
        <section className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Package Builder</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Create clear package tiers for your public website.</p>
            </div>
            <button type="button" className="ui-button-secondary" onClick={handleAddPackage}>
              + Add Package
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {packages.map((pkg) => (
              <article key={pkg.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Package</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePackage(pkg.id, { isActive: !pkg.isActive })}
                      className="rounded-lg border px-2.5 py-1 text-xs font-semibold"
                      style={{
                        borderColor: pkg.isActive ? "#fecdd3" : "#86efac",
                        color: pkg.isActive ? "#9f1239" : "#166534",
                        background: pkg.isActive ? "#fff1f2" : "#f0fdf4",
                      }}
                    >
                      {pkg.isActive ? "Hide on website" : "Show on website"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(pkg.id)}
                      className="rounded-lg border px-2.5 py-1 text-xs font-semibold transition hover:opacity-90"
                      style={{ borderColor: "#fecaca", color: "#b91c1c", background: "#fff1f2" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Package Name</span>
                  <input
                    value={pkg.name}
                    onChange={(event) => updatePackage(pkg.id, { name: event.target.value })}
                    placeholder="Classic Wedding"
                    className="ui-input"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Price</span>
                  <input
                    value={pkg.price}
                    onChange={(event) => updatePackage(pkg.id, { price: event.target.value })}
                    placeholder="ETB 120,000"
                    className="ui-input"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Description</span>
                  <textarea
                    value={pkg.description}
                    onChange={(event) => updatePackage(pkg.id, { description: event.target.value })}
                    rows={3}
                    placeholder="Package details and highlights"
                    className="ui-input"
                  />
                </label>

                <section className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-secondary)" }}>
                      Facilities
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {pkg.facilities.length} item{pkg.facilities.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={facilityDraftByPackage[pkg.id] ?? ""}
                      onChange={(event) =>
                        setFacilityDraftByPackage((current) => ({
                          ...current,
                          [pkg.id]: event.target.value,
                        }))
                      }
                      onKeyDown={(keyboardEvent) => {
                        if (keyboardEvent.key === "Enter") {
                          keyboardEvent.preventDefault();
                          addFacilityToPackage(pkg.id);
                        }
                      }}
                      placeholder="Add facility (e.g. Drone Coverage)"
                      className="ui-input"
                    />
                    <button
                      type="button"
                      onClick={() => addFacilityToPackage(pkg.id)}
                      className="inline-flex h-10 items-center rounded-lg border px-3 text-sm"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--primary)", background: "var(--surface)" }}
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {pkg.facilities.map((facility) => (
                      <div
                        key={facility.id}
                        className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                        style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
                      >
                        <p
                          className="min-w-0 truncate text-sm"
                          style={{
                            color: facility.active ? "var(--text-primary)" : "var(--text-tertiary)",
                            textDecoration: facility.active ? "none" : "line-through",
                          }}
                        >
                          {facility.label}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFacility(pkg.id, facility.id)}
                            className="rounded-md border px-2 py-1 text-xs"
                            style={{
                              borderColor: facility.active ? "#86efac" : "var(--border-subtle)",
                              color: facility.active ? "#166534" : "var(--text-secondary)",
                              background: facility.active ? "#f0fdf4" : "var(--surface-muted)",
                            }}
                          >
                            {facility.active ? "Hide on website" : "Show on website"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFacility(pkg.id, facility.id)}
                            className="rounded-md border px-2 py-1 text-xs"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {pkg.facilities.length === 0 ? (
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        No facilities yet. Add your first facility above.
                      </p>
                    ) : null}
                  </div>
                </section>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && activeTab === "gallery" ? (
        <section className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Photo Gallery</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  Upload and organize the photos shown on your public website gallery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}>
                  Upload Photos
                  <input type="file" multiple accept="image/*" onChange={(event) => void handleGalleryUpload(event)} className="sr-only" />
                </label>
                <button
                  type="button"
                  onClick={() => setGallery([])}
                  disabled={gallery.length === 0}
                  className="inline-flex items-center rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-secondary)" }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {gallery.map((photo, index) => (
              <article key={`${photo.slice(0, 20)}-${index}`} className="group relative overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <img src={photo} alt={`Gallery ${index + 1}`} className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setGallery((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="absolute right-2 top-2 rounded-full border px-2 py-0.5 text-xs opacity-0 transition group-hover:opacity-100"
                  style={{ borderColor: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.55)", color: "white" }}
                >
                  Remove
                </button>
              </article>
            ))}

            {gallery.length === 0 ? (
              <div className="col-span-full flex min-h-40 items-center justify-center rounded-lg border border-dashed px-4 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
                No gallery photos yet.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {error ? <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{success}</p> : null}

      <div className="mt-auto flex justify-end pt-4 mt-4" style={{ borderColor: "var(--border-subtle)" }}>
        <button type="button" disabled={saving || !canSave} onClick={() => void handleSave()} className="ui-button-primary min-w-44">
          {saving ? "Saving..." : "Save Website Configuration"}
        </button>
      </div>
    </main>
  );
}

