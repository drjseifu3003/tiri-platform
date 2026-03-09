import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  phone: z.string().trim().min(4),
});

function phoneCandidates(phone: string) {
  const raw = phone.trim();
  const compact = raw.replace(/[\s\-()]/g, "");
  const digits = compact.replace(/\D/g, "");

  const options = new Set<string>([raw, compact]);
  if (digits.length > 0) {
    options.add(digits);
    options.add(`+${digits}`);
  }

  return [...options].filter((value) => value.length >= 4);
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    phone: request.nextUrl.searchParams.get("phone") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid phone number." }, { status: 400 });
  }

  const candidates = phoneCandidates(parsed.data.phone);

  const phoneWhere = candidates.flatMap((candidate) => [
    { bridePhone: { contains: candidate, mode: "insensitive" as const } },
    { groomPhone: { contains: candidate, mode: "insensitive" as const } },
  ]);

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      OR: phoneWhere,
    },
    select: {
      id: true,
      title: true,
      brideName: true,
      groomName: true,
      eventDate: true,
      location: true,
      description: true,
      coverImage: true,
      status: true,
      media: {
        select: {
          id: true,
          type: true,
          url: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      },
      _count: {
        select: {
          media: true,
          guests: true,
        },
      },
    },
    orderBy: { eventDate: "desc" },
    take: 5,
  });

  return NextResponse.json({ events });
}
