"use client";

import { useSession } from "@/lib/session-context";
import { Eye, EyeOff } from "lucide-react";
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    studioName: "",
    studioLogoUrl: "",
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
          currentPassword: "",
          newPassword: "",
          studioName: data.studio?.name ?? "",
          studioLogoUrl: data.studio?.logoUrl ?? "",
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

    const payload: Record<string, string | null> = {};

    if (formData.currentPassword.trim()) payload.currentPassword = formData.currentPassword.trim();
    if (formData.newPassword.trim()) payload.newPassword = formData.newPassword.trim();

    if (role === "ADMIN") {
      payload.studioName = formData.studioName.trim();
      payload.studioLogoUrl = formData.studioLogoUrl.trim() || null;
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
    <main className="ui-page rounded-lg flex min-h-[calc(100dvh-7rem)] flex-col p-4">
      <div>
        <h2 className="ui-title">Settings</h2>
        <p className="ui-subtitle">Manage account security and studio profile in one place.</p>
      </div>

      <div className="mt-4 flex gap-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <Link
          href="/studio/settings/account"
          className="relative py-3 text-sm font-medium"
          style={{
            color: "var(--primary)",
            borderBottom: "2px solid var(--primary)",
            marginBottom: "-2px",
          }}
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
          style={{ color: "var(--text-secondary)", borderBottom: "2px solid transparent", marginBottom: "-2px" }}
        >
          Website
        </Link>
      </div>

      {loading ? (
        <div className="mt-5 flex min-h-[16rem] items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading account settings...</p>
        </div>
      ) : (
        <form className="mt-5 flex min-h-0 flex-1 flex-col gap-4" onSubmit={handleSave}>
          <section className="grid gap-4 xl:grid-cols-2">
            <article className="ui-panel h-full rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Password</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Use a strong password to secure your account.</p>
                </div>
                <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--surface-muted)" }}>
                  {role}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Current Password</span>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(event) => setFormData((current) => ({ ...current, currentPassword: event.target.value }))}
                      className="ui-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      title={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>New Password</span>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(event) => setFormData((current) => ({ ...current, newPassword: event.target.value }))}
                      className="ui-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      title={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              </div>
            </article>

            <article className="ui-panel h-full rounded-lg">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Studio Profile</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {role === "ADMIN"
                    ? "Update your studio identity and branding assets."
                    : "Studio profile fields are read-only for staff accounts."}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
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

                  {uploadingLogo ? (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>Uploading logo...</p>
                  ) : null}

                  {formData.studioLogoUrl ? (
                    <div className="mt-2 rounded-lg border p-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      <p className="truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {formData.studioLogoUrl}
                      </p>
                    </div>
                  ) : null}
                </label>
              </div>
            </article>
          </section>

          {error ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{error}</p> : null}
          {success ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{success}</p> : null}

          <div className="mt-auto flex justify-end border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
            <button type="submit" disabled={saving} className="ui-button-primary min-w-36">
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

