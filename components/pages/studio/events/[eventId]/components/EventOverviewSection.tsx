import { ExternalLink, Trash2 } from "lucide-react";
import type { RefObject } from "react";

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

type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  groupLabel: string | null;
  createdAt: string;
};

type EventDetail = {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  bridePhone: string | null;
  groomPhone: string | null;
  eventDate: string;
  location: string | null;
  googleMapAddress: string;
  description: string | null;
};

type EventOverviewSectionProps = {
  event: EventDetail;
};

export function EventOverviewSection({
  event,
}: Omit<EventOverviewSectionProps, 'onInvitationCardUpload' | 'onInvitationCardDelete'>) {
  return (
    <section className="mt-5 grid gap-4 md:grid-cols-2">
      <div className="ui-panel">
        <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Event Overview</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Bride Name</p>
            <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.brideName || "-"}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Groom Name</p>
            <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.groomName || "-"}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Bride Phone</p>
            <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.bridePhone || "-"}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Groom Phone</p>
            <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.groomPhone || "-"}</p>
          </div>
          <div className="rounded-lg border p-3 sm:col-span-2" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Location</p>
            <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.location || "No location provided"}</p>
          </div>
        </div>
      </div>

      <div className="ui-panel">
        <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Event Location</h3>
        <p className="mt-3 break-all text-sm" style={{ color: "var(--text-secondary)" }}>{event.googleMapAddress || "Not provided"}</p>
        {event.googleMapAddress ? (
          <a
            href={event.googleMapAddress}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(to right, var(--primary), var(--primary-light))" }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Open in Google Maps
          </a>
        ) : null}
        {event.description ? (
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
        ) : null}
      </div>
    </section>
  );
}
