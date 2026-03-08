"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { useSession } from "@/lib/session-context";
import { Eye, EyeOff } from "lucide-react";
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
  const [editLoading, setEditLoading] = useState(false);
  const [resetForMemberId, setResetForMemberId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    teamRole: "EVENT_PLANNER" as TeamRole,
  });
  const [editFormData, setEditFormData] = useState({
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
      setShowAddPassword(false);
      setIsAddDialogOpen(false);
      setSuccess("Team member added successfully.");
      await loadMembers();
    } catch {
      setActionError("Unable to add team member");
    } finally {
      setCreateLoading(false);
    }
  }

  function openEditDialog(member: TeamMember) {
    setActionError(null);
    setSuccess(null);
    setShowEditPassword(false);
    setEditingMember(member);
    setEditFormData({
      phone: member.phone,
      password: "",
      teamRole: member.teamRole,
    });
  }

  function closeEditDialog() {
    setEditingMember(null);
    setShowEditPassword(false);
    setEditFormData({
      phone: "",
      password: "",
      teamRole: "EVENT_PLANNER",
    });
  }

  async function handleUpdateMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingMember) return;

    setActionError(null);
    setSuccess(null);
    setEditLoading(true);

    if (!isAdmin) {
      setActionError("Only admin users can update team roles.");
      setEditLoading(false);
      return;
    }

    const payload: { phone: string; teamRole: TeamRole; password?: string } = {
      phone: editFormData.phone.trim(),
      teamRole: editFormData.teamRole,
    };

    if (editFormData.password.trim().length > 0) {
      payload.password = editFormData.password;
    }

    try {
      const response = await fetch(`/api/studio/settings/team/${editingMember.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(body?.error ?? "Unable to update team member");
        return;
      }

      closeEditDialog();
      setSuccess("Team member updated.");
      await loadMembers();
    } catch {
      setActionError("Unable to update team member");
    } finally {
      setEditLoading(false);
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
      <div>
        <h2 className="ui-title">Settings</h2>
        <p className="ui-subtitle">Manage your account, studio profile, and studio operations.</p>
      </div>

      <div className="mt-5 flex gap-2">
        <Link href="/studio/settings/account" className="rounded-lg border px-3 py-2 text-sm font-medium" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>Account</Link>
        <Link href="/studio/settings/team" className="rounded-lg px-3 py-2 text-sm font-medium" style={{ background: "linear-gradient(to right, var(--primary), var(--primary-light))", color: "white" }}>Team</Link>
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

      <section className="ui-panel mt-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-800">Team Members</h3>
          <p className="mt-1 text-sm text-zinc-600">Add and edit team members using dialogs.</p>
        </div>
        <button
          type="button"
          className="ui-button-primary"
          disabled={!isAdmin}
          onClick={() => {
            setActionError(null);
            setSuccess(null);
            setShowAddPassword(false);
            setIsAddDialogOpen(true);
          }}
        >
          Add Team Member
        </button>
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
                    <td className="px-4 py-3 text-zinc-700">{roleLabel(member.teamRole)}</td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(member.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => openEditDialog(member)}
                          disabled={!isAdmin}
                          className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Edit
                        </button>
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

      {isAddDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-5">
              <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Add Team Member</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Create login and assign team role.</p>
            </div>

            <form className="space-y-3" onSubmit={handleCreateMember}>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData((current) => ({ ...current, phone: value ?? "" }))}
                placeholder="Phone"
                defaultCountry="ET"
                className="w-full"
                required
                disabled={createLoading}
              />
              <div className="relative">
                <input
                  type={showAddPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Temporary password"
                  className="ui-input pr-10"
                  required
                  disabled={createLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowAddPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                  disabled={createLoading}
                  aria-label={showAddPassword ? "Hide temporary password" : "Show temporary password"}
                  title={showAddPassword ? "Hide temporary password" : "Show temporary password"}
                >
                  {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <select
                value={formData.teamRole}
                onChange={(event) => setFormData((current) => ({ ...current, teamRole: event.target.value as TeamRole }))}
                className="ui-select"
                disabled={createLoading}
              >
                {teamRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  type="button"
                  className="ui-button-secondary"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button-primary"
                  disabled={createLoading}
                >
                  {createLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-5">
              <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Edit Team Member</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Update phone, role, or reset password.</p>
            </div>

            <form className="space-y-3" onSubmit={handleUpdateMember}>
              <PhoneInput
                value={editFormData.phone}
                onChange={(value) => setEditFormData((current) => ({ ...current, phone: value ?? "" }))}
                placeholder="Phone"
                defaultCountry="ET"
                className="w-full"
                required
                disabled={editLoading}
              />
              <select
                value={editFormData.teamRole}
                onChange={(event) => setEditFormData((current) => ({ ...current, teamRole: event.target.value as TeamRole }))}
                className="ui-select"
                disabled={editLoading}
              >
                {teamRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="relative">
                <input
                  type={showEditPassword ? "text" : "password"}
                  value={editFormData.password}
                  onChange={(event) => setEditFormData((current) => ({ ...current, password: event.target.value }))}
                  placeholder="New password (optional)"
                  className="ui-input pr-10"
                  disabled={editLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                  disabled={editLoading}
                  aria-label={showEditPassword ? "Hide new password" : "Show new password"}
                  title={showEditPassword ? "Hide new password" : "Show new password"}
                >
                  {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  type="button"
                  className="ui-button-secondary"
                  onClick={closeEditDialog}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button-primary"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
