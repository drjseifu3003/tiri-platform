import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
  verifyPassword,
} from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  phone: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { phone: parsed.data.phone },
    select: {
      id: true,
      phone: true,
      password: true,
      role: true,
      studioId: true,
      studio: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const passwordValid = await verifyPassword(parsed.data.password, user.password);
  if (!passwordValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createSessionToken({
    userId: user.id,
    studioId: user.studioId,
    role: user.role,
    phone: user.phone,
  });

  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        studioId: user.studioId,
      },
      studio: user.studio,
    },
    { status: 200 }
  );

  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  return response;
}
