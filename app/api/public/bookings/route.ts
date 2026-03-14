import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_METHODS = "POST, OPTIONS";
const ALLOWED_HEADERS = "Content-Type";

function resolveAllowedOrigin(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin) return "*";

  const configuredOrigins = process.env.PUBLIC_BOOKINGS_CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!configuredOrigins || configuredOrigins.length === 0) {
    return "*";
  }

  return configuredOrigins.includes(requestOrigin) ? requestOrigin : null;
}

function withCors(request: NextRequest, response: NextResponse) {
  const allowedOrigin = resolveAllowedOrigin(request);
  if (!allowedOrigin) return response;

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  response.headers.set("Vary", "Origin");
  return response;
}

const createBookingSchema = z.object({
  name: z.string().trim().min(2, "Please provide your name."),
  phone: z
    .string()
    .trim()
    .min(7, "Please provide a valid phone number.")
    .refine((value) => value.replace(/\D/g, "").length >= 9, "Please provide a valid phone number."),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weddingPlace: z.string().trim().min(2, "Please provide the wedding place."),
});

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export async function OPTIONS(request: NextRequest) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid booking payload.";
    return withCors(request, NextResponse.json({ error: message }, { status: 400 }));
  }

  const bookingDate = parseDateOnly(parsed.data.weddingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate.getTime() < today.getTime()) {
    return withCors(request, NextResponse.json({ error: "Wedding date must be today or later." }, { status: 400 }));
  }

  const booking = await prisma.bookingRequest.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      weddingDate: bookingDate,
      weddingPlace: parsed.data.weddingPlace,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      weddingDate: true,
      weddingPlace: true,
      createdAt: true,
    },
  });

  return withCors(request, NextResponse.json({ booking }, { status: 201 }));
}