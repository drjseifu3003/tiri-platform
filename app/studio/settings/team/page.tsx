"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type TeamRole = "EDITOR" | "CUSTOMER_SERVICE" | "EVENT_PLANNER" | "PHOTO_CREW";

type TeamMember = {
  id: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  teamRole: TeamRole;
  createdAt: string;
};

type TeamResponse = {
  members: TeamMember[];
};

const teamRoleOptions: Array<{ value: TeamRole; label: string }> = [
  { value: "EDITOR", label: "Editor" },
  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
  { value: "EVENT_PLANNER", label: "Event Planner" },
  { value: "PHOTO_CREW", label: "Photo Crew" },
];

function roleLabel(value: TeamRole) {
  return teamRoleOptions.find((item) => item.value === value)?.label ?? value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function StudioTeamSettingsPage() {
  const { status, session } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | TeamRole>("all");
  const [createLoading, setCreateLoading] = useState(false);
  const [resetForMemberId, setResetForMemberId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    teamRole: "EVENT_PLANNER" as TeamRole,
  });

  const isAdmin = session?.user.role === "ADMIN";

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/studio/settings/team", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Unable to load team members");
      }

      const data = (await response.json()) as TeamResponse;
      setMembers(data.members ?? []);
    } catch {
      setError("Unable to load team members");
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
    void loadMembers();
  }, [loadMembers, router, status]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        query.length === 0 ||
        member.phone.toLowerCase().includes(query) ||
        roleLabel(member.teamRole).toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (roleFilter !== "all" && member.teamRole !== roleFilter) return false;
      return true;
    });
  }, [members, roleFilter, search]);

  const summary = useMemo(() => {
    return {
      admins: members.filter((member) => member.role === "ADMIN").length,
      staff: members.filter((member) => member.role === "STAFF").length,
      photoCrew: members.filter((member) => member.teamRole === "PHOTO_CREW").length,
    };
  }, [members]);

  async function handleCreateMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateLoading(true);
    setActionError(null);
    setSuccess(null);

    if (!isAdmin) {
      setActionError("Only admin users can add team members.");
      setCreateLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/studio/settings/team", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone.trim(),
          password: formData.password,
          teamRole: formData.teamRole,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(body?.error ?? "Unable to add team member");
        return;
      }

      setFormData({ phone: "", password: "", teamRole: "EVENT_PLANNER" });
      setSuccess("Team member added successfully.");
      await loadMembers();
    } catch {
      setActionError("Unable to add team member");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleUpdateRole(member: TeamMember, nextRole: TeamRole) {
    setActionError(null);
    setSuccess(null);

    if (!isAdmin) {
      setActionError("Only admin users can update team roles.");
      return;
    }

    try {
      const response = await fetch(`/api/studio/settings/team/${member.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamRole: nextRole }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(body?.error ?? "Unable to update team role");
        return;
      }

      setSuccess("Team role updated.");
      await loadMembers();
    } catch {
      setActionError("Unable to update team role");
    }
  }
  async function handleResetPassword(memberId: string) {
    const nextPassword = window.prompt("Set new password (min 6 chars):");
    if (!nextPassword) return;

    if (nextPassword.length < 6) {
      setActionError("Password must be at least 6 characters.");
      return;
    }

    setResetForMemberId(memberId);
    setActionError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/studio/settings/team/${memberId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nextPassword }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(body?.error ?? "Unable to reset password");
        return;
      }

      setSuccess("Password reset successfully.");
    } catch {
      setActionError("Unable to reset password");
    } finally {
      setResetForMemberId(null);
    }
  }

  async function handleDeleteMember(member: TeamMember) {
    setActionError(null);
    setSuccess(null);

    if (!isAdmin) {
      setActionError("Only admin users can remove team members.");
      return;
    }

    const confirmed = window.confirm(`Remove ${member.phone} from studio team?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/studio/settings/team/${member.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(body?.error ?? "Unable to remove team member");
        return;
      }

      setSuccess("Team member removed.");
      await loadMembers();
    } catch {
      setActionError("Unable to remove team member");
    }
  }

  return (
    <main className="ui-page">
      <div className="ui-page-header">
        <div>
          <h2 className="ui-title">Team Settings</h2>
          <p className="ui-subtitle">Manage studio team members and assign operational roles.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <Link href="/studio/settings/account" className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-zinc-700">Account</Link>
          <Link href="/studio/settings/notifications" className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-zinc-700">Notifications</Link>
          <Link href="/studio/settings/team" className="rounded-md bg-gradient-to-r from-cyan-400 to-violet-400 px-3 py-1.5 text-white">Team</Link>
        </div>
      </div>

      {!isAdmin ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          STAFF mode: view-only access. ADMIN can add/remove members and change roles.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Total members</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{members.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Admins</p>
          <p className="mt-1 text-xl font-semibold text-cyan-700">{summary.admins}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Staff</p>
          <p className="mt-1 text-xl font-semibold text-violet-700">{summary.staff}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Photo crew</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{summary.photoCrew}</p>
        </div>
      </div>

      <section className="ui-panel mt-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-800">Add Team Member</h3>
          <p className="mt-1 text-sm text-zinc-600">Create a login and assign team role: editor, customer service, event planner, or photo crew.</p>
        </div>

        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleCreateMember}>
          <input
            value={formData.phone}
            onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Phone"
            className="ui-input"
            required
            disabled={!isAdmin}
          />
          <input
            type="password"
            value={formData.password}
            onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
            placeholder="Temporary password"
            className="ui-input"
            required
            disabled={!isAdmin}
          />
          <select
            value={formData.teamRole}
            onChange={(event) => setFormData((current) => ({ ...current, teamRole: event.target.value as TeamRole }))}
            className="ui-select"
            disabled={!isAdmin}
          >
            {teamRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={createLoading || !isAdmin}
              className="ui-button-primary"
            >
              {createLoading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </section>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by phone or role"
          className="ui-input max-w-xs"
        />

        {["all", "EDITOR", "CUSTOMER_SERVICE", "EVENT_PLANNER", "PHOTO_CREW"].map((value) => {
          const active = roleFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRoleFilter(value as "all" | TeamRole)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white"
                  : "border border-zinc-300 bg-zinc-50 text-zinc-600"
              }`}
            >
              {value === "all" ? "All roles" : roleLabel(value as TeamRole)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-zinc-600">Loading team members...</p>
      ) : (
        <div className="ui-table">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Team Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-t border-zinc-100 align-top hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-800">{member.phone}</td>
                    <td className="px-4 py-3 text-zinc-700">{member.role}</td>
                    <td className="px-4 py-3">
                      <select
                        value={member.teamRole}
                        onChange={(event) => void handleUpdateRole(member, event.target.value as TeamRole)}
                        disabled={!isAdmin}
                        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-100"
                      >
                        {teamRoleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(member.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => void handleResetPassword(member.id)}
                          disabled={!isAdmin || resetForMemberId === member.id}
                          className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {resetForMemberId === member.id ? "Resetting..." : "Reset Password"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteMember(member)}
                          disabled={!isAdmin || member.id === session?.user.id}
                          className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 ? (
            <p className="px-4 py-5 text-sm text-zinc-600">No team members match your filters.</p>
          ) : null}
        </div>
      )}
    </main>
  );
}
