"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type BookingPayload = {
  name: string;
  phone: string;
  weddingDate: string;
  weddingPlace: string;
};

const initialForm: BookingPayload = {
  name: "",
  phone: "",
  weddingDate: "",
  weddingPlace: "",
};

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [form, setForm] = useState<BookingPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const minWeddingDate = useMemo(() => todayInputValue(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/public/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to submit your booking request.");
      }

      setForm(initialForm);
      setSuccess("Your booking request has been received. Our team will contact you shortly.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your booking request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(95, 18, 63, 0.14), transparent 32%), radial-gradient(circle at bottom right, rgba(91, 168, 184, 0.14), transparent 34%), linear-gradient(180deg, #fffafc 0%, #f7f1f4 100%)",
      }}
    >
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="flex flex-col justify-between gap-8 rounded-[2rem] border p-8 shadow-[0_24px_80px_rgba(95,18,63,0.08)] lg:p-10" style={{ borderColor: "rgba(95, 18, 63, 0.12)", background: "linear-gradient(165deg, rgba(255,255,255,0.96) 0%, rgba(248,234,240,0.92) 100%)" }}>
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold text-white" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}>
                  T
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--text-tertiary)" }}>Tiri Weddings</p>
                  <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--primary)" }}>Where celebrations begin</h1>
                </div>
              </div>

              <Link href="/login" className="ui-button-secondary">
                Studio Login
              </Link>
            </div>

            <div className="mt-14 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--secondary)" }}>Book your wedding coverage</p>
              <h2 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl" style={{ color: "var(--text-primary)" }}>
                Plan your wedding with a studio team that already understands the day.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 sm:text-lg" style={{ color: "var(--text-secondary)" }}>
                Send your booking request in a minute. Share your name, phone number, wedding date, and wedding place, and the team will follow up to confirm availability.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border p-4" style={{ borderColor: "rgba(95, 18, 63, 0.08)", background: "rgba(255,255,255,0.72)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>Fast intake</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--primary)" }}>1-minute form</p>
            </article>
            <article className="rounded-2xl border p-4" style={{ borderColor: "rgba(95, 18, 63, 0.08)", background: "rgba(255,255,255,0.72)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>Clear follow-up</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--primary)" }}>Phone-first contact</p>
            </article>
            <article className="rounded-2xl border p-4" style={{ borderColor: "rgba(95, 18, 63, 0.08)", background: "rgba(255,255,255,0.72)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>Wedding-ready</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--primary)" }}>Date and venue captured</p>
            </article>
          </div>
        </div>

        <div className="flex items-center">
          <section className="w-full rounded-[2rem] border p-7 shadow-[0_24px_80px_rgba(46,26,36,0.08)] sm:p-8" style={{ borderColor: "var(--border-subtle)", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)" }}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-tertiary)" }}>Booking request</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight" style={{ color: "var(--primary)" }}>Reserve your date</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                Fill in the couple details and preferred wedding place. The studio team will review the request and contact you by phone.
              </p>
            </div>

            {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            {success ? <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="ui-input h-11"
                  placeholder="Bride and groom names"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Phone number
                <PhoneInput
                  value={form.phone}
                  onChange={(value) => setForm((current) => ({ ...current, phone: value ?? "" }))}
                  defaultCountry="ET"
                  className="w-full"
                  placeholder="+2519XXXXXXXX"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Date
                  <input
                    type="date"
                    min={minWeddingDate}
                    value={form.weddingDate}
                    onChange={(event) => setForm((current) => ({ ...current, weddingDate: event.target.value }))}
                    className="ui-input h-11"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Wedding place
                  <input
                    type="text"
                    value={form.weddingPlace}
                    onChange={(event) => setForm((current) => ({ ...current, weddingPlace: event.target.value }))}
                    className="ui-input h-11"
                    placeholder="Addis Ababa, Bole..."
                    required
                  />
                </label>
              </div>

              <button type="submit" disabled={submitting} className="ui-button-primary mt-2 h-12 w-full text-base font-semibold disabled:opacity-70">
                {submitting ? "Submitting request..." : "Send booking request"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
