type GuestDeleteDialogProps = {
  guestName: string | null;
  error: string | null;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function GuestDeleteDialog({
  guestName,
  error,
  isLoading,
  onCancel,
  onConfirm,
}: GuestDeleteDialogProps) {
  if (!guestName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-5">
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Delete Guest</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to remove {guestName} from this event?
          </p>
        </div>

        <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#f6b1be", background: "#fff0f4", color: "#b32543" }}>
          This action cannot be undone.
        </div>

        {error ? <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{error}</p> : null}

        <div className="mt-4 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
          <button
            type="button"
            className="ui-button-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "#f6b1be", color: "#b32543", background: "#fff0f4" }}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}
