"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type AccountSettingsResponse = {
  user: {
    id: string;
    phone: string;
    role: "ADMIN" | "STAFF";
  };
  studio: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    logoUrl: string | null;
    primaryColor: string | null;
  } | null;
};

export default function StudioAccountSettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [formData, setFormData] = useState({
    phone: "",
    currentPassword: "",
    newPassword: "",
    studioName: "",
    studioEmail: "",
    studioPhone: "",
    studioLogoUrl: "",
    studioPrimaryColor: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/studio/settings/account", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load account settings");
        }

        const data = (await response.json()) as AccountSettingsResponse;

        if (cancelled) return;

        setRole(data.user.role);
        setFormData({
          phone: data.user.phone ?? "",
          currentPassword: "",
          newPassword: "",
          studioName: data.studio?.name ?? "",
          studioEmail: data.studio?.email ?? "",
          studioPhone: data.studio?.phone ?? "",
          studioLogoUrl: data.studio?.logoUrl ?? "",
          studioPrimaryColor: data.studio?.primaryColor ?? "",
        });
      } catch {
        if (!cancelled) setError("Unable to load account settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: Record<string, string | null> = {
      phone: formData.phone.trim(),
    };

    if (formData.currentPassword.trim()) payload.currentPassword = formData.currentPassword.trim();
    if (formData.newPassword.trim()) payload.newPassword = formData.newPassword.trim();

    if (role === "ADMIN") {
      payload.studioName = formData.studioName.trim();
      payload.studioEmail = formData.studioEmail.trim() || null;
      payload.studioPhone = formData.studioPhone.trim();
      payload.studioLogoUrl = formData.studioLogoUrl.trim() || null;
      payload.studioPrimaryColor = formData.studioPrimaryColor.trim() || null;
    }

    try {
      const response = await fetch("/api/studio/settings/account", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Unable to save account settings");
        return;
      }

      setFormData((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));
      setSuccess("Account settings updated successfully.");
    } catch {
      setError("Unable to save account settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="ui-page">
      <div>
        <h2 className="ui-title">Account Settings</h2>
        <p className="ui-subtitle">Manage login details, studio profile, and identity configuration.</p>
      </div>

      <div className="mt-3 flex gap-2 text-xs">
        <Link href="/studio/settings/account" className="rounded-md bg-gradient-to-r from-cyan-400 to-violet-400 px-3 py-1.5 text-white">Account</Link>
        <Link href="/studio/settings/notifications" className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-zinc-700">Notifications</Link>
        <Link href="/studio/settings/team" className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-zinc-700">Team</Link>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading account settings...</p>
      ) : (
        <form className="mt-5 space-y-5" onSubmit={handleSave}>
          <section className="ui-panel">
            <h3 className="text-lg font-semibold text-zinc-800">User Credentials</h3>
            <p className="mt-1 text-sm text-zinc-600">Role: {role}. Update login phone and optionally rotate password.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Login Phone *</span>
                <input
                  value={formData.phone}
                  onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                  className="ui-input"
                  required
                />
              </label>

              <div className="hidden md:block" />

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Current Password</span>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(event) => setFormData((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="ui-input"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">New Password</span>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(event) => setFormData((current) => ({ ...current, newPassword: event.target.value }))}
                  className="ui-input"
                />
              </label>
            </div>
          </section>

          <section className="ui-panel">
            <h3 className="text-lg font-semibold text-zinc-800">Studio Profile</h3>
            <p className="mt-1 text-sm text-zinc-600">
              {role === "ADMIN"
                ? "Update your studio identity visible across events and invitations."
                : "Studio profile fields are read-only for staff accounts."}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Studio Name</span>
                <input
                  value={formData.studioName}
                  onChange={(event) => setFormData((current) => ({ ...current, studioName: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Studio Email</span>
                <input
                  type="email"
                  value={formData.studioEmail}
                  onChange={(event) => setFormData((current) => ({ ...current, studioEmail: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Studio Phone</span>
                <input
                  value={formData.studioPhone}
                  onChange={(event) => setFormData((current) => ({ ...current, studioPhone: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Logo URL</span>
                <input
                  type="url"
                  value={formData.studioLogoUrl}
                  onChange={(event) => setFormData((current) => ({ ...current, studioLogoUrl: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Primary Color Token / Value</span>
                <input
                  value={formData.studioPrimaryColor}
                  onChange={(event) => setFormData((current) => ({ ...current, studioPrimaryColor: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>
            </div>
          </section>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="ui-button-primary"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
