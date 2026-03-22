// app/invite/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Routes guests to one of 10 templates based on data.templateKey.
// Falls back to religion/culture routing if templateKey is not set.
// Replace getInviteData() mock with your real DB query.
// ─────────────────────────────────────────────────────────────────────────────

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InviteData, TemplateKey } from "@/lib/types";

// ── 10 Templates ─────────────────────────────────────────────────────────────
// New templates (built from PDF spec)
import HasbeshaClassicTemplate    from "@/components/template/HasbeshaClassic";
import HasbeshaRoyalTemplate      from "@/components/template/HasbeshaRoyal";
import EthCelebrationTemplate     from "@/components/template/EthiopianCelebration";
import OrthodoxMinimalTemplate    from "@/components/template/OrthodoxMinimal";
import NikahMinimalTemplate       from "@/components/template/NikahMinimal";
import StoryPhotoTemplate         from "@/components/template/StoryPhoto";
import ElegantUniversalTemplate   from "@/components/template/ElegantUniversal";

// Existing templates (reused for 04, 06, 08)
import OrthodoxHolyUnionTemplate  from "@/components/templates/OrthodoxTemplate";   // 04
import NikahElegantTemplate       from "@/components/templates/MuslimTemplate";      // 06
import DiasporaLuxuryTemplate     from "@/components/templates/DiasporaTemplate";    // 08

// ── Legacy religion templates (backward compatibility) ────────────────────────
import ProtestantTemplate from "@/components/templates/ProtestantTemplate";
import CatholicTemplate   from "@/components/templates/CatholicTemplate";

// ─── Mock data store ──────────────────────────────────────────────────────────
// Replace getInviteData() with your actual DB query.
// Every invite now has a templateKey that maps to one of the 10 templates.

const MOCK_INVITES: Record<string, InviteData & { templateKey: TemplateKey }> = {

  // ── Template 1: Habesha Classic ───────────────────────────────────────────
  "fikerab-fenan": {
    slug: "fikerab-fenan",
    templateKey: "habesha-classic",
    groomName: "Fikerab", brideName: "Fenan",
    groomNameAm: "ፍቅርአብ", brideNameAm: "ፌናን",
    date: "2026-01-22", timeEn: "08:00 AM", timeAm: "2:00 ጠዋት",
    venue: "Hilton International Hotel",
    venueAddress: "Menelik II Ave, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Hilton+Addis+Ababa",
    couplePhotoUrl: "/images/couple-1.jpg",
    greetingTitle: "Dear Families and Friends",
    greetingTitleAm: "ለምንወዳቸው ቤተሰቦቻችን እና ጓደኞቻችን",
    messageBody: "Together with their families, Fikerab & Fenan joyfully invite you to celebrate their wedding day.",
    messageBodyAm: "ፍቅርአብ እና ፌናን ከቤተሰቦቻቸው ጋር ወደ ሠርጋቸው ጥሪ ያቀርቡልዎታል።",
    scripture: '"The Lord has done great things for us, and we are filled with joy."',
    scriptureRef: "Psalms 126:3",
    religion: "orthodox", culture: "habesha",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
    program: [
      { time: "8:00 AM", timeAm: "2:00 ጠዋት", title: "Liturgy", titleAm: "ቅዳሴ", desc: "Holy mass at the church" },
      { time: "9:30 AM", timeAm: "3:30 ጠዋት", title: "Teklil Ceremony", titleAm: "ተክሊል", desc: "Sacred crowning of the couple" },
      { time: "12:00 PM", timeAm: "6:00 ቀን", title: "Reception & Feast", titleAm: "ግብዣ", desc: "Welcome meal with family" },
      { time: "3:00 PM", timeAm: "9:00 ቀን", title: "Gursha Ceremony", titleAm: "ጉርሻ", desc: "Unity feeding ritual" },
      { time: "5:00 PM", timeAm: "11:00 ቀን", title: "Eskista & Music", titleAm: "እስኪስታ", desc: "Traditional dance & celebration" },
    ],
  },

  // ── Template 2: Habesha Royal ─────────────────────────────────────────────
  "solomon-mekdes": {
    slug: "solomon-mekdes",
    templateKey: "habesha-royal",
    groomName: "Solomon Tesfaye", brideName: "Mekdes Alemu",
    groomNameAm: "ሰሎሞን ተስፋዬ", brideNameAm: "መቅደስ አለሙ",
    date: "2026-02-14", timeEn: "06:00 PM", timeAm: "12:00 ሌሊት",
    venue: "Sheraton Addis", venueAddress: "Taitu St, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Sheraton+Addis+Ababa",
    couplePhotoUrl: "/images/couple-2.jpg",
    greetingTitle: "Dear Families and Friends",
    greetingTitleAm: "ለምንወዳቸው ቤተሰቦቻችን",
    messageBody: "Solomon & Mekdes joyfully invite you to celebrate their Royal Wedding.",
    messageBodyAm: "ሰሎሞን እና መቅደስ ወደ ሠርጋቸው ጥሪ ያቀርቡልዎታል።",
    religion: "orthodox", culture: "habesha",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/solomon_mekdes_wedding",
    telegramChannelName: "@solomon_mekdes",
    program: [
      { time: "6:00 PM", timeAm: "12:00 ሌሊት", title: "Welcome Reception", titleAm: "ጥሪ", desc: "Welcome drinks & greeting" },
      { time: "7:00 PM", timeAm: "1:00 ሌሊት", title: "Wedding Ceremony", titleAm: "ሠርግ", desc: "Exchange of vows" },
      { time: "8:00 PM", timeAm: "2:00 ሌሊት", title: "Dinner & Speeches", titleAm: "ዲነር", desc: "Sit-down dinner & toasts" },
      { time: "10:00 PM", timeAm: "4:00 ሌሊት", title: "Music & Dancing", titleAm: "ሙዚቃ", desc: "Evening celebration" },
    ],
  },

  // ── Template 3: Ethiopian Celebration ────────────────────────────────────
  "bekele-tigist": {
    slug: "bekele-tigist",
    templateKey: "eth-celebration",
    groomName: "Bekele Dagne", brideName: "Tigist Haile",
    groomNameAm: "በቀለ ዳኘ", brideNameAm: "ትግስት ሃይሌ",
    date: "2026-03-21", timeEn: "10:00 AM", timeAm: "4:00 ጠዋት",
    venue: "Millennium Hall", venueAddress: "Airport Rd, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Millennium+Hall+Addis+Ababa",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "Dear Families and Friends",
    greetingTitleAm: "ለምንወዳቸው ሁሉ",
    messageBody: "Bekele & Tigist joyfully invite you to their festive wedding celebration!",
    messageBodyAm: "በቀለ እና ትግስት ወደ ሠርጋቸው ጥሪ ያቀርቡልዎታል።",
    scripture: '"Let all that you do be done in love."',
    scriptureRef: "1 Corinthians 16:14",
    religion: "protestant", culture: "habesha",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/bekele_tigist_wedding",
    telegramChannelName: "@bekele_tigist",
    program: [
      { time: "10:00 AM", timeAm: "4:00 ጠዋት", title: "Wedding Ceremony", titleAm: "ሠርግ ሥነ-ስርዓት", desc: "Exchange of vows" },
      { time: "12:00 PM", timeAm: "6:00 ቀን", title: "Reception Feast", titleAm: "ግብዣ", desc: "Traditional injera banquet" },
      { time: "2:00 PM", timeAm: "8:00 ቀን", title: "Gursha Ceremony", titleAm: "ጉርሻ", desc: "Unity feeding ritual" },
      { time: "4:00 PM", timeAm: "10:00 ቀን", title: "Eskista & Music", titleAm: "እስኪስታ", desc: "Dance & celebration" },
    ],
  },

  // ── Template 4: Orthodox Holy Union ──────────────────────────────────────
  "fikerab-fenan-orthodox": {
    slug: "fikerab-fenan-orthodox",
    templateKey: "orthodox-holy",
    groomName: "Fikerab", brideName: "Fenan",
    groomNameAm: "ፍቅርአብ", brideNameAm: "ፌናን",
    date: "2026-01-22", timeEn: "08:00 AM", timeAm: "2:00 ጠዋት",
    venue: "Bole Medhane Alem Church",
    venueAddress: "Bole, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Bole+Medhane+Alem+Church",
    couplePhotoUrl: "/images/couple-2.jpg",
    greetingTitle: "Dear Families and Friends",
    greetingTitleAm: "ለምንወዳቸው ቤተሰቦቻችን",
    messageBody: "Together with their families, Fikerab & Fenan joyfully invite you to their Holy Teklil ceremony.",
    messageBodyAm: "ፍቅርአብ እና ፌናን ከቤተሰቦቻቸው ጋር ወደ ተክሊላቸው ጥሪ ያቀርቡልዎታል።",
    scripture: '"What God has joined together, let no man separate."',
    scriptureRef: "Matthew 19:6",
    religion: "orthodox", culture: "habesha",
    galleryImages: ["/images/couple-3.jpg", "/images/couple-3.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/fikerab_fenan_wedding",
    telegramChannelName: "@fikerab_fenan_wedding",
    program: [
      { time: "8:00 AM", timeAm: "2:00 ጠዋት", title: "Divine Liturgy", titleAm: "ቅዳሴ", desc: "Holy mass" },
      { time: "9:30 AM", timeAm: "3:30 ጠዋት", title: "Teklil Ceremony", titleAm: "ተክሊል", desc: "Sacred crowning" },
      { time: "11:00 AM", timeAm: "5:00 ጠዋት", title: "Procession", titleAm: "ዘፈድ", desc: "Wedding march" },
      { time: "1:00 PM", timeAm: "7:00 ቀን", title: "Reception", titleAm: "ግብዣ", desc: "Celebration meal" },
    ],
  },

  // ── Template 5: Orthodox Minimal ─────────────────────────────────────────
  "daniel-sara-orthodox": {
    slug: "daniel-sara-orthodox",
    templateKey: "orthodox-minimal",
    groomName: "Daniel Hailu", brideName: "Sara Tadesse",
    groomNameAm: "ዳኒኤል ሃይሉ", brideNameAm: "ሳራ ታደሰ",
    date: "2026-04-05", timeEn: "09:00 AM", timeAm: "3:00 ጠዋት",
    venue: "Holy Trinity Cathedral",
    venueAddress: "Arat Kilo, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Holy+Trinity+Cathedral+Addis+Ababa",
    couplePhotoUrl: "/images/couple-2.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "Daniel & Sara joyfully invite you to witness their Holy Matrimony.",
    scripture: '"Love is patient, love is kind."',
    scriptureRef: "1 Corinthians 13:4",
    religion: "orthodox", culture: "habesha",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/daniel_sara_wedding",
    telegramChannelName: "@daniel_sara",
    program: [
      { time: "9:00 AM", title: "Holy Mass", titleAm: "ቅዳሴ", desc: "Morning liturgy" },
      { time: "10:30 AM", title: "Teklil", titleAm: "ተክሊል", desc: "Crowning ceremony" },
      { time: "12:00 PM", title: "Reception", titleAm: "ግብዣ", desc: "Wedding feast" },
    ],
  },

  // ── Template 6: Nikah Elegant ─────────────────────────────────────────────
  "ismail-sara": {
    slug: "ismail-sara",
    templateKey: "nikah-elegant",
    groomName: "Ismail Ibrahim", brideName: "Sara Muhammad",
    groomNameAr: "إسماعيل إبراهيم", brideNameAr: "سارة محمد",
    date: "2026-03-15", timeEn: "12:00 PM", timeAr: "الظهر",
    venue: "Anwar Mosque", venueAddress: "Addis Ketema, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Anwar+Mosque+Addis+Ababa",
    couplePhotoUrl: "/images/couple-2.jpg",
    greetingTitle: "We request the honour of your presence",
    messageBody: "We request the honor of your presence at our Nikah Ceremony to bless the couple with your prayers.",
    scripture: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
    scriptureRef: "In the name of Allah, the Most Gracious, the Most Merciful",
    religion: "muslim", culture: "somali",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/ismail_sara_nikah",
    telegramChannelName: "@ismail_sara_nikah",
    program: [
      { time: "11:00 AM", timeAr: "الضحى", title: "Fajr Prayer", titleAr: "صلاة الفجر", desc: "Morning prayers" },
      { time: "12:00 PM", timeAr: "الظهر", title: "Nikah Ceremony", titleAr: "عقد النكاح", desc: "The sacred marriage contract" },
      { time: "1:00 PM", timeAr: "العصر", title: "Wedding Feast", titleAr: "وليمة العرس", desc: "Celebratory meal" },
      { time: "4:00 PM", timeAr: "المساء", title: "Family Gathering", titleAr: "التجمع العائلي", desc: "Music & celebration" },
    ],
  },

  // ── Template 7: Nikah Minimal ─────────────────────────────────────────────
  "omar-fatima": {
    slug: "omar-fatima",
    templateKey: "nikah-minimal",
    groomName: "Omar Yusuf", brideName: "Fatima Hassan",
    groomNameAr: "عمر يوسف", brideNameAr: "فاطمة حسن",
    date: "2026-05-10", timeEn: "10:00 AM", timeAr: "الضحى",
    venue: "Al-Ansar Mosque", venueAddress: "Mercato, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Mercato+Addis+Ababa",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "We humbly invite you",
    messageBody: "Omar & Fatima invite you to their Nikah ceremony. Your prayers and presence are the greatest gift.",
    scripture: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
    scriptureRef: "In the name of Allah, the Most Gracious, the Most Merciful",
    religion: "muslim", culture: "somali",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg"],
    telegramChannel: "https://t.me/omar_fatima_nikah",
    telegramChannelName: "@omar_fatima",
    program: [
      { time: "10:00 AM", timeAr: "الضحى", title: "Nikah Ceremony", titleAr: "عقد النكاح", desc: "The marriage contract" },
      { time: "12:00 PM", timeAr: "الظهر", title: "Dua & Blessing", titleAr: "الدعاء", desc: "Prayers for the couple" },
      { time: "1:00 PM", timeAr: "العصر", title: "Walima Feast", titleAr: "وليمة", desc: "Wedding banquet" },
    ],
  },

  // ── Template 8: Diaspora Luxury ───────────────────────────────────────────
  "hana-girma": {
    slug: "hana-girma",
    templateKey: "diaspora-luxury",
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
    religion: "orthodox", culture: "diaspora",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/yonas_hana_wedding",
    telegramChannelName: "@yonas_hana",
    program: [
      { time: "5:00 PM", timeAm: "11:00 ቀን", title: "Arrival & Welcome", titleAm: "መግቢያ", desc: "Drinks & welcome reception" },
      { time: "6:00 PM", timeAm: "12:00 ሌሊት", title: "Wedding Ceremony", titleAm: "ሠርግ", desc: "Exchange of vows" },
      { time: "7:30 PM", timeAm: "1:30 ሌሊት", title: "Dinner & Speeches", titleAm: "ዲነር", desc: "Sit-down dinner" },
      { time: "9:30 PM", timeAm: "3:30 ሌሊት", title: "First Dance", titleAm: "የመጀመሪያ ዳንስ", desc: "Couple's first dance" },
      { time: "10:00 PM", timeAm: "4:00 ሌሊት", title: "Eskista Night", titleAm: "እስኪስታ", desc: "Dancing until midnight" },
    ],
  },

  // ── Template 9: Story / Photo ─────────────────────────────────────────────
  "ephraim-mihret": {
    slug: "ephraim-mihret",
    templateKey: "story-photo",
    groomName: "Ephraim Alemu", brideName: "Mihret Kebede",
    date: "2026-05-22", timeEn: "05:00 PM", timeAm: "11:00 ቀን",
    venue: "Kuriftu Resort", venueAddress: "Debre Zeit, Oromia, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Kuriftu+Resort+Debre+Zeit",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "Our Love Story Continues",
    messageBody: "Ephraim & Mihret invite you to celebrate the next chapter of their love story. Your presence makes our joy complete.",
    scripture: '"Where you go, I will go. Where you stay, I will stay."',
    scriptureRef: "Ruth 1:16",
    religion: "protestant", culture: "habesha",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/ephraim_mihret_wedding",
    telegramChannelName: "@ephraim_mihret",
    program: [
      { time: "4:00 PM", title: "Arrival", desc: "Welcome drinks by the lake" },
      { time: "5:00 PM", title: "Ceremony", desc: "Exchange of vows & rings" },
      { time: "6:30 PM", title: "Cocktail Hour", desc: "Canapes & celebration" },
      { time: "7:30 PM", title: "Dinner & Speeches", desc: "Romantic lakeside dinner" },
      { time: "9:30 PM", title: "First Dance", desc: "Our first dance as one" },
      { time: "10:00 PM", title: "Party", desc: "Dance the night away" },
    ],
  },

  // ── Template 10: Elegant Universal ───────────────────────────────────────
  "selamawit-girma": {
    slug: "selamawit-girma",
    templateKey: "elegant-universal",
    groomName: "Girma Bekele", brideName: "Selamawit Haile",
    groomNameAm: "ግርማ በቀለ", brideNameAm: "ሰላማዊት ሃይሌ",
    date: "2026-06-14", timeEn: "09:00 AM", timeAm: "3:00 ጠዋት",
    venue: "Holy Trinity Cathedral", venueAddress: "Arat Kilo, Addis Ababa, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Holy+Trinity+Cathedral+Addis+Ababa",
    couplePhotoUrl: "/images/couple-1.jpg",
    greetingTitle: "Dear Families and Friends",
    greetingTitleAm: "ለምንወዳቸው ቤተሰቦቻችን",
    messageBody: "We joyfully invite you to celebrate the wedding of Girma & Selamawit. Your presence is the greatest blessing.",
    messageBodyAm: "ግርማ እና ሰላማዊት ወደ ሠርጋቸው ጥሪ ያቀርቡልዎታል።",
    scripture: '"What God has joined together, let no man separate."',
    scriptureRef: "Matthew 19:6",
    religion: "catholic", culture: "habesha",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/girma_selamawit_wedding",
    telegramChannelName: "@girma_selamawit",
    program: [
      { time: "9:00 AM", timeAm: "3:00 ጠዋት", title: "Holy Mass", titleAm: "ቅዳሴ", desc: "Morning liturgy" },
      { time: "11:00 AM", timeAm: "5:00 ጠዋት", title: "Wedding Ceremony", titleAm: "ሠርግ", desc: "Exchange of vows" },
      { time: "1:00 PM", timeAm: "7:00 ቀን", title: "Reception", titleAm: "ግብዣ", desc: "Wedding feast & celebration" },
      { time: "4:00 PM", timeAm: "10:00 ቀን", title: "Music & Dance", titleAm: "ሙዚቃ", desc: "Celebration continues" },
    ],
  },

  // ── Legacy culture slugs (backward compatible) ────────────────────────────
  "chaltu-gemechu": {
    slug: "chaltu-gemechu",
    templateKey: "eth-celebration", // maps to template 3
    groomName: "Gemechu Wakjira", brideName: "Chaltu Bekele",
    date: "2026-04-18", timeEn: "10:00 AM",
    venue: "Adama Convention Center", venueAddress: "Adama, Oromia, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Adama+Ethiopia",
    couplePhotoUrl: "/images/couple-2.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "Gemechu & Chaltu joyfully invite you to share in their wedding celebration.",
    religion: "protestant", culture: "oromo",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/chaltu_gemechu_wedding",
    telegramChannelName: "@chaltu_gemechu",
  },

  "miriam-tesfay": {
    slug: "miriam-tesfay",
    templateKey: "habesha-classic", // maps to template 1
    groomName: "Tesfay Hailu", brideName: "Miriam Gebru",
    groomNameAm: "ተስፋይ ሃይሉ", brideNameAm: "ምርያም ገብሩ",
    date: "2026-07-10", timeEn: "09:00 AM", timeAm: "3:00 ጠዋት",
    venue: "Axum Hotel", venueAddress: "Axum, Tigrai, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Axum+Ethiopia",
    couplePhotoUrl: "/images/couple-3.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "Tesfay & Miriam joyfully invite you to celebrate their wedding day in Axum.",
    religion: "orthodox", culture: "tigrai",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/tesfay_miriam_wedding",
    telegramChannelName: "@tesfay_miriam",
  },

  "fadumo-hassan": {
    slug: "fadumo-hassan",
    templateKey: "nikah-minimal", // maps to template 7
    groomName: "Hassan Omar", brideName: "Fadumo Ali",
    groomNameAr: "حسن عمر", brideNameAr: "فاضمو علي",
    date: "2026-08-20", timeEn: "10:00 AM", timeAr: "الضحى",
    venue: "Jigjiga Cultural Center", venueAddress: "Jigjiga, Somali Region, Ethiopia",
    venueMapLink: "https://maps.google.com/?q=Jigjiga+Ethiopia",
    couplePhotoUrl: "/images/couple-1.jpg",
    greetingTitle: "Dear Families and Friends",
    messageBody: "Hassan & Fadumo warmly invite you to share in the joy of their wedding celebration.",
    scripture: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
    scriptureRef: "In the name of Allah, the Most Gracious, the Most Merciful",
    religion: "muslim", culture: "somali",
    galleryImages: ["/images/couple-1.jpg", "/images/couple-2.jpg", "/images/couple-3.jpg"],
    telegramChannel: "https://t.me/hassan_fadumo_wedding",
    telegramChannelName: "@hassan_fadumo",
  },
};

// ─── Slug resolution ──────────────────────────────────────────────────────────
async function resolveSlug(
  params: { slug: string } | Promise<{ slug: string }>
): Promise<string> {
  if (params && typeof params === "object" && "then" in params) {
    return (await params).slug;
  }
  return (params as { slug: string }).slug;
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────
async function getInviteData(slug: string) {
  // TODO: replace with your DB query:
  // const invite = await db.invite.findUnique({ where: { slug } });
  // return invite ?? null;
  return MOCK_INVITES[slug] ?? null;
}

// ─── Template picker — all 10 ─────────────────────────────────────────────────
function TemplateRenderer({ data }: { data: InviteData & { templateKey?: TemplateKey } }) {
  switch (data.templateKey) {
    // New templates
    case "habesha-classic":   return <HasbeshaClassicTemplate  data={data} />;
    case "habesha-royal":     return <HasbeshaRoyalTemplate    data={data} />;
    case "eth-celebration":   return <EthCelebrationTemplate   data={data} />;
    case "orthodox-holy":     return <OrthodoxHolyUnionTemplate data={data} />;
    case "orthodox-minimal":  return <OrthodoxMinimalTemplate  data={data} />;
    case "nikah-elegant":     return <NikahElegantTemplate     data={data} />;
    case "nikah-minimal":     return <NikahMinimalTemplate     data={data} />;
    case "diaspora-luxury":   return <DiasporaLuxuryTemplate   data={data} />;
    case "story-photo":       return <StoryPhotoTemplate       data={data} />;
    case "elegant-universal": return <ElegantUniversalTemplate data={data} />;

    // Fallback: route by religion if no templateKey
    default:
      switch (data.religion) {
        case "muslim":     return <NikahElegantTemplate      data={data} />;
        case "protestant": return <ProtestantTemplate        data={data} />;
        case "catholic":   return <CatholicTemplate          data={data} />;
        case "orthodox":
        default:           return <OrthodoxHolyUnionTemplate data={data} />;
      }
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata(
  props: { params: { slug: string } | Promise<{ slug: string }> }
): Promise<Metadata> {
  const slug = await resolveSlug(props.params);
  const data = await getInviteData(slug);
  if (!data) return { title: "Invitation Not Found" };
  const dateStr = new Date(data.date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  return {
    title: `${data.groomName} & ${data.brideName} — Wedding Invitation`,
    description: data.messageBody.slice(0, 160),
    openGraph: {
      title: `${data.groomName} & ${data.brideName}`,
      description: `Join us on ${dateStr} at ${data.venue}`,
      images: data.couplePhotoUrl ? [data.couplePhotoUrl] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function InvitePage(
  props: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const slug = await resolveSlug(props.params);
  const data = await getInviteData(slug);
  if (!data) notFound();

  return (
    <main style={{ minHeight: "100vh" }}>
      <TemplateRenderer data={data} />
    </main>
  );
}

// ─── Static params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return Object.keys(MOCK_INVITES).map(slug => ({ slug }));
}