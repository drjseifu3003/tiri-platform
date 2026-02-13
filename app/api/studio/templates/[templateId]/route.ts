import {
  badRequestResponse,
  notFoundResponse,
  requireAdmin,
  requireStudioSession,
} from "@/lib/api-auth";
import { TemplateCategory } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ templateId: string }>;
};

const updateTemplateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  category: z.enum(TemplateCategory).optional(),
  previewImage: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const { templateId } = await context.params;
  const template = await prisma.template.findUnique({ where: { id: templateId } });

  if (!template) return notFoundResponse("Template not found");
  return NextResponse.json({ template });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const { templateId } = await context.params;
  const existing = await prisma.template.findUnique({ where: { id: templateId } });
  if (!existing) return notFoundResponse("Template not found");

  const body = await request.json().catch(() => null);
  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse("Invalid template payload");

  const template = await prisma.template.update({
    where: { id: templateId },
    data: parsed.data,
  });

  return NextResponse.json({ template });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const { templateId } = await context.params;
  const existing = await prisma.template.findUnique({ where: { id: templateId } });
  if (!existing) return notFoundResponse("Template not found");

  await prisma.template.delete({ where: { id: templateId } });
  return NextResponse.json({ ok: true });
}
