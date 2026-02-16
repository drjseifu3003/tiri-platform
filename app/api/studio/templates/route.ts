import {
  badRequestResponse,
  requireAdmin,
  requireStudioSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { TemplateCategory } from "@/lib/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.enum(TemplateCategory),
  previewImage: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "true";

  const templates = await prisma.template.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      _count: {
        select: {
          events: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const body = await request.json().catch(() => null);
  const parsed = createTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequestResponse("Invalid template payload");
  }

  const template = await prisma.template.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      category: parsed.data.category,
      previewImage: parsed.data.previewImage,
      isActive: parsed.data.isActive ?? true,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
