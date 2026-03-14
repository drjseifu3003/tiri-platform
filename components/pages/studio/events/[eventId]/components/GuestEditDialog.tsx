import { FormEvent } from "react";
import { PhoneInput } from "@/components/ui/phone-input";

type GuestCategory = "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";

type GuestEditDialogProps = {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  guestEditForm: {
    name: string;
    phone: string;
    email: string;
    category: GuestCategory;
  };
  onChange: (next: { name: string; phone: string; email: string; category: GuestCategory }) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function GuestEditDialog({
  isOpen,
  isLoading,
  error,
  guestEditForm,
  onChange,
  onClose,
  onSubmit,
}: GuestEditDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-5">
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Edit Guest</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Update guest details and category.</p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Guest Name *</span>
            <input
              value={guestEditForm.name}
              onChange={(event) => onChange({ ...guestEditForm, name: event.target.value })}
              className="ui-input"
              required
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Phone</span>
            <PhoneInput
              value={guestEditForm.phone}
              onChange={(value) => onChange({ ...guestEditForm, phone: value ?? "" })}
              defaultCountry="ET"
              className="w-full"
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Email</span>
            <input
              type="email"
              value={guestEditForm.email}
              onChange={(event) => onChange({ ...guestEditForm, email: event.target.value })}
              className="ui-input"
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Category</span>
            <select
              value={guestEditForm.category}
              onChange={(event) => onChange({ ...guestEditForm, category: event.target.value as GuestCategory })}
              className="ui-select"
              disabled={isLoading}
            >
              <option value="GENERAL">General Guest</option>
              <option value="BRIDE_GUEST">Bride Guest</option>
              <option value="GROOM_GUEST">Groom Guest</option>
            </select>
          </label>

          {error ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>{error}</p> : null}

          <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
            <button type="button" className="ui-button-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="ui-button-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
