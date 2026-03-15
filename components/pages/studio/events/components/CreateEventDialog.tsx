import { Controller, type Control, type FieldErrors, type UseFormHandleSubmit, type UseFormRegister } from "react-hook-form";
import { PhoneInput } from "@/components/ui/phone-input";

type CreateEventFormValues = {
  title: string;
  brideName: string;
  groomName: string;
  bridePhone: string;
  groomPhone: string;
  eventDate: string;
  eventTime: string;
  location?: string;
  googleMapAddress?: string;
  description?: string;
};

type CreateEventDialogProps = {
  isOpen: boolean;
  createError: string | null;
  isSubmitting: boolean;
  minEventDate: string;
  eventDateTimePreview: string | null;
  register: UseFormRegister<CreateEventFormValues>;
  control: Control<CreateEventFormValues>;
  errors: FieldErrors<CreateEventFormValues>;
  handleSubmit: UseFormHandleSubmit<CreateEventFormValues>;
  onSubmit: (values: CreateEventFormValues) => Promise<void> | void;
  onClose: () => void;
};



export function CreateEventDialog({
  isOpen,
  createError,
  isSubmitting,
  minEventDate,
  eventDateTimePreview,
  register,
  control,
  errors,
  handleSubmit,
  onSubmit,
  onClose,
}: CreateEventDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-white p-5 shadow-2xl" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>Create New Event</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Add event details to create your event.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2 md:row-span-2">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Title *</span>
              <input
                {...register("title")}
                placeholder="Meron & Dawit Wedding"
                className="ui-input"
              />
              {errors.title ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{errors.title.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Name *</span>
              <input
                {...register("brideName")}
                placeholder="Bride full name"
                className="ui-input"
              />
              {errors.brideName ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{errors.brideName.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Name *</span>
              <input
                {...register("groomName")}
                placeholder="Groom full name"
                className="ui-input"
              />
              {errors.groomName ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{errors.groomName.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bride Phone *</span>
              <Controller
                control={control}
                name="bridePhone"
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? "")}
                    placeholder="+2519..."
                    defaultCountry="ET"
                    className="w-full"
                    required
                  />
                )}
              />
              {errors.bridePhone ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{errors.bridePhone.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Groom Phone *</span>
              <Controller
                control={control}
                name="groomPhone"
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? "")}
                    placeholder="+2519..."
                    defaultCountry="ET"
                    className="w-full"
                    required
                  />
                )}
              />
              {errors.groomPhone ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{errors.groomPhone.message}</p> : null}
            </label>

            <div className="rounded-xl border p-3 md:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Event Schedule *</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Date</span>
                  <input
                    type="date"
                    {...register("eventDate")}
                    min={minEventDate}
                    className="ui-input"
                  />
                  {errors.eventDate ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{errors.eventDate.message}</p> : null}
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Time</span>
                  <input
                    type="time"
                    {...register("eventTime")}
                    className="ui-input"
                  />
                  {errors.eventTime ? <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{errors.eventTime.message}</p> : null}
                </label>
              </div>

              <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                {eventDateTimePreview ? `Scheduled for ${eventDateTimePreview}` : "Pick a date and time for the event invitation."}
              </p>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Location</span>
              <input
                {...register("location")}
                placeholder="Venue and city"
                className="ui-input"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Google Map Address</span>
              <input
                {...register("googleMapAddress")}
                placeholder="https://maps.google.com/... or share address"
                className="ui-input"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-600">Description</span>
            <textarea
              {...register("description")}
              placeholder="Short event description"
              className="ui-textarea"
            />
          </label>

          {createError ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{createError}</p> : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="ui-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ui-button-primary"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
