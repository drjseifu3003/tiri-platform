import { badRequestResponse, requireAdmin, requireStudioSession } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const teamRoleValues = ["EDITOR", "CUSTOMER_SERVICE", "EVENT_PLANNER", "PHOTO_CREW"] as const;

const createTeamMemberSchema = z.object({
  phone: z.string().trim().min(3),
  password: z.string().min(6),
  teamRole: z.enum(teamRoleValues),
});

type TeamMember = {
  id: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  teamRole: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const members = await prisma.$queryRaw<TeamMember[]>`
    SELECT "id", "phone", "role", "teamRole", "createdAt", "updatedAt"
    FROM "User"
    WHERE "studioId" = ${session.studioId}
    ORDER BY "createdAt" DESC
  `;

  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const body = await request.json().catch(() => null);
  const parsed = createTeamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse("Invalid team member payload");
  }

  const existing = await prisma.user.findUnique({
    where: { phone: parsed.data.phone },
    select: { id: true },
  });

  if (existing) {
    return badRequestResponse("Phone is already in use");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const userId = crypto.randomUUID();

  await prisma.$executeRaw`
    INSERT INTO "User" ("id", "phone", "password", "role", "studioId", "teamRole", "createdAt", "updatedAt")
    VALUES (${userId}, ${parsed.data.phone}, ${passwordHash}, 'STAFF', ${session.studioId}, ${parsed.data.teamRole}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  const members = await prisma.$queryRaw<TeamMember[]>`
    SELECT "id", "phone", "role", "teamRole", "createdAt", "updatedAt"
    FROM "User"
    WHERE "studioId" = ${session.studioId}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;

  return NextResponse.json({ member: members[0] }, { status: 201 });
}
