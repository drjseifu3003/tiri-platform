import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import type { FormEvent } from "react";

type EditEventForm = {
  title: string;
  brideName: string;
  groomName: string;
  bridePhone: string;
  groomPhone: string;
  eventDate: string;
  eventTime: string;
  location: string;
  googleMapAddress: string;
  description: string;
};

type EditFieldErrors = {
  title?: string;
  bridePhone?: string;
  groomPhone?: string;
  eventDate?: string;
  eventTime?: string;
  googleMapAddress?: string;
};

type EditEventDialogProps = {
  isOpen: boolean;
  editForm: EditEventForm;
  editFieldErrors: EditFieldErrors;
  editSchedulePreview: string | null;
  minEventDate: string;
  editError: string | null;
  editSuccess: string | null;
  editSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (value: EditEventForm) => void;
  onFieldErrorsChange: (value: EditFieldErrors) => void;
};

export function EditEventDialog({
  isOpen,
  editForm,
  editFieldErrors,
  editSchedulePreview,
  minEventDate,
  editError,
  editSuccess,
  editSubmitting,
  onClose,
  onSubmit,
  onChange,
  onFieldErrorsChange,
}: EditEventDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>Edit Event</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Update details, schedule, and event status.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-8 w-8 cursor-pointer border-[var(--border-subtle)] bg-[var(--surface)] px-0 text-[var(--primary)] hover:bg-[var(--surface-muted)]"
            aria-label="Close edit dialog"
          >
            <span aria-hidden className="text-lg leading-none" style={{ color: "var(--primary)" }}>
              x
            </span>
          </Button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2 md:row-span-2">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Title *</span>
              <input
                value={editForm.title}
                onChange={(event) => {
                  onChange({ ...editForm, title: event.target.value });
                  onFieldErrorsChange({ ...editFieldErrors, title: undefined });
                }}
                className="ui-input"
                required
              />
              {editFieldErrors.title ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.title}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Name</span>
              <input value={editForm.brideName} onChange={(event) => onChange({ ...editForm, brideName: event.target.value })} className="ui-input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Name</span>
              <input value={editForm.groomName} onChange={(event) => onChange({ ...editForm, groomName: event.target.value })} className="ui-input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Phone</span>
              <PhoneInput
                value={editForm.bridePhone}
                onChange={(value) => {
                  onChange({ ...editForm, bridePhone: value ?? "" });
                  onFieldErrorsChange({ ...editFieldErrors, bridePhone: undefined });
                }}
                defaultCountry="ET"
                className="w-full"
              />
              {editFieldErrors.bridePhone ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.bridePhone}</p> : null}
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Phone</span>
              <PhoneInput
                value={editForm.groomPhone}
                onChange={(value) => {
                  onChange({ ...editForm, groomPhone: value ?? "" });
                  onFieldErrorsChange({ ...editFieldErrors, groomPhone: undefined });
                }}
                defaultCountry="ET"
                className="w-full"
              />
              {editFieldErrors.groomPhone ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.groomPhone}</p> : null}
            </label>

            <div className="rounded-xl border p-3 md:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Schedule *</span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Local time</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Date</span>
                  <input
                    type="date"
                    value={editForm.eventDate}
                    min={minEventDate}
                    onChange={(event) => {
                      onChange({ ...editForm, eventDate: event.target.value });
                      onFieldErrorsChange({ ...editFieldErrors, eventDate: undefined });
                    }}
                    className="ui-input"
                    required
                  />
                  {editFieldErrors.eventDate ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.eventDate}</p> : null}
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Time</span>
                  <input
                    type="time"
                    value={editForm.eventTime}
                    onChange={(event) => {
                      onChange({ ...editForm, eventTime: event.target.value });
                      onFieldErrorsChange({ ...editFieldErrors, eventTime: undefined });
                    }}
                    className="ui-input"
                    required
                  />
                  {editFieldErrors.eventTime ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.eventTime}</p> : null}
                </label>
              </div>

              <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                {editSchedulePreview ? `Scheduled for ${editSchedulePreview}` : "Pick a valid date and time."}
              </p>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Location</span>
              <input value={editForm.location} onChange={(event) => onChange({ ...editForm, location: event.target.value })} className="ui-input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Google Map Address</span>
              <input
                value={editForm.googleMapAddress}
                onChange={(event) => {
                  onChange({ ...editForm, googleMapAddress: event.target.value });
                  onFieldErrorsChange({ ...editFieldErrors, googleMapAddress: undefined });
                }}
                className="ui-input"
              />
              {editFieldErrors.googleMapAddress ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{editFieldErrors.googleMapAddress}</p> : null}
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Description</span>
              <textarea value={editForm.description} onChange={(event) => onChange({ ...editForm, description: event.target.value })} className="ui-textarea" />
            </label>
          </div>

          {editError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{editError}</p> : null}
          {editSuccess ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>{editSuccess}</p> : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className="ui-button-secondary">Cancel</button>
            <button type="submit" disabled={editSubmitting} className="ui-button-primary">{editSubmitting ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
