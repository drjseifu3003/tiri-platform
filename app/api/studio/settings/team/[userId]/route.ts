import { badRequestResponse, notFoundResponse, requireAdmin, requireStudioSession } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const teamRoleValues = ["EDITOR", "CUSTOMER_SERVICE", "EVENT_PLANNER", "PHOTO_CREW"] as const;

const updateTeamMemberSchema = z.object({
  phone: z.string().trim().min(3).optional(),
  teamRole: z.enum(teamRoleValues).optional(),
  password: z.string().min(6).optional(),
});

type RouteContext = {
  params: Promise<{ userId: string }>;
};

type TeamMemberRecord = {
  id: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  studioId: string;
  teamRole: string;
};

async function findStudioTeamMember(studioId: string, userId: string) {
  const rows = await prisma.$queryRaw<TeamMemberRecord[]>`
    SELECT "id", "phone", "role", "studioId", "teamRole"
    FROM "User"
    WHERE "id" = ${userId} AND "studioId" = ${studioId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const { userId } = await context.params;
  const member = await findStudioTeamMember(session.studioId, userId);
  if (!member) return notFoundResponse("Team member not found");

  const body = await request.json().catch(() => null);
  const parsed = updateTeamMemberSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse("Invalid team member payload");

  const nextPhone = parsed.data.phone ?? member.phone;
  const nextTeamRole = parsed.data.teamRole ?? member.teamRole;

  if (nextPhone !== member.phone) {
    const existing = await prisma.user.findUnique({
      where: { phone: nextPhone },
      select: { id: true },
    });

    if (existing && existing.id !== member.id) {
      return badRequestResponse("Phone is already in use");
    }
  }

  const nextPasswordHash = parsed.data.password ? await hashPassword(parsed.data.password) : null;

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "phone" = ${nextPhone},
      "teamRole" = ${nextTeamRole},
      "password" = CASE WHEN ${nextPasswordHash}::text IS NULL THEN "password" ELSE ${nextPasswordHash} END,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${member.id}
  `;

  const updated = await prisma.$queryRaw<TeamMemberRecord[]>`
    SELECT "id", "phone", "role", "studioId", "teamRole"
    FROM "User"
    WHERE "id" = ${member.id}
    LIMIT 1
  `;

  return NextResponse.json({ member: updated[0] });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const { userId } = await context.params;

  if (userId === session.userId) {
    return badRequestResponse("You cannot remove your own account");
  }

  const member = await findStudioTeamMember(session.studioId, userId);
  if (!member) return notFoundResponse("Team member not found");

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
