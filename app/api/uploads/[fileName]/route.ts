import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ fileName: string }>;
};

function mimeTypeForExtension(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

function isSafeFileName(fileName: string) {
  return /^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif|svg)$/.test(fileName);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { fileName } = await context.params;

  if (!isSafeFileName(fileName)) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "uploads", fileName);

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": mimeTypeForExtension(fileName),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
