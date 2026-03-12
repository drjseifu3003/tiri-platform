"use client";

import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FormEvent, useState } from "react";

type GuestCategory = "GENERAL" | "BRIDE_GUEST" | "GROOM_GUEST";

interface AddGuestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (guestData: { name: string; phone: string; email: string; category: GuestCategory }) => Promise<boolean>;
  isLoading: boolean;
  error?: string;
}

export function AddGuestDialog({ isOpen, onClose, onSubmit, isLoading, error }: AddGuestDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "GENERAL" as GuestCategory,
  });
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors: { name?: string; phone?: string; email?: string } = {};
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();

    if (trimmedName.length < 2) {
      nextErrors.name = "Guest name must be at least 2 characters.";
    }

    if (trimmedPhone.length > 0 && !isValidPhoneNumber(trimmedPhone)) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    if (trimmedEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    const isSuccess = await onSubmit(formData);
    if (isSuccess) {
      setFormData({ name: "", phone: "", email: "", category: "GENERAL" });
      setFieldErrors({});
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mb-5">
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Add Guest
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Add a new guest to this event.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Guest Name *
            </span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Full name"
              className="ui-input"
              required
              disabled={isLoading}
            />
            {fieldErrors.name ? (
              <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{fieldErrors.name}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Phone Number
            </span>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, phone: value ?? "" }));
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="+1 (555) 000-0000"
              defaultCountry="ET"
              className="w-full"
              disabled={isLoading}
            />
            {fieldErrors.phone ? (
              <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{fieldErrors.phone}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Email Address
            </span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="guest@example.com"
              className="ui-input"
              disabled={isLoading}
            />
            {fieldErrors.email ? (
              <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>{fieldErrors.email}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Guest Category *
            </span>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as GuestCategory }))}
              className="ui-select"
              disabled={isLoading}
            >
              <option value="GENERAL">General Guest</option>
              <option value="BRIDE_GUEST">Bride's Guest</option>
              <option value="GROOM_GUEST">Groom's Guest</option>
            </select>
          </label>

          {error && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--error-light)", color: "var(--error)" }}>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()} className="ui-button-primary">
              {isLoading ? "Adding..." : "Add Guest"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
