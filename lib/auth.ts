import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-constants";

type AuthTokenPayload = JwtPayload & {
  sub: string;
  studioId: string;
  role: "ADMIN" | "STAFF";
  phone: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(payload: {
  userId: string;
  studioId: string;
  role: "ADMIN" | "STAFF";
  phone: string;
}) {
  return jwt.sign(
    {
      studioId: payload.studioId,
      role: payload.role,
      phone: payload.phone,
    },
    getJwtSecret(),
    {
      subject: payload.userId,
      expiresIn: SESSION_MAX_AGE_SECONDS,
    }
  );
}

export function verifySessionToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded !== "object" || !decoded) {
    throw new Error("Invalid token payload.");
  }

  const tokenPayload = decoded as AuthTokenPayload;
  if (!tokenPayload.sub || !tokenPayload.studioId || !tokenPayload.role) {
    throw new Error("Token payload missing required fields.");
  }

  return tokenPayload;
}

export type StudioSession = {
  userId: string;
  studioId: string;
  role: "ADMIN" | "STAFF";
  phone: string;
};

export function getSessionFromRequest(request: NextRequest): StudioSession {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    throw new Error("Missing session token.");
  }

  const payload = verifySessionToken(token);

  return {
    userId: payload.sub,
    studioId: payload.studioId,
    role: payload.role,
    phone: payload.phone,
  };
}
