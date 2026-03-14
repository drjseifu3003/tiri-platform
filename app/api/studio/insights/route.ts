import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type ChartGranularity = "yearly" | "monthly";

type AnniversaryRangeFilter = "all" | "next-7" | "next-30" | "next-90" | "next-365" | "custom";
type AnniversaryMilestoneFilter = "all" | "1" | "5" | "10" | "15" | "20";

const modeSchema = z.object({
  mode: z.enum(["general", "anniversary"]).default("general"),
});

const generalQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2200).default(new Date().getFullYear()),
  granularity: z.enum(["yearly", "monthly"]).default("yearly"),
  month: z.coerce.number().int().min(0).max(11).default(new Date().getMonth()),
});

const anniversaryQuerySchema = z.object({
  search: z.string().trim().optional(),
  range: z.enum(["all", "next-7", "next-30", "next-90", "next-365", "custom"]).default("all"),
  milestone: z.enum(["all", "1", "5", "10", "15", "20"]).default("all"),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

function monthLabel(index: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2026, index, 1));
}

function parseDateBoundary(value: string, endOfDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  return endOfDay
    ? new Date(year, month - 1, day + 1, 0, 0, 0, 0)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
}

function coupleLabel(event: { title: string; brideName: string | null; groomName: string | null }) {
  const bride = event.brideName?.trim();
  const groom = event.groomName?.trim();
  if (bride && groom) return `${bride} & ${groom}`;
  if (bride) return bride;
  if (groom) return groom;
  return event.title;
}

function getNextAnniversary(eventDate: Date, fromDate: Date) {
  const next = new Date(fromDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  if (next < fromDate) {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

async function getGeneralInsights(studioId: string, year: number, granularity: ChartGranularity, month: number) {
  const allEventDates = await prisma.event.findMany({
    where: { studioId },
    select: { eventDate: true },
  });

  const availableYearsSet = new Set<number>();
  for (const item of allEventDates) {
    availableYearsSet.add(item.eventDate.getFullYear());
  }
  if (availableYearsSet.size === 0) {
    availableYearsSet.add(new Date().getFullYear());
  }

  const availableYears = [...availableYearsSet].sort((a, b) => b - a);

  const statusGroups = await prisma.event.groupBy({
    by: ["status"],
    where: { studioId },
    _count: { _all: true },
  });

  const totalAll = statusGroups.reduce((sum, item) => sum + item._count._all, 0);
  const statusCount = {
    DRAFT: 0,
    SCHEDULED: 0,
    LIVE: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    ARCHIVED: 0,
  };

  for (const item of statusGroups) {
    statusCount[item.status] = item._count._all;
  }

  const fromDate = granularity === "yearly"
    ? new Date(year, 0, 1, 0, 0, 0, 0)
    : new Date(year, month, 1, 0, 0, 0, 0);
  const toDate = granularity === "yearly"
    ? new Date(year + 1, 0, 1, 0, 0, 0, 0)
    : new Date(year, month + 1, 1, 0, 0, 0, 0);

  const scopedEvents = await prisma.event.findMany({
    where: {
      studioId,
      eventDate: {
        gte: fromDate,
        lt: toDate,
      },
    },
    include: {
      _count: {
        select: {
          guests: true,
          media: true,
        },
      },
    },
  });

  const totals = scopedEvents.reduce(
    (acc, event) => {
      acc.totalEvents += 1;
      acc.totalGuests += event._count.guests;
      acc.totalMedia += event._count.media;
      return acc;
    },
    { totalEvents: 0, totalGuests: 0, totalMedia: 0 }
  );

  const statusSegmentsBase = {
    DRAFT: 0,
    SCHEDULED: 0,
    LIVE: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    ARCHIVED: 0,
  };

  for (const event of scopedEvents) {
    statusSegmentsBase[event.status] += 1;
  }

  const statusSegments = [
    { label: "Completed", value: statusSegmentsBase.COMPLETED, color: "#1f6f7f" },
    { label: "Scheduled", value: statusSegmentsBase.SCHEDULED, color: "#5ba8b8" },
    { label: "Live", value: statusSegmentsBase.LIVE, color: "#a0365c" },
    { label: "Draft", value: statusSegmentsBase.DRAFT, color: "#c28099" },
    { label: "Cancelled", value: statusSegmentsBase.CANCELLED, color: "#7a1a53" },
    { label: "Archived", value: statusSegmentsBase.ARCHIVED, color: "#8c7a84" },
  ].filter((segment) => segment.value > 0);

  const barData =
    granularity === "yearly"
      ? (() => {
          const buckets = Array.from({ length: 12 }, (_, monthIndex) => ({
            label: monthLabel(monthIndex),
            count: 0,
          }));

          for (const event of scopedEvents) {
            buckets[event.eventDate.getMonth()].count += 1;
          }

          return buckets;
        })()
      : (() => {
          const lastDay = new Date(year, month + 1, 0).getDate();
          const weekBuckets = [
            { label: "Week 1", count: 0 },
            { label: "Week 2", count: 0 },
            { label: "Week 3", count: 0 },
            { label: "Week 4", count: 0 },
          ];

          for (const event of scopedEvents) {
            const day = event.eventDate.getDate();
            if (day <= 7) weekBuckets[0].count += 1;
            else if (day <= 14) weekBuckets[1].count += 1;
            else if (day <= 21) weekBuckets[2].count += 1;
            else if (day <= lastDay) weekBuckets[3].count += 1;
          }

          return weekBuckets;
        })();

  return {
    availableYears,
    allTimeCounts: {
      total: totalAll,
      completed: statusCount.COMPLETED,
      active: statusCount.SCHEDULED + statusCount.LIVE,
      closed: statusCount.CANCELLED + statusCount.ARCHIVED,
    },
    totals,
    barData,
    statusSegments,
  };
}

async function getAnniversaryInsights(
  studioId: string,
  params: {
    search?: string;
    range: AnniversaryRangeFilter;
    milestone: AnniversaryMilestoneFilter;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    pageSize: number;
  }
) {
  const completedEvents = await prisma.event.findMany({
    where: {
      studioId,
      status: "COMPLETED",
    },
    select: {
      id: true,
      title: true,
      brideName: true,
      groomName: true,
      eventDate: true,
      location: true,
    },
  });

  const now = new Date();

  const baseList = completedEvents
    .map((event) => {
      const weddingDate = new Date(event.eventDate);
      const nextAnniversary = getNextAnniversary(weddingDate, now);
      const daysUntil = Math.ceil((nextAnniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const years = nextAnniversary.getFullYear() - weddingDate.getFullYear();

      return {
        id: event.id,
        eventTitle: event.title,
        couple: coupleLabel(event),
        weddingDate,
        nextAnniversary,
        daysUntil,
        years,
        location: event.location,
      };
    })
    .filter((item) => item.years >= 1 && item.daysUntil >= 0)
    .sort((a, b) => a.nextAnniversary.getTime() - b.nextAnniversary.getTime());

  const cards = {
    next7: baseList.filter((item) => item.daysUntil <= 7).length,
    next30: baseList.filter((item) => item.daysUntil <= 30).length,
    next90: baseList.filter((item) => item.daysUntil <= 90).length,
    next180: baseList.filter((item) => item.daysUntil <= 180).length,
  };

  const maxDays = params.range === "all"
    ? Number.POSITIVE_INFINITY
    : params.range === "next-7"
      ? 7
      : params.range === "next-30"
        ? 30
        : params.range === "next-90"
          ? 90
          : params.range === "next-365"
            ? 365
            : Number.POSITIVE_INFINITY;

  const query = params.search?.trim().toLowerCase() ?? "";

  const filtered = baseList.filter((item) => {
    const searchable = `${item.couple} ${item.eventTitle} ${item.location ?? ""}`.toLowerCase();
    const matchesSearch = query.length === 0 || searchable.includes(query);

    const matchesRange = params.range === "custom"
      ? (() => {
          const from = params.dateFrom?.trim() ?? "";
          const to = params.dateTo?.trim() ?? "";
          const at = item.nextAnniversary;

          if (!from && !to) return true;

          const fromBoundary = from ? parseDateBoundary(from, false) : undefined;
          const toBoundary = to ? parseDateBoundary(to, true) : undefined;
          if (fromBoundary && at < fromBoundary) return false;
          if (toBoundary && at >= toBoundary) return false;
          return true;
        })()
      : item.daysUntil <= maxDays;

    const matchesMilestone = params.milestone === "all" || item.years === Number(params.milestone);

    return matchesSearch && matchesRange && matchesMilestone;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));
  const page = Math.min(params.page, totalPages);
  const skip = (page - 1) * params.pageSize;
  const paginated = filtered.slice(skip, skip + params.pageSize);

  return {
    cards,
    items: paginated.map((item) => ({
      ...item,
      weddingDate: item.weddingDate.toISOString(),
      nextAnniversary: item.nextAnniversary.toISOString(),
    })),
    pagination: {
      page,
      pageSize: params.pageSize,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    },
  };
}

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const parsedMode = modeSchema.safeParse({
    mode: request.nextUrl.searchParams.get("mode") ?? "general",
  });

  if (!parsedMode.success) {
    return badRequestResponse("Invalid insights mode");
  }

  const { mode } = parsedMode.data;

  if (mode === "general") {
    const parsed = generalQuerySchema.safeParse({
      year: request.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()),
      granularity: request.nextUrl.searchParams.get("granularity") ?? "yearly",
      month: request.nextUrl.searchParams.get("month") ?? String(new Date().getMonth()),
    });

    if (!parsed.success) {
      return badRequestResponse("Invalid general insights query");
    }

    const payload = await getGeneralInsights(
      session.studioId,
      parsed.data.year,
      parsed.data.granularity,
      parsed.data.month
    );

    return NextResponse.json(payload);
  }

  const parsed = anniversaryQuerySchema.safeParse({
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    range: request.nextUrl.searchParams.get("range") ?? "all",
    milestone: request.nextUrl.searchParams.get("milestone") ?? "all",
    dateFrom: request.nextUrl.searchParams.get("dateFrom") ?? undefined,
    dateTo: request.nextUrl.searchParams.get("dateTo") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  });

  if (!parsed.success) {
    return badRequestResponse("Invalid anniversary insights query");
  }

  const payload = await getAnniversaryInsights(session.studioId, parsed.data);
  return NextResponse.json(payload);
}
