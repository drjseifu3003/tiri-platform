type InviteActionChannel = "WHATSAPP" | "TELEGRAM";

type InviteChannelDialogProps = {
  isOpen: boolean;
  pendingInviteGuestIds: string[];
  onCancel: () => void;
  onConfirm: (channel: InviteActionChannel) => void;
};

export function InviteChannelDialog({
  isOpen,
  pendingInviteGuestIds,
  onCancel,
  onConfirm,
}: InviteChannelDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>Choose Invite Method</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Send invitation for {pendingInviteGuestIds.length} guest{pendingInviteGuestIds.length !== 1 ? "s" : ""} using:
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
          Telegram will auto-fallback to WhatsApp for guests who have not started the bot.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onConfirm("WHATSAPP")}
            className="rounded-md border px-3 py-2 text-sm font-medium transition hover:opacity-90"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => onConfirm("TELEGRAM")}
            className="rounded-md border px-3 py-2 text-sm font-medium transition hover:opacity-90"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-primary)" }}
          >
            Telegram
          </button>
        </div>

        <div className="mt-5 flex justify-end border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
          <button
            type="button"
            onClick={onCancel}
            className="ui-button-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
