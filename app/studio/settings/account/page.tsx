"use client";

import { PhoneInput } from "@/components/ui/phone-input";
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
  const { status, refresh } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
      await refresh();
      setSuccess("Account settings updated successfully.");
    } catch {
      setError("Unable to save account settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    setError(null);
    setSuccess(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/studio/settings/account/logo", {
        method: "POST",
        credentials: "include",
        body,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Unable to upload logo");
        return;
      }

      const payload = (await response.json()) as { url: string };
      setFormData((current) => ({ ...current, studioLogoUrl: payload.url }));
      setSuccess("Logo uploaded. Save settings to apply it.");
    } catch {
      setError("Unable to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <main className="ui-page">
      <div>
        <h2 className="ui-title">Settings</h2>
        <p className="ui-subtitle">Manage your account, studio profile, and studio operations.</p>
      </div>

      <div className="mt-5 flex gap-2">
        <Link href="/studio/settings/account" className="rounded-lg px-3 py-2 text-sm font-medium" style={{ background: "linear-gradient(to right, var(--primary), var(--primary-light))", color: "white" }}>Account</Link>
        <Link href="/studio/settings/team" className="rounded-lg border px-3 py-2 text-sm font-medium" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>Team</Link>
      </div>

      {loading ? (
        <p className="mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>Loading account settings...</p>
      ) : (
        <form className="mt-5 space-y-5" onSubmit={handleSave}>
          <section className="ui-panel">
            <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>User Credentials</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Role: {role}. Update login phone and optionally rotate password.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Login Phone *</span>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData((current) => ({ ...current, phone: value ?? "" }))}
                  defaultCountry="ET"
                  className="w-full"
                  required
                />
              </label>

              <div className="hidden md:block" />

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Current Password</span>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(event) => setFormData((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="ui-input"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>New Password</span>
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
            <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Studio Profile</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {role === "ADMIN"
                ? "Update your studio identity visible across events and invitations."
                : "Studio profile fields are read-only for staff accounts."}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Studio Name</span>
                <input
                  value={formData.studioName}
                  onChange={(event) => setFormData((current) => ({ ...current, studioName: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Studio Email</span>
                <input
                  type="email"
                  value={formData.studioEmail}
                  onChange={(event) => setFormData((current) => ({ ...current, studioEmail: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Studio Phone</span>
                <PhoneInput
                  value={formData.studioPhone}
                  onChange={(value) => setFormData((current) => ({ ...current, studioPhone: value ?? "" }))}
                  disabled={role !== "ADMIN"}
                  defaultCountry="ET"
                  className="w-full"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Studio Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleLogoUpload(file);
                    }
                  }}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
                {formData.studioLogoUrl ? (
                  <p className="mt-1 truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Uploaded URL: {formData.studioLogoUrl}
                  </p>
                ) : null}
                {uploadingLogo ? (
                  <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Uploading logo...</p>
                ) : null}
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Primary Color Token / Value</span>
                <input
                  value={formData.studioPrimaryColor}
                  onChange={(event) => setFormData((current) => ({ ...current, studioPrimaryColor: event.target.value }))}
                  disabled={role !== "ADMIN"}
                  className="ui-input disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </label>
            </div>
          </section>

          {error ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{error}</p> : null}
          {success ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{success}</p> : null}

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
