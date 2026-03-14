"use client";

import { getApiErrorMessage } from "@/lib/api/base-api";
import { useGetRsvpByTokenQuery, useSubmitRsvpByTokenMutation } from "@/lib/api/invitations-api";
import type { InvitePayload } from "@/lib/api/types";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function InviteTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";

  const [payload, setPayload] = useState<InvitePayload | null>(null);
  const [status, setStatus] = useState<"ATTENDING" | "NOT_ATTENDING">("ATTENDING");
  const [plusOne, setPlusOne] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inviteQuery = useGetRsvpByTokenQuery({ token }, { skip: !token });
  const [submitRsvp] = useSubmitRsvpByTokenMutation();

  useEffect(() => {
    setLoading(inviteQuery.isLoading || inviteQuery.isFetching);
  }, [inviteQuery.isFetching, inviteQuery.isLoading]);

  useEffect(() => {
    if (!inviteQuery.data) return;

    const data = inviteQuery.data as InvitePayload;
    setPayload(data);
    setError(null);
    if (data.guest.profile.rsvpStatus === "NOT_ATTENDING") {
      setStatus("NOT_ATTENDING");
    }
    setPlusOne(data.guest.profile.rsvpPlusOne || 0);
  }, [inviteQuery.data]);

  useEffect(() => {
    if (!inviteQuery.error) return;
    setError(getApiErrorMessage(inviteQuery.error, "Invitation was not found."));
    setPayload(null);
  }, [inviteQuery.error]);

  const couple = useMemo(() => {
    if (!payload) return "";
    return [payload.event.brideName, payload.event.groomName].filter(Boolean).join(" & ") || payload.event.title;
  }, [payload]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const result = await submitRsvp({ token, status, plusOne });
    if ("error" in result) {
      setError(getApiErrorMessage(result.error, "Unable to submit RSVP right now."));
      setSubmitting(false);
      return;
    }

    setMessage("Your RSVP was submitted. Thank you.");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-zinc-500">Loading invitation...</p>
      </main>
    );
  }

  if (error || !payload) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">{error || "Invitation not found."}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Wedding Invitation</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{couple}</h1>
        <p className="mt-4 text-zinc-700">Dear {payload.guest.name}, you are warmly invited to celebrate with us.</p>

        <div className="mt-5 space-y-2 text-sm text-zinc-700">
          <p>
            <span className="font-semibold">Date:</span> {formatDate(payload.event.eventDate)}
          </p>
          <p>
            <span className="font-semibold">Venue:</span> {payload.event.location || "To be announced"}
          </p>
          {payload.event.description ? <p>{payload.event.description}</p> : null}
          <p>
            <a
              href={payload.event.googleMapAddress}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-cyan-700 underline"
            >
              Open venue map
            </a>
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">Will you attend?</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatus("ATTENDING")}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  status === "ATTENDING" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-zinc-200"
                }`}
              >
                Attending
              </button>
              <button
                type="button"
                onClick={() => setStatus("NOT_ATTENDING")}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  status === "NOT_ATTENDING" ? "border-rose-600 bg-rose-50 text-rose-700" : "border-zinc-200"
                }`}
              >
                Not Attending
              </button>
            </div>
          </div>

          <label className="block max-w-xs">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Additional guests (+1)</span>
            <input
              type="number"
              min={0}
              max={5}
              value={plusOne}
              onChange={(event) => setPlusOne(Number(event.target.value || 0))}
              className="ui-input"
            />
          </label>

          {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button type="submit" className="ui-button-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit RSVP"}
          </button>
        </form>
      </section>
    </main>
  );
}

