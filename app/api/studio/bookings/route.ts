import { requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().trim().optional(),
  filter: z.enum(["all", "new", "handled", "cancelled"]).default("all"),
});

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const parsedQuery = listBookingsQuerySchema.safeParse({
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "12",
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    filter: request.nextUrl.searchParams.get("filter") ?? "all",
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid booking query params" }, { status: 400 });
  }

  const { page, pageSize, search, filter } = parsedQuery.data;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { weddingPlace: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filter === "new"
      ? { status: "NEW" as const }
      : filter === "handled"
        ? { status: "HANDLED" as const }
        : filter === "cancelled"
          ? { status: "CANCELLED" as const }
          : {}),
  };

  const [total, bookings, totalNew, totalHandled, totalCancelled] = await prisma.$transaction([
    prisma.bookingRequest.count({ where }),
    prisma.bookingRequest.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { weddingDate: "asc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        phone: true,
        weddingDate: true,
        weddingPlace: true,
        status: true,
        handledEventId: true,
        handledEvent: {
          select: {
            id: true,
            title: true,
          },
        },
        createdAt: true,
      },
    }),
    prisma.bookingRequest.count({ where: { status: "NEW" } }),
    prisma.bookingRequest.count({ where: { status: "HANDLED" } }),
    prisma.bookingRequest.count({ where: { status: "CANCELLED" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    bookings,
    stats: {
      total: totalNew + totalHandled + totalCancelled,
      new: totalNew,
      handled: totalHandled,
      cancelled: totalCancelled,
    },
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