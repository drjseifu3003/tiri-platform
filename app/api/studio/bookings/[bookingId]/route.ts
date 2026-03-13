import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

const bookingActionSchema = z.object({
  action: z.enum(["cancel", "accept"]),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

async function createUniqueEventSlug(base: string) {
  const fallback = `booking-${Date.now()}`;
  const safeBase = slugify(base) || fallback;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8);
    const candidate = `${safeBase}-${suffix}`;
    const existing = await prisma.event.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;
  }

  return `${safeBase}-${Date.now()}`;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { bookingId } = await context.params;
  if (!bookingId) {
    return badRequestResponse("Missing booking ID");
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingActionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse("Invalid booking action payload");
  }

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      name: true,
      phone: true,
      weddingDate: true,
      weddingPlace: true,
      status: true,
      handledEventId: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking request not found" }, { status: 404 });
  }

  if (parsed.data.action === "cancel") {
    if (booking.status === "HANDLED") {
      return NextResponse.json({ error: "Handled bookings cannot be cancelled." }, { status: 409 });
    }

    const updatedBooking = await prisma.bookingRequest.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json({ booking: updatedBooking });
  }

  if (booking.status === "HANDLED") {
    return NextResponse.json({ error: "This booking has already been handled." }, { status: 409 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Cancelled bookings cannot be converted to events." }, { status: 409 });
  }

  const slug = await createUniqueEventSlug(booking.name);
  const eventTitle = `${booking.name} Wedding`;

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        studioId: session.studioId,
        title: eventTitle,
        brideName: booking.name,
        bridePhone: booking.phone,
        groomPhone: booking.phone,
        eventDate: booking.weddingDate,
        location: booking.weddingPlace,
        googleMapAddress: booking.weddingPlace,
        slug,
        status: "DRAFT",
        isPublished: false,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const updatedBooking = await tx.bookingRequest.update({
      where: { id: booking.id },
      data: {
        status: "HANDLED",
        handledEventId: event.id,
      },
      select: {
        id: true,
        status: true,
        handledEventId: true,
      },
    });

    return { event, booking: updatedBooking };
  });

  return NextResponse.json(result);
}
