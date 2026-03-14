type CreatedEventSummary = {
  id: string;
  title: string;
  eventDate: string;
};

type CreatedEventDialogProps = {
  createdEvent: CreatedEventSummary | null;
  isConfirmVisible: boolean;
  formatEventDate: (value: string) => string;
  onClose: () => void;
  onGoToDetail: (eventId: string) => void;
};

export function CreatedEventDialog({
  createdEvent,
  isConfirmVisible,
  formatEventDate,
  onClose,
  onGoToDetail,
}: CreatedEventDialogProps) {
  if (!createdEvent) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 transition-opacity duration-200 ${isConfirmVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl transition-all duration-200 ${isConfirmVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-95"}`}
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center" style={{ color: "var(--success)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12.5 2.4 2.4L15.8 10" />
          </svg>
        </div>

        <h3 className="mt-4 text-center text-xl font-semibold" style={{ color: "var(--primary)" }}>Event Created</h3>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          {createdEvent.title} has been created successfully.
        </p>
        <p className="mt-1 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
          {formatEventDate(createdEvent.eventDate)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="ui-button-secondary"
          >
            Stay Here
          </button>
          <button
            type="button"
            onClick={() => onGoToDetail(createdEvent.id)}
            className="ui-button-primary"
          >
            Go to Detail
          </button>
        </div>
      </div>
    </div>
  );
}
