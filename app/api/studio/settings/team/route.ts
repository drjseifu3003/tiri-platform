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

function normalizePhone(value: string) {
  return value.trim();
}

type TeamMember = {
  id: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  teamRole: string;
  createdAt: Date;
  updatedAt: Date;
};

async function hasTeamRoleColumn() {
  const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = 'teamRole'
    ) AS "exists"
  `;

  return result[0]?.exists ?? false;
}

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const teamRoleColumnExists = await hasTeamRoleColumn();
  const members = teamRoleColumnExists
    ? await prisma.$queryRaw<TeamMember[]>`
        SELECT "id", "phone", "role", "teamRole", "createdAt", "updatedAt"
        FROM "User"
        WHERE "studioId" = ${session.studioId}
        ORDER BY "createdAt" DESC
      `
    : await prisma.$queryRaw<TeamMember[]>`
        SELECT "id", "phone", "role", 'EVENT_PLANNER'::text AS "teamRole", "createdAt", "updatedAt"
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

  const normalizedPhone = normalizePhone(parsed.data.phone);

  const existing = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
    select: { id: true },
  });

  if (existing) {
    return badRequestResponse("Phone is already in use");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const userId = crypto.randomUUID();

  const teamRoleColumnExists = await hasTeamRoleColumn();

  if (teamRoleColumnExists) {
    await prisma.$executeRaw`
      INSERT INTO "User" ("id", "phone", "password", "role", "studioId", "teamRole", "createdAt", "updatedAt")
      VALUES (${userId}, ${normalizedPhone}, ${passwordHash}, 'STAFF', ${session.studioId}, ${parsed.data.teamRole}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "User" ("id", "phone", "password", "role", "studioId", "createdAt", "updatedAt")
      VALUES (${userId}, ${normalizedPhone}, ${passwordHash}, 'STAFF', ${session.studioId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
  }

  const members = teamRoleColumnExists
    ? await prisma.$queryRaw<TeamMember[]>`
        SELECT "id", "phone", "role", "teamRole", "createdAt", "updatedAt"
        FROM "User"
        WHERE "studioId" = ${session.studioId}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `
    : await prisma.$queryRaw<TeamMember[]>`
        SELECT "id", "phone", "role", 'EVENT_PLANNER'::text AS "teamRole", "createdAt", "updatedAt"
        FROM "User"
        WHERE "studioId" = ${session.studioId}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;

  return NextResponse.json({ member: members[0] }, { status: 201 });
}
