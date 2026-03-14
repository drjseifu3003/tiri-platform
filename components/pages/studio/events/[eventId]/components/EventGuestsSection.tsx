import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreHorizontal, PencilLine, Send, Trash2 } from "lucide-react";

type GuestItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";
  checkedIn: boolean;
  checkedInAt: string | null;
  invitationStatus: "SENT" | "NOT_SENT";
  invitationChannel: "WHATSAPP" | "TELEGRAM" | "SMS" | null;
  invitationSentAt: string | null;
};

type EventGuestsSectionProps = {
  guests: GuestItem[];
  paginatedGuests: GuestItem[];
  selectedGuestIds: string[];
  allGuestsSelected: boolean;
  selectedCount: number;
  inviteSubmitting: boolean;
  isCompletedEvent: boolean;
  guestFormError: string | null;
  guestFormSuccess: string | null;
  inviteError: string | null;
  inviteSuccess: string | null;
  openGuestMenuId: string | null;
  guestTotalItems: number;
  guestStartIndex: number;
  guestPageSize: number;
  clampedGuestPage: number;
  guestTotalPages: number;
  labelForCategory: (value: GuestItem["category"]) => string;
  labelForInviteChannel: (channel: GuestItem["invitationChannel"]) => string;
  channelPillClasses: (channel: GuestItem["invitationChannel"]) => string;
  formatDateTime: (value: string) => string;
  onAddGuest: () => void;
  onToggleSelectAll: (checked: boolean) => void;
  onOpenInviteDialog: (guestIds: string[], openFirst?: boolean) => void;
  onToggleGuestSelection: (guestId: string, checked: boolean) => void;
  onOpenGuestMenu: (guestId: string | null) => void;
  onOpenGuestEdit: (guest: GuestItem) => void;
  onRequestGuestDelete: (guest: GuestItem) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  clearGuestMessages: () => void;
};

export function EventGuestsSection({
  guests,
  paginatedGuests,
  selectedGuestIds,
  allGuestsSelected,
  selectedCount,
  inviteSubmitting,
  isCompletedEvent,
  guestFormError,
  guestFormSuccess,
  inviteError,
  inviteSuccess,
  openGuestMenuId,
  guestTotalItems,
  guestStartIndex,
  guestPageSize,
  clampedGuestPage,
  guestTotalPages,
  labelForCategory,
  labelForInviteChannel,
  channelPillClasses,
  formatDateTime,
  onAddGuest,
  onToggleSelectAll,
  onOpenInviteDialog,
  onToggleGuestSelection,
  onOpenGuestMenu,
  onOpenGuestEdit,
  onRequestGuestDelete,
  onPrevPage,
  onNextPage,
  clearGuestMessages,
}: EventGuestsSectionProps) {
  return (
    <section className="mt-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Guest List</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {guests.length} guest{guests.length !== 1 ? "s" : ""} invited
          </p>
        </div>
        <button
          type="button"
          onClick={onAddGuest}
          disabled={isCompletedEvent}
          className="ui-button-primary h-10"
        >
          Add Guest
        </button>
      </div>

      {guestFormError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{guestFormError}</p> : null}
      {guestFormSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{guestFormSuccess}</p> : null}
      {inviteError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{inviteError}</p> : null}
      {inviteSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{inviteSuccess}</p> : null}

      <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
              <input
                type="checkbox"
                checked={allGuestsSelected}
                onChange={(changeEvent) => onToggleSelectAll(changeEvent.target.checked)}
                disabled={isCompletedEvent}
                className="h-4 w-4 rounded border"
                style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
              />
              Select all
            </label>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{selectedCount} selected</span>
          </div>

          {selectedCount > 0 ? (
            <button
              type="button"
              disabled={selectedCount === 0 || inviteSubmitting || isCompletedEvent}
              onClick={() => onOpenInviteDialog(selectedGuestIds)}
              className="ui-button-primary h-9 px-3 text-sm"
            >
              {inviteSubmitting ? "Sending..." : `Send Invite (${selectedCount})`}
            </button>
          ) : null}
        </div>
      </div>
      <div className="ui-table rounded-lg flex min-h-0 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto md:hidden">
          <div className="grid gap-3 p-3">
            {paginatedGuests.map((guest) => (
              <article key={`${guest.id}-mobile`} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                <div className="flex items-start justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                    <input
                      type="checkbox"
                      checked={selectedGuestIds.includes(guest.id)}
                      onChange={(changeEvent) => onToggleGuestSelection(guest.id, changeEvent.target.checked)}
                      disabled={isCompletedEvent}
                      className="h-4 w-4 rounded border"
                      style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
                    />
                    <span className="font-medium">{guest.name}</span>
                  </label>
                  <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${guest.invitationStatus === "SENT" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}>
                    {guest.invitationStatus === "SENT" ? "Invite sent" : "Not sent"}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p>Category: {labelForCategory(guest.category)}</p>
                  <p>Phone: {guest.phone || "-"}</p>
                  <p>Email: {guest.email || "-"}</p>
                  <p>Sent via: {labelForInviteChannel(guest.invitationChannel)}</p>
                  <p>Sent at: {guest.invitationSentAt ? formatDateTime(guest.invitationSentAt) : "-"}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <Popover open={openGuestMenuId === guest.id} onOpenChange={(open) => onOpenGuestMenu(open ? guest.id : null)}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                        style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-secondary)" }}
                        aria-label="Open guest actions"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-44 p-1" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenGuestMenu(null);
                          clearGuestMessages();
                          onOpenGuestEdit(guest);
                        }}
                        disabled={isCompletedEvent}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenGuestMenu(null);
                          onOpenInviteDialog([guest.id]);
                        }}
                        disabled={inviteSubmitting || isCompletedEvent}
                        className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium disabled:opacity-60"
                        style={{ color: "var(--primary)" }}
                      >
                        Send invite
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenGuestMenu(null);
                          onRequestGuestDelete(guest);
                        }}
                        disabled={isCompletedEvent}
                        className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium"
                        style={{ color: "#b32543" }}
                      >
                        Delete
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="min-h-0 hidden flex-1 overflow-x-auto overflow-y-auto md:block">
          <table className="min-w-[1100px] text-left text-sm">
            <colgroup>
              <col className="w-[72px]" />
              <col className="w-[220px]" />
              <col className="w-[150px]" />
              <col className="w-[170px]" />
              <col className="w-[260px]" />
              <col className="w-[150px]" />
              <col className="w-[130px]" />
              <col className="w-[170px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
              <tr>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Select</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Name</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Category</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Phone</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Email</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Invite Status</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Sent Via</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Sent At</th>
                <th className="sticky top-0 z-10 px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wide" style={{ background: "var(--surface-muted)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGuests.map((guest) => (
                <tr key={guest.id} className="border-t align-middle transition" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedGuestIds.includes(guest.id)}
                      onChange={(changeEvent) => onToggleGuestSelection(guest.id, changeEvent.target.checked)}
                      disabled={isCompletedEvent}
                      className="h-4 w-4 rounded border"
                      style={{ borderColor: "var(--border-subtle)", accentColor: "var(--primary)" }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{guest.name}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{labelForCategory(guest.category)}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{guest.phone || "-"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{guest.email || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${guest.invitationStatus === "SENT" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}>
                      {guest.invitationStatus === "SENT" ? "Invite sent" : "Not sent"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${channelPillClasses(guest.invitationChannel)}`}>
                      {labelForInviteChannel(guest.invitationChannel)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{guest.invitationSentAt ? formatDateTime(guest.invitationSentAt) : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Popover open={openGuestMenuId === guest.id} onOpenChange={(open) => onOpenGuestMenu(open ? guest.id : null)}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                            style={{ borderColor: "var(--border-subtle)", background: "var(--surface)", color: "var(--text-secondary)" }}
                            aria-label="Open guest actions"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-44 p-1" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenGuestMenu(null);
                              onOpenGuestEdit(guest);
                            }}
                            disabled={isCompletedEvent}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface-muted)]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            <PencilLine size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={inviteSubmitting || isCompletedEvent}
                            onClick={() => {
                              onOpenGuestMenu(null);
                              onOpenInviteDialog([guest.id], true);
                            }}
                            className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                            style={{ color: "var(--secondary)" }}
                          >
                            <Send size={14} />
                            Invite
                          </button>

                          <div className="my-1 border-t" style={{ borderColor: "var(--border-subtle)" }} />

                          <button
                            type="button"
                            onClick={() => {
                              onOpenGuestMenu(null);
                              onRequestGuestDelete(guest);
                            }}
                            disabled={isCompletedEvent}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface-muted)]"
                            style={{ color: "#b32543" }}
                          >
                            <Trash2 size={14} />
                            Delete
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
        {guests.length === 0 ? <p className="px-4 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>No guests added yet.</p> : null}

        {guests.length > 0 ? (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
            <p>
              Showing {guestTotalItems === 0 ? 0 : guestStartIndex + 1}-{Math.min(guestStartIndex + guestPageSize, guestTotalItems)} of {guestTotalItems}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={clampedGuestPage <= 1}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                Previous
              </button>
              <span className="px-1 text-xs">Page {clampedGuestPage} / {guestTotalPages}</span>
              <button
                type="button"
                onClick={onNextPage}
                disabled={clampedGuestPage >= guestTotalPages}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
