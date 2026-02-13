import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, type StudioSession } from "@/lib/auth";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function requireStudioSession(request: NextRequest): StudioSession | NextResponse {
  try {
    return getSessionFromRequest(request);
  } catch {
    return unauthorizedResponse();
  }
}

export function requireAdmin(session: StudioSession): NextResponse | null {
  if (session.role !== "ADMIN") {
    return forbiddenResponse("Admin access required");
  }
  return null;
}
