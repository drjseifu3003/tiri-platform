"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type WebsiteTab = "featured" | "packages" | "gallery";

type FeaturedEventConfig = {
  id: number;
  photo: string;
  coupleName: string;
  place: string;
  date: string;
};

type PackageConfig = {
  id: string;
  name: string;
  price: string;
  description: string;
  facilities: string;
};

type WebsiteConfigStorage = {
  featuredEvents: FeaturedEventConfig[];
  packages: PackageConfig[];
  gallery: string[];
};

const STORAGE_KEY = "studio.website.config.v1";

function createDefaultFeaturedEvents(): FeaturedEventConfig[] {
  return [
    { id: 1, photo: "", coupleName: "", place: "", date: "" },
    { id: 2, photo: "", coupleName: "", place: "", date: "" },
    { id: 3, photo: "", coupleName: "", place: "", date: "" },
  ];
}

function createDefaultPackages(): PackageConfig[] {
  return [
    {
      id: `pkg-${Date.now()}`,
      name: "",
      price: "",
      description: "",
      facilities: "",
    },
  ];
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

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WebsiteConfigStorage;
        if (Array.isArray(parsed.featuredEvents) && parsed.featuredEvents.length > 0) {
          const normalizedFeatured = createDefaultFeaturedEvents().map((slot) => {
            const incoming = parsed.featuredEvents.find((item) => item.id === slot.id);
            return {
              ...slot,
              ...(incoming ?? {}),
            };
          });
          setFeaturedEvents(normalizedFeatured);
        }

        if (Array.isArray(parsed.packages) && parsed.packages.length > 0) {
          setPackages(parsed.packages);
        }

        if (Array.isArray(parsed.gallery)) {
          setGallery(parsed.gallery.filter((value) => typeof value === "string"));
        }
      }
    } catch {
      setError("Saved website configuration could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [router, status]);

  const packageCount = packages.length;
  const galleryCount = gallery.length;

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
        facilities: "",
      },
    ]);
  }

  function handleRemovePackage(id: string) {
    setPackages((current) => (current.length <= 1 ? current : current.filter((item) => item.id !== id)));
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

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSuccess("Website configuration saved.");
    } catch {
      setError("Unable to save website configuration.");
    } finally {
      setSaving(false);
    }
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

      <div className="mt-4 flex gap-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
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
          Featured Event
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
          Package {packageCount > 0 ? `(${packageCount})` : ""}
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
          Gallery {galleryCount > 0 ? `(${galleryCount})` : ""}
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
            <article key={item.id} className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Featured Event #{item.id}</h3>
                <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
                  Slot {item.id}
                </span>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
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

              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Couple Name</span>
                <input
                  value={item.coupleName}
                  onChange={(event) =>
                    setFeaturedEvents((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, coupleName: event.target.value } : entry
                      )
                    )
                  }
                  placeholder="Bride & Groom"
                  className="ui-input"
                />
              </label>

              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Place</span>
                <input
                  value={item.place}
                  onChange={(event) =>
                    setFeaturedEvents((current) =>
                      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, place: event.target.value } : entry))
                    )
                  }
                  placeholder="Wedding Venue"
                  className="ui-input"
                />
              </label>

              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Date</span>
                <input
                  type="date"
                  value={item.date}
                  onChange={(event) =>
                    setFeaturedEvents((current) =>
                      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, date: event.target.value } : entry))
                    )
                  }
                  className="ui-input"
                />
              </label>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && activeTab === "packages" ? (
        <section className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex justify-end">
            <button type="button" className="ui-button-secondary" onClick={handleAddPackage}>
              Add Package
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {packages.map((pkg) => (
              <article key={pkg.id} className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Package</h3>
                  <button
                    type="button"
                    onClick={() => handleRemovePackage(pkg.id)}
                    disabled={packages.length <= 1}
                    className="rounded-lg border px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}
                  >
                    Remove
                  </button>
                </div>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Package Name</span>
                  <input
                    value={pkg.name}
                    onChange={(event) =>
                      setPackages((current) =>
                        current.map((entry) => (entry.id === pkg.id ? { ...entry, name: event.target.value } : entry))
                      )
                    }
                    placeholder="Classic Wedding"
                    className="ui-input"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Price</span>
                  <input
                    value={pkg.price}
                    onChange={(event) =>
                      setPackages((current) =>
                        current.map((entry) => (entry.id === pkg.id ? { ...entry, price: event.target.value } : entry))
                      )
                    }
                    placeholder="$2,000"
                    className="ui-input"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Description</span>
                  <textarea
                    value={pkg.description}
                    onChange={(event) =>
                      setPackages((current) =>
                        current.map((entry) => (entry.id === pkg.id ? { ...entry, description: event.target.value } : entry))
                      )
                    }
                    rows={3}
                    placeholder="Package details and highlights"
                    className="ui-input"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Facility List</span>
                  <textarea
                    value={pkg.facilities}
                    onChange={(event) =>
                      setPackages((current) =>
                        current.map((entry) => (entry.id === pkg.id ? { ...entry, facilities: event.target.value } : entry))
                      )
                    }
                    rows={4}
                    placeholder={"One facility per line\nExample:\n2 Photographers\nDrone Coverage\nOnline Gallery"}
                    className="ui-input"
                  />
                </label>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && activeTab === "gallery" ? (
        <section className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Photo Gallery</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  Upload and organize the photos shown on your public website gallery.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}>
                Upload Photos
                <input type="file" multiple accept="image/*" onChange={(event) => void handleGalleryUpload(event)} className="sr-only" />
              </label>
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

      <div className="mt-auto flex justify-end border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
        <button type="button" disabled={saving || !canSave} onClick={() => void handleSave()} className="ui-button-primary min-w-44">
          {saving ? "Saving..." : "Save Website Configuration"}
        </button>
      </div>
    </main>
  );
}
