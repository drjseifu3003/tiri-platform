import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const eventStatusValues = ["DRAFT", "SCHEDULED", "LIVE", "COMPLETED", "CANCELLED", "ARCHIVED"] as const;
const eventStatusSchema = z.enum(eventStatusValues);
type EventStatus = (typeof eventStatusValues)[number];

function statusFromLegacy(input: { eventDate: Date; isPublished?: boolean; status?: EventStatus }) {
  if (input.status) return input.status;
  if (input.eventDate < new Date()) return "COMPLETED" as const;
  return input.isPublished ? "SCHEDULED" : "DRAFT";
}

function toPublishedFlag(status: EventStatus) {
  return status === "SCHEDULED" || status === "LIVE" || status === "COMPLETED";
}

const createEventSchema = z.object({
  title: z.string().min(2),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  bridePhone: z.string().trim().min(1),
  groomPhone: z.string().trim().min(1),
  eventDate: z.coerce.date(),
  location: z.string().optional(),
  googleMapAddress: z.string().trim().optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  slug: z.string().min(2),
  subdomain: z.string().min(2).optional(),
  isPublished: z.boolean().optional(),
  status: eventStatusSchema.optional(),
});

const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  filter: z.enum(["all", "draft", "scheduled", "live", "completed", "cancelled", "archived", "published"]).default("all"),
  dateFilter: z.enum(["all", "today", "upcoming", "past", "this-month", "custom"]).default("all"),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function parseDateBoundary(value: string, endOfDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  return endOfDay
    ? new Date(year, month - 1, day + 1, 0, 0, 0, 0)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const parsedQuery = listEventsQuerySchema.safeParse({
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    filter: request.nextUrl.searchParams.get("filter") ?? "all",
    dateFilter: request.nextUrl.searchParams.get("dateFilter") ?? "all",
    dateFrom: request.nextUrl.searchParams.get("dateFrom") ?? undefined,
    dateTo: request.nextUrl.searchParams.get("dateTo") ?? undefined,
  });

  if (!parsedQuery.success) {
    return badRequestResponse("Invalid events query params");
  }

  const { page, pageSize, search, filter, dateFilter, dateFrom, dateTo } = parsedQuery.data;
  const skip = (page - 1) * pageSize;
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const thisMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const nextMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 1);

  const customDateRange = {
    ...(dateFrom ? { gte: parseDateBoundary(dateFrom, false) } : {}),
    ...(dateTo ? { lt: parseDateBoundary(dateTo, true) } : {}),
  };

  const dateWhere = dateFilter === "today"
    ? { eventDate: { gte: todayStart, lt: tomorrowStart } }
    : dateFilter === "upcoming"
      ? { eventDate: { gte: now } }
      : dateFilter === "past"
        ? { eventDate: { lt: now } }
        : dateFilter === "this-month"
          ? { eventDate: { gte: thisMonthStart, lt: nextMonthStart } }
          : dateFilter === "custom"
              ? (Object.keys(customDateRange).length > 0 ? { eventDate: customDateRange } : {})
            : {};

  const where = {
    studioId: session.studioId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { brideName: { contains: search, mode: "insensitive" as const } },
            { groomName: { contains: search, mode: "insensitive" as const } },
            { bridePhone: { contains: search, mode: "insensitive" as const } },
            { groomPhone: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
            { googleMapAddress: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filter === "draft"
      ? { status: "DRAFT" as const }
      : filter === "scheduled"
        ? { status: "SCHEDULED" as const }
        : filter === "live"
          ? { status: "LIVE" as const }
          : filter === "completed"
            ? { status: "COMPLETED" as const }
            : filter === "cancelled"
              ? { status: "CANCELLED" as const }
              : filter === "archived"
                ? { status: "ARCHIVED" as const }
                : filter === "published"
                  ? { status: { in: ["SCHEDULED", "LIVE"] as const } }
                  : {}),
    ...dateWhere,
  };

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            guests: true,
            media: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const eventIds = events.map((event) => event.id);
  const checkedInGroups = eventIds.length
    ? await prisma.guest.groupBy({
        by: ["eventId"],
        where: {
          eventId: { in: eventIds },
          checkedIn: true,
        },
        _count: {
          _all: true,
        },
      })
    : [];

  const checkedInByEvent = Object.fromEntries(
    checkedInGroups.map((item) => [item.eventId, item._count._all])
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    events,
    checkedInByEvent,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse("Invalid event payload");
  }

  const initialStatus = statusFromLegacy({
    eventDate: parsed.data.eventDate,
    isPublished: parsed.data.isPublished,
    status: parsed.data.status,
  });

  const event = await prisma.event.create({
    data: {
      studioId: session.studioId,
      title: parsed.data.title,
      brideName: parsed.data.brideName,
      groomName: parsed.data.groomName,
      bridePhone: parsed.data.bridePhone,
      groomPhone: parsed.data.groomPhone,
      eventDate: parsed.data.eventDate,
      location: parsed.data.location,
      googleMapAddress: parsed.data.googleMapAddress ?? "",
      description: parsed.data.description,
      coverImage: parsed.data.coverImage,
      slug: parsed.data.slug,
      subdomain: parsed.data.subdomain,
      status: initialStatus,
      isPublished: toPublishedFlag(initialStatus),
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
