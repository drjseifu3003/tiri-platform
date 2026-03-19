// app/invite/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Religion templates → picked by data.religion
// Culture templates  → picked by data.culture
// Both render on the same page — religion section first, culture section second.
// In production, store templateType: "religion" | "culture" | "both" in your DB
// to control which renders. Here we render religion-only by default.
// ─────────────────────────────────────────────────────────────────────────────

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InviteData } from "@/lib/types";

// ── Religion templates ───────────────────────────────────────────────────────
import OrthodoxTemplate   from "@/components/templates/OrthodoxTemplate";
import MuslimTemplate     from "@/components/templates/MuslimTemplate";
import ProtestantTemplate from "@/components/templates/ProtestantTemplate";
import CatholicTemplate   from "@/components/templates/CatholicTemplate";

// ── Culture templates ────────────────────────────────────────────────────────
import HasbeshaTemplate   from "@/components/templates/HabeshaTemplate";
import OromoTemplate      from "@/components/templates/OromoTemplates";
import TigraiTemplate     from "@/components/templates/TigraiTemplate";
import SomaliTemplate     from "@/components/templates/SomaliTemplate";
import DiasporaTemplate   from "@/components/templates/DiasporaTemplate";

// ── Mock data (replace with your DB) ────────────────────────────────────────
// templateType: "religion" | "culture"
// religion: "orthodox" | "muslim" | "protestant" | "catholic"
// culture:  "habesha"  | "oromo"  | "tigrai"     | "somali" | "diaspora"

const MOCK_INVITES: Record<string, InviteData & { templateType: "religion" | "culture" }> = {
  // ── Religion samples ──
  "fikerab-fenan": {
    slug: "fikerab-fenan", templateType: "religion",
    groomName: "Fikerab", brideName: "Fenan",
    groomNameAm: "ፍቅርአብ", brideNameAm: "ፌናን",
    date: "2026-01-22", timeEn: "08:00 AM", timeAm: "2:00 ጠዋት",
    venue: "Hilton International Hotel",
    venueAddress: "Menelik II Ave, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Hilton+Addis+Ababa",
    couplePhotoUrl: "/images/couple-2.jpg",
    greetingTitle: "Dear Families and Friends",
    greetingTitleAm: "ለምንወዳቸው ቤተሰቦቻችን እና ጓደኞቻችን",
    messageBody: "Together with their families, Fikerab & Fenan joyfully invite you to celebrate their wedding day.",
    messageBodyAm: "ፍቅርአብ እና ፌናን ከቤተሰቦቻቸው ጋር ወደ ሠርጋቸው ጥሪ ያቀርቡልዎታል።",
    religion: "orthodox", 
    culture: "habesha",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
  "ismail-sara": {
    slug: "ismail-sara", templateType: "religion",
    groomName: "Ismail Ibrahim", brideName: "Sara Muhammad",
    groomNameAr: "إسماعيل إبراهيم", brideNameAr: "سارة محمد",
    date: "2026-03-15", timeEn: "12:00 PM", timeAr: "الظهر",
    venue: "Anwar Mosque", venueAddress: "Addis Ketema, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Anwar+Mosque+Addis+Ababa",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "We request the honour of your presence",
    messageBody: "We request the honor of your presence at our Nikah Ceremony to bless the couple with your prayers.",
    scripture: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
    scriptureRef: "In the name of Allah, the Most Gracious, the Most Merciful",
    religion: "muslim", 
    culture: "somali",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
  "ephraim-mihret": {
    slug: "ephraim-mihret", templateType: "religion",
    groomName: "Ephraim", brideName: "Mihret",
    date: "2026-05-22", timeEn: "09:00 AM", timeAm: "3:00 ጠዋት",
    venue: "International Evangelical Church",
    venueAddress: "Sarbet, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=International+Evangelical+Church+Sarbet",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "Dear Family and Friend",
    messageBody: "Together with their families, we joyfully invite you to celebrate their marriage at the International Evangelical Church.",
    scripture: '"The Lord has done great things for us, and we are filled with joy."',
    scriptureRef: "Psalms 126:3",
    religion: "protestant", 
    culture: "habesha",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
  "selamawit-girma": {
    slug: "selamawit-girma", templateType: "religion",
    groomName: "Girma Bekele", brideName: "Selamawit Haile",
    date: "2026-06-14", timeEn: "09:00 AM",
    venue: "Holy Trinity Cathedral", venueAddress: "Arat Kilo, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Holy+Trinity+Cathedral+Addis+Ababa",
    couplePhotoUrl: "/images/couple-1.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "We joyfully invite you to celebrate the Holy Nuptial Mass of Girma & Selamawit. Your presence and prayers would mean everything to us.",
    scripture: '"What God has joined together, let no man separate."',
    scriptureRef: "Matthew 19:6",
    religion: "catholic", 
    culture: "habesha",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
  // ── Culture samples ──
  "chaltu-gemechu": {
    slug: "chaltu-gemechu", templateType: "culture",
    groomName: "Gemechu Wakjira", brideName: "Chaltu Bekele",
    date: "2026-04-18", timeEn: "10:00 AM",
    venue: "Adama Convention Center", venueAddress: "Adama, Oromia, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Adama+Ethiopia",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "Gemechu & Chaltu joyfully invite you to share in their wedding celebration. Your presence is the greatest gift.",
    religion: "protestant", 
    culture: "oromo",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
  "miriam-tesfay": {
    slug: "miriam-tesfay", templateType: "culture",
    groomName: "Tesfay Hailu", brideName: "Miriam Gebru",
    groomNameAm: "ተስፋይ ሃይሉ", brideNameAm: "ምርያም ገብሩ",
    date: "2026-07-10", timeEn: "09:00 AM", timeAm: "3:00 ጠዋት",
    venue: "Axum Hotel", venueAddress: "Axum, Tigrai, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Axum+Ethiopia",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "Tesfay & Miriam joyfully invite you to celebrate their wedding day with them in Axum.",
    religion: "orthodox", 
    culture: "tigrai",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
  "fadumo-hassan": {
    slug: "fadumo-hassan", templateType: "culture",
    groomName: "Hassan Omar", brideName: "Fadumo Ali",
    date: "2026-08-20", timeEn: "10:00 AM",
    venue: "Jigjiga Cultural Center", venueAddress: "Jigjiga, Somali Region, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Jigjiga+Ethiopia",
    couplePhotoUrl: "/images/couple-1.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "Hassan & Fadumo warmly invite you to share in the joy of their wedding celebration.",
    religion: "muslim", 
    culture: "somali",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
  "hana-girma": {
    slug: "hana-girma", templateType: "culture",
    groomName: "Yonas Tadesse", brideName: "Hana Girma",
    groomNameAm: "ዮናስ ታደሰ", brideNameAm: "ሃና ግርማ",
    date: "2026-09-05", timeEn: "06:00 PM", timeAm: "12:00 ሌሊት",
    venue: "The Renaissance Hotel", venueAddress: "Washington D.C., USA",
    venueMapLink: "https://maps.google.com/?q=Renaissance+Hotel+DC",
    couplePhotoUrl: "/images/couple-1.jpg",
    greetingTitle: "Dear Families and Friends",
    greetingTitleAm: "ለምንወዳቸው ቤተሰቦቻችን",
    messageBody: "Yonas & Hana invite you to celebrate their wedding from across the world. Join us in D.C. as we begin our journey together.",
    messageBodyAm: "ዮናስ እና ሃና ወደ ሠርጋቸው ጥሪ ያቀርቡልዎታል።",
    religion: "orthodox", 
    culture: "diaspora",
    galleryImages: [
    "/images/couple-1.jpg",
    "/images/couple-2.jpg",
    "/images/couple-3.jpg",
    ],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
  },
};

// ── Slug resolution ──────────────────────────────────────────────────────────
async function resolveSlug(params: { slug: string } | Promise<{ slug: string }>): Promise<string> {
  if (params && typeof params === "object" && "then" in params) {
    return (await params).slug;
  }
  return (params as { slug: string }).slug;
}

// ── Data fetcher ─────────────────────────────────────────────────────────────
async function getInviteData(slug: string) {
  // TODO: replace with your actual DB query:
  // const invite = await db.invite.findUnique({ where: { slug } });
  // return invite ?? null;
  return MOCK_INVITES[slug] ?? null;
}
 
// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata(
  props: { params: { slug: string } | Promise<{ slug: string }> }
): Promise<Metadata> {
  const slug = await resolveSlug(props.params);
  const data = await getInviteData(slug);
  if (!data) return { title: "Invitation Not Found" };
  return {
    title: `${data.groomName} & ${data.brideName} — Wedding Invitation`,
    description: data.messageBody.slice(0, 160),
    openGraph: {
      title: `${data.groomName} & ${data.brideName}`,
      description: `Join us on ${new Date(data.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      images: data.couplePhotoUrl ? [data.couplePhotoUrl] : [],
    },
  };
}

// ── Religion template picker ─────────────────────────────────────────────────
function ReligionTemplate({ data }: { data: InviteData }) {
  switch (data.religion) {
    case "muslim":     return <MuslimTemplate     data={data} />;
    case "protestant": return <ProtestantTemplate data={data} />;
    case "catholic":   return <CatholicTemplate   data={data} />;
    case "orthodox":
    default:           return <OrthodoxTemplate   data={data} />;
  }
}

// ── Culture template picker ──────────────────────────────────────────────────
function CultureTemplate({ data }: { data: InviteData }) {
  switch (data.culture) {
    case "oromo":     return <OromoTemplate    data={data} />;
    case "tigrai":    return <TigraiTemplate   data={data} />;
    case "somali":    return <SomaliTemplate   data={data} />;
    case "diaspora":  return <DiasporaTemplate data={data} />;
    case "habesha":
    default:          return <HasbeshaTemplate data={data} />;
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function InvitePage(
  props: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const slug = await resolveSlug(props.params);
  const data = await getInviteData(slug);
  if (!data) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#000" }}>
      {data.templateType === "religion" && <ReligionTemplate data={data} />}
      {data.templateType === "culture"  && <CultureTemplate  data={data} />}
    </main>
  );
}

// ── Static params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return Object.keys(MOCK_INVITES).map(slug => ({ slug }));
}