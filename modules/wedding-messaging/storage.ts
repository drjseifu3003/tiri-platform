import { prisma } from "@/lib/prisma";
import { GuestMessagingProfile, RsvpStatus } from "@/modules/wedding-messaging/types";

export function isMessagingProfileTableMissing(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;

  const typed = error as {
    code?: string;
    message?: string;
    meta?: { code?: string; message?: string };
  };

  const code = typed.code;
  if (code === "42P01") return true;

  const combinedMessage = `${typed.message ?? ""} ${typed.meta?.message ?? ""}`.toLowerCase();
  const mentionsMissingRelation =
    combinedMessage.includes("relation") &&
    combinedMessage.includes("does not exist") &&
    combinedMessage.includes("guestmessagingprofile");

  if (code === "P2010") {
    if (typed.meta?.code === "42P01") return true;
    if (mentionsMissingRelation) return true;
  }

  if (mentionsMissingRelation) return true;

  return false;
}

function asRsvpStatus(value: string | null | undefined): RsvpStatus {
  if (value === "ATTENDING" || value === "NOT_ATTENDING") return value;
  return "PENDING";
}

const defaultProfile: Omit<GuestMessagingProfile, "guestId"> = {
  telegramChatId: null,
  telegramUsername: null,
  rsvpStatus: "PENDING",
  rsvpPlusOne: 0,
  rsvpRespondedAt: null,
};

type ProfileRow = {
  guestId: string;
  telegramChatId: string | null;
  telegramUsername: string | null;
  rsvpStatus: string;
  rsvpPlusOne: number;
  rsvpRespondedAt: Date | null;
};

export async function getProfilesByGuestIds(guestIds: string[]) {
  if (guestIds.length === 0) return new Map<string, GuestMessagingProfile>();

  const placeholders = guestIds.map((_, index) => `$${index + 1}`).join(", ");

  const rows = await prisma.$queryRawUnsafe<ProfileRow[]>(
    `SELECT "guestId", "telegramChatId", "telegramUsername", "rsvpStatus", "rsvpPlusOne", "rsvpRespondedAt"
     FROM "GuestMessagingProfile"
     WHERE "guestId" IN (${placeholders})`,
    ...guestIds
  );

  return new Map<string, GuestMessagingProfile>(
    rows.map((row) => [
      row.guestId,
      {
        guestId: row.guestId,
        telegramChatId: row.telegramChatId,
        telegramUsername: row.telegramUsername,
        rsvpStatus: asRsvpStatus(row.rsvpStatus),
        rsvpPlusOne: Number(row.rsvpPlusOne || 0),
        rsvpRespondedAt: row.rsvpRespondedAt ? row.rsvpRespondedAt.toISOString() : null,
      },
    ])
  );
}

export function withDefaultProfile(guestId: string, profile?: GuestMessagingProfile): GuestMessagingProfile {
  if (profile) return profile;

  return {
    guestId,
    ...defaultProfile,
  };
}

export async function upsertTelegramProfile(input: {
  guestId: string;
  telegramChatId: string;
  telegramUsername: string | null;
}) {
  await prisma.$executeRaw`
    INSERT INTO "GuestMessagingProfile" ("guestId", "telegramChatId", "telegramUsername", "createdAt", "updatedAt")
    VALUES (${input.guestId}, ${input.telegramChatId}, ${input.telegramUsername}, NOW(), NOW())
    ON CONFLICT ("guestId") DO UPDATE
    SET "telegramChatId" = EXCLUDED."telegramChatId",
        "telegramUsername" = EXCLUDED."telegramUsername",
        "updatedAt" = NOW()
  `;
}

export async function updateRsvpProfile(input: {
  guestId: string;
  rsvpStatus: RsvpStatus;
  plusOne: number;
}) {
  await prisma.$executeRaw`
    INSERT INTO "GuestMessagingProfile" ("guestId", "rsvpStatus", "rsvpPlusOne", "rsvpRespondedAt", "createdAt", "updatedAt")
    VALUES (${input.guestId}, ${input.rsvpStatus}, ${input.plusOne}, NOW(), NOW(), NOW())
    ON CONFLICT ("guestId") DO UPDATE
    SET "rsvpStatus" = EXCLUDED."rsvpStatus",
        "rsvpPlusOne" = EXCLUDED."rsvpPlusOne",
        "rsvpRespondedAt" = NOW(),
        "updatedAt" = NOW()
  `;
}
