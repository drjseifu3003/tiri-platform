import { badRequestResponse, requireStudioSession } from "@/lib/api-auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateAccountSchema = z.object({
  phone: z.string().trim().min(3).optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
  studioName: z.string().trim().min(2).optional(),
  studioEmail: z.string().email().nullable().optional(),
  studioPhone: z.string().trim().min(3).optional(),
  studioLogoUrl: z.string().url().nullable().optional(),
  studioPrimaryColor: z.string().trim().min(2).nullable().optional(),
});

export async function GET(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      phone: true,
      role: true,
      studio: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          logoUrl: true,
          primaryColor: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
    },
    studio: user.studio,
  });
}

export async function PATCH(request: NextRequest) {
  const session = requireStudioSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse("Invalid account settings payload");
  }

  const data = parsed.data;

  if (data.newPassword && !data.currentPassword) {
    return badRequestResponse("Current password is required to set a new password");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      phone: true,
      password: true,
      role: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userUpdateData: {
    phone?: string;
    password?: string;
  } = {};

  if (data.phone && data.phone !== currentUser.phone) {
    userUpdateData.phone = data.phone;
  }

  if (data.newPassword) {
    const valid = await verifyPassword(data.currentPassword!, currentUser.password);
    if (!valid) {
      return badRequestResponse("Current password is incorrect");
    }

    userUpdateData.password = await hashPassword(data.newPassword);
  }

  const shouldUpdateStudio =
    data.studioName !== undefined ||
    data.studioEmail !== undefined ||
    data.studioPhone !== undefined ||
    data.studioLogoUrl !== undefined ||
    data.studioPrimaryColor !== undefined;

  if (shouldUpdateStudio && currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.userId },
        data: userUpdateData,
      });
    }

    if (shouldUpdateStudio) {
      await prisma.studio.update({
        where: { id: session.studioId },
        data: {
          name: data.studioName,
          email: data.studioEmail === undefined ? undefined : data.studioEmail,
          phone: data.studioPhone,
          logoUrl: data.studioLogoUrl === undefined ? undefined : data.studioLogoUrl,
          primaryColor: data.studioPrimaryColor === undefined ? undefined : data.studioPrimaryColor,
        },
      });
    }
  } catch {
    return badRequestResponse("Unable to update account settings");
  }

  const updated = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      phone: true,
      role: true,
      studio: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          logoUrl: true,
          primaryColor: true,
        },
      },
    },
  });

  return NextResponse.json({
    user: {
      id: updated!.id,
      phone: updated!.phone,
      role: updated!.role,
    },
    studio: updated!.studio,
  });
}
