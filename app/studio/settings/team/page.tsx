"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "@/lib/session-context";
import { Eye, EyeOff, KeyRound, MoreHorizontal, PencilLine, ShieldAlert, Trash2 } from "lucide-react";
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
  const [deleteForMemberId, setDeleteForMemberId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [resetDialogMember, setResetDialogMember] = useState<TeamMember | null>(null);
  const [deleteDialogMember, setDeleteDialogMember] = useState<TeamMember | null>(null);
  const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    teamRole: "EVENT_PLANNER" as TeamRole,
  });
  const [editFormData, setEditFormData] = useState({
    phone: "",
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
      total: members.length,
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
    setEditingMember(member);
    setEditFormData({
      phone: member.phone,
      teamRole: member.teamRole,
    });
  }

  function closeEditDialog() {
    setEditingMember(null);
    setEditFormData({
      phone: "",
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

    const payload: { phone: string; teamRole: TeamRole } = {
      phone: editFormData.phone.trim(),
      teamRole: editFormData.teamRole,
    };

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

  function openResetDialog(member: TeamMember) {
    if (!isAdmin) {
      setActionError("Only admin users can reset passwords.");
      return;
    }

    setActionError(null);
    setSuccess(null);
    setShowResetPassword(false);
    setResetPassword("");
    setResetDialogMember(member);
  }

  function closeResetDialog() {
    setResetDialogMember(null);
    setShowResetPassword(false);
    setResetPassword("");
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resetDialogMember) return;

    if (resetPassword.length < 6) {
      setActionError("Password must be at least 6 characters.");
      return;
    }

    setResetForMemberId(resetDialogMember.id);
    setActionError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/studio/settings/team/${resetDialogMember.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(body?.error ?? "Unable to reset password");
        return;
      }

      setSuccess("Password reset successfully.");
      closeResetDialog();
    } catch {
      setActionError("Unable to reset password");
    } finally {
      setResetForMemberId(null);
    }
  }

  function openDeleteDialog(member: TeamMember) {
    if (!isAdmin) {
      setActionError("Only admin users can remove team members.");
      return;
    }

    if (member.id === session?.user.id) {
      setActionError("You cannot remove your own account.");
      return;
    }

    setActionError(null);
    setSuccess(null);
    setDeleteDialogMember(member);
  }

  function closeDeleteDialog() {
    setDeleteDialogMember(null);
  }

  async function handleDeleteMember() {
    if (!deleteDialogMember) return;

    setActionError(null);
    setSuccess(null);

    if (!isAdmin) {
      setActionError("Only admin users can remove team members.");
      return;
    }

    setDeleteForMemberId(deleteDialogMember.id);

    try {
      const response = await fetch(`/api/studio/settings/team/${deleteDialogMember.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(body?.error ?? "Unable to remove team member");
        return;
      }

      setSuccess("Team member removed.");
      closeDeleteDialog();
      await loadMembers();
    } catch {
      setActionError("Unable to remove team member");
    } finally {
      setDeleteForMemberId(null);
    }
  }

  return (
    <main className="ui-page rounded-lg flex min-h-[calc(100dvh-7rem)] flex-col p-4">
      <div>
        <h2 className="ui-title">Settings</h2>
        <p className="ui-subtitle">Manage team access, roles, and account security workflows.</p>
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
          style={{
            color: "var(--primary)",
            borderBottom: "2px solid var(--primary)",
            marginBottom: "-2px",
          }}
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

      {!isAdmin ? (
        <p className="mt-4 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#f6d28b", background: "#fff7e6", color: "#9a6b13" }}>
          Staff mode: view-only access. Admin users can add/remove members and change roles.
        </p>
      ) : null}

      {error ? <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{error}</p> : null}
      {actionError ? <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{actionError}</p> : null}
      {success ? <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{success}</p> : null}

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Total Members</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{summary.total}</p>
        </article>
        <article className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Admins</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{summary.admins}</p>
        </article>
        <article className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Staff</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{summary.staff}</p>
        </article>
        <article className="rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Photo Crew</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>{summary.photoCrew}</p>
        </article>
      </section>

      <section className="mt-4 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
            <div className="relative w-80 min-w-80">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by phone or role"
                className="ui-input h-10 w-full rounded-lg pl-10"
              />
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            <div className="relative min-w-52">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as "all" | TeamRole)}
                className="ui-input h-10 min-w-52 appearance-none rounded-lg pl-9 pr-8 text-sm font-medium"
              >
                <option value="all">All team roles</option>
                {teamRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <button
            type="button"
            className="ui-button-primary h-10 shrink-0"
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
        </div>
      </section>

      <section className="mt-4 min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full min-h-[16rem] items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading team members...</p>
          </div>
        ) : (
          <div className="ui-table rounded-lg flex h-full min-h-0 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="min-w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[22%]" />
                  <col className="w-[20%]" />
                  <col className="w-[28%]" />
                </colgroup>
                <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                  <tr>
                    <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Phone</th>
                    <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Role</th>
                    <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Joined</th>
                    <th className="sticky top-0 z-10 px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-t align-middle" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{member.phone}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {member.role === "ADMIN" ? "Admin" : roleLabel(member.teamRole)}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{formatDate(member.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Popover
                            open={openMenuMemberId === member.id}
                            onOpenChange={(open) => setOpenMenuMemberId(open ? member.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
                                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-secondary)" }}
                                aria-label="Open team member actions"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-52 p-1" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuMemberId(null);
                                  openEditDialog(member);
                                }}
                                disabled={!isAdmin}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ color: "var(--text-primary)" }}
                              >
                                <PencilLine size={14} />
                                Edit member
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuMemberId(null);
                                  openResetDialog(member);
                                }}
                                disabled={!isAdmin || resetForMemberId === member.id}
                                className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ color: "var(--secondary)" }}
                              >
                                <KeyRound size={14} />
                                {resetForMemberId === member.id ? "Resetting..." : "Reset password"}
                              </button>

                              <div className="my-1 border-t" style={{ borderColor: "var(--border-subtle)" }} />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuMemberId(null);
                                  openDeleteDialog(member);
                                }}
                                disabled={!isAdmin || member.id === session?.user.id}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ color: "#b32543" }}
                              >
                                {member.id === session?.user.id ? <ShieldAlert size={14} /> : <Trash2 size={14} />}
                                {member.id === session?.user.id ? "Cannot remove yourself" : "Remove member"}
                              </button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 ? (
              <p className="px-4 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>No team members match your filters.</p>
            ) : null}
          </div>
        )}
      </section>

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
                <button type="submit" className="ui-button-primary" disabled={createLoading}>
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
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Update phone and role.</p>
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

              <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                <button type="button" className="ui-button-secondary" onClick={closeEditDialog} disabled={editLoading}>
                  Cancel
                </button>
                <button type="submit" className="ui-button-primary" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {resetDialogMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-5">
              <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Reset Password</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Set a new password for {resetDialogMember.phone}.
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleResetPassword}>
              <div className="relative">
                <input
                  type={showResetPassword ? "text" : "password"}
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="ui-input pr-10"
                  required
                  minLength={6}
                  disabled={resetForMemberId === resetDialogMember.id}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                  disabled={resetForMemberId === resetDialogMember.id}
                  aria-label={showResetPassword ? "Hide password" : "Show password"}
                  title={showResetPassword ? "Hide password" : "Show password"}
                >
                  {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  type="button"
                  className="ui-button-secondary"
                  onClick={closeResetDialog}
                  disabled={resetForMemberId === resetDialogMember.id}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button-primary"
                  disabled={resetForMemberId === resetDialogMember.id}
                >
                  {resetForMemberId === resetDialogMember.id ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteDialogMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-5">
              <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Remove Team Member</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to remove {deleteDialogMember.phone} from the studio team?
              </p>
            </div>

            <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#f6b1be", background: "#fff0f4", color: "#b32543" }}>
              This action removes their team access immediately.
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
              <button
                type="button"
                className="ui-button-secondary"
                onClick={closeDeleteDialog}
                disabled={deleteForMemberId === deleteDialogMember.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
                onClick={() => void handleDeleteMember()}
                disabled={deleteForMemberId === deleteDialogMember.id}
              >
                {deleteForMemberId === deleteDialogMember.id ? "Removing..." : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
