// app/invite/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// This is your Next.js App Router page. Each slug maps to one couple's invite.
// Replace the mock `getInviteData` with your real database/API call.
// ─────────────────────────────────────────────────────────────────────────────

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InviteData } from "@/lib/types";
import {
  orthodoxSample,
  muslimSample,
  protestantSample,
  calendarSample,
} from "@/lib/types";

// ── Template components ──────────────────────────────────────────────────────
import OrthodoxTemplate   from "@/components/templates/OrthodoxTemplate";
import MuslimTemplate     from "@/components/templates/MuslimTemplate";
import ProtestantTemplate from "@/components/templates/ProtestantTemplate";
import CalendarTemplate   from "@/components/templates/CalendarTemplate";

// ── Mock data store (replace with DB call) ──────────────────────────────────
const MOCK_INVITES: Record<string, InviteData> = {
  [orthodoxSample.slug]:   orthodoxSample,
  [muslimSample.slug]:     muslimSample,
  [protestantSample.slug]: protestantSample,
  [calendarSample.slug]:   calendarSample,
};

// ── Template selector ────────────────────────────────────────────────────────
// In production, store `templateId` in your DB alongside the invite data.
// Here we infer it from the sample slugs for demo purposes.
function getTemplateId(data: InviteData): string {
  if (data.slug === "fikerab-fenan")  return "orthodox";
  if (data.slug === "ismail-sara")    return "muslim";
  if (data.slug === "ephraim-mihret") return "protestant";
  if (data.slug === "ahadu-abigiya")  return "calendar";
  // Default based on religion
  if (data.religion === "muslim")     return "muslim";
  if (data.religion === "protestant") return "protestant";
  return "orthodox";
}

// ── Data fetcher ─────────────────────────────────────────────────────────────
async function getInviteData(slug: string): Promise<InviteData | null> {
  // TODO: replace with your actual DB query, e.g.:
  // const invite = await db.invite.findUnique({ where: { slug } });
  // return invite ?? null;
  return MOCK_INVITES[slug] ?? null;
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const data = await getInviteData(params.slug);
  if (!data) return { title: "Invitation Not Found" };
  return {
    title: `${data.groomName} & ${data.brideName} — Wedding Invitation`,
    description: data.messageBody.slice(0, 160),
    openGraph: {
      title: `${data.groomName} & ${data.brideName}`,
      description: `Join us on ${new Date(data.date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}`,
      images: data.couplePhotoUrl ? [data.couplePhotoUrl] : [],
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function InvitePage(
  { params }: { params: { slug: string } }
) {
  const data = await getInviteData(params.slug);
  if (!data) notFound();

  const templateId = getTemplateId(data);

  return (
    <main style={{ minHeight: "100vh", background: "#000" }}>
      {templateId === "orthodox"   && <OrthodoxTemplate   data={data} />}
      {templateId === "muslim"     && <MuslimTemplate     data={data} />}
      {templateId === "protestant" && <ProtestantTemplate data={data} />}
      {templateId === "calendar"   && <CalendarTemplate   data={data} />}
    </main>
  );
}

// ── Static params (optional — for static export) ─────────────────────────────
export async function generateStaticParams() {
  // Return known slugs for static generation
  return Object.keys(MOCK_INVITES).map(slug => ({ slug }));
}
