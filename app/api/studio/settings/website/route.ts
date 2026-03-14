import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const facilitySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  active: z.boolean(),
});

const packageSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  price: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  facilities: z.array(facilitySchema),
});

const featuredEventSchema = z.object({
  id: z.number().int().positive(),
  eventId: z.string().min(1).nullable().optional(),
  photo: z.string(),
  coupleName: z.string(),
  place: z.string(),
  date: z.string(),
});

const websiteSettingsSchema = z.object({
  featuredEvents: z.array(featuredEventSchema).length(3),
  packages: z.array(packageSchema),
  gallery: z.array(z.string()),
});

function createDefaultFeaturedEvents() {
  return [
    { id: 1, eventId: null, photo: "", coupleName: "", place: "", date: "" },
    { id: 2, eventId: null, photo: "", coupleName: "", place: "", date: "" },
    { id: 3, eventId: null, photo: "", coupleName: "", place: "", date: "" },
  ];
}

function createDefaultPackages() {
  return [
    {
      id: "default-package",
      name: "",
      price: "",
      description: "",
      isActive: true,
      facilities: [],
    },
  ];
}

function createDefaultSettings() {
  return {
    featuredEvents: createDefaultFeaturedEvents(),
    packages: createDefaultPackages(),
    gallery: [] as string[],
  };
}

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const rows = await prisma.$queryRawUnsafe<Array<{
    featuredEvents: unknown;
    packages: unknown;
    gallery: unknown;
  }>>(
    'SELECT "featuredEvents", "packages", "gallery" FROM "StudioWebsiteSettings" WHERE "studioId" = $1 LIMIT 1',
    session.studioId
  );

  const settings = rows[0] ?? null;

  if (!settings) {
    return NextResponse.json(createDefaultSettings());
  }

  const parsed = websiteSettingsSchema.safeParse({
    featuredEvents: settings.featuredEvents,
    packages: settings.packages,
    gallery: settings.gallery,
  });

  if (!parsed.success) {
    return NextResponse.json(createDefaultSettings());
  }

  return NextResponse.json(parsed.data);
}

export async function PUT(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = websiteSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return badRequestResponse("Invalid website settings payload");
  }

  const featuredEventsJson = JSON.stringify(parsed.data.featuredEvents);
  const packagesJson = JSON.stringify(parsed.data.packages);
  const galleryJson = JSON.stringify(parsed.data.gallery);

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "StudioWebsiteSettings" (
        "id",
        "studioId",
        "featuredEvents",
        "packages",
        "gallery",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, NOW(), NOW())
      ON CONFLICT ("studioId")
      DO UPDATE SET
        "featuredEvents" = EXCLUDED."featuredEvents",
        "packages" = EXCLUDED."packages",
        "gallery" = EXCLUDED."gallery",
        "updatedAt" = NOW()
    `,
    randomUUID(),
    session.studioId,
    featuredEventsJson,
    packagesJson,
    galleryJson
  );

  return NextResponse.json(parsed.data);
}
