import {
  badRequestResponse,
  notFoundResponse,
  requireStudioSession,
} from "@/lib/api-auth";
import { GuestCategory } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function isMissingColumnError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2022";
}

const createGuestSchema = z.object({
  eventId: z
    .string()
    .trim()
    .regex(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      "eventId must be a valid UUID string"
    ),
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  category: z.nativeEnum(GuestCategory).optional(),
  invitationCode: z.string().min(3).optional(),
});

function isUniqueInvitationCodeError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  const typed = error as { code?: string; meta?: { target?: string[] | string } };
  if (typed.code !== "P2002") return false;

  const target = typed.meta?.target;
  if (Array.isArray(target)) return target.includes("invitationCode");
  return typeof target === "string" ? target.includes("invitationCode") : false;
}

function normalizeOptional(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function buildInvitationCode(prefix = "GST") {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}-${random}`.toUpperCase();
}

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const eventId = request.nextUrl.searchParams.get("eventId");
  const scope = request.nextUrl.searchParams.get("scope");

  if (!eventId && scope !== "studio") {
    return badRequestResponse("eventId query param is required, or set scope=studio");
  }

  if (scope === "studio") {
    try {
      const guests = await prisma.guest.findMany({
        where: {
          event: {
            studioId: session.studioId,
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return NextResponse.json({ guests });
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      const guests = await prisma.guest.findMany({
        where: {
          event: {
            studioId: session.studioId,
          },
        },
        select: {
          id: true,
          eventId: true,
          name: true,
          phone: true,
          email: true,
          invitationCode: true,
          checkedIn: true,
          checkedInAt: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return NextResponse.json({ guests: guests.map((guest) => ({ ...guest, category: GuestCategory.GENERAL })) });
    }
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId!, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  try {
    const guests = await prisma.guest.findMany({
      where: { eventId: eventId! },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const guests = await prisma.guest.findMany({
      where: { eventId: eventId! },
      select: {
        id: true,
        eventId: true,
        name: true,
        phone: true,
        email: true,
        invitationCode: true,
        checkedIn: true,
        checkedInAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ guests: guests.map((guest) => ({ ...guest, category: GuestCategory.GENERAL })) });
  }
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = createGuestSchema.safeParse(body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") || "payload";
    const message = issue?.message || "Invalid guest payload";
    return badRequestResponse(`${path}: ${message}`);
  }

  const event = await prisma.event.findFirst({
    where: { id: parsed.data.eventId, studioId: session.studioId },
    select: { id: true },
  });

  if (!event) return notFoundResponse("Event not found");

  const normalizedName = parsed.data.name.trim();
  const normalizedPhone = normalizeOptional(parsed.data.phone);
  const normalizedEmail = normalizeOptional(parsed.data.email);
  let nextInvitationCode = normalizeOptional(parsed.data.invitationCode)?.toUpperCase() ?? buildInvitationCode();

  if (normalizedName.length < 2) {
    return badRequestResponse("Guest name must be at least 2 characters");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const guest = await prisma.guest.create({
        data: {
          eventId: parsed.data.eventId,
          name: normalizedName,
          phone: normalizedPhone,
          email: normalizedEmail,
          category: parsed.data.category ?? GuestCategory.GENERAL,
          invitationCode: nextInvitationCode,
        },
      });

      return NextResponse.json({ guest }, { status: 201 });
    } catch (error) {
      if (isUniqueInvitationCodeError(error)) {
        nextInvitationCode = buildInvitationCode();
        continue;
      }

      if (!isMissingColumnError(error)) throw error;

      try {
        const guest = await prisma.guest.create({
          data: {
            eventId: parsed.data.eventId,
            name: normalizedName,
            phone: normalizedPhone,
            email: normalizedEmail,
            invitationCode: nextInvitationCode,
          },
        });

        return NextResponse.json({ guest: { ...guest, category: GuestCategory.GENERAL } }, { status: 201 });
      } catch (fallbackError) {
        if (isUniqueInvitationCodeError(fallbackError)) {
          nextInvitationCode = buildInvitationCode();
          continue;
        }
        throw fallbackError;
      }
    }
  }

  return badRequestResponse("Unable to generate a unique invitation code. Please try again.");
}
