import { openApiDocument } from "@/lib/openapi";
import { buildPostmanCollection } from "@/lib/postman";
import { NextResponse } from "next/server";

export async function GET() {
  const collection = buildPostmanCollection(openApiDocument);

  return NextResponse.json(collection, {
    headers: {
      "Content-Disposition": "attachment; filename=tiri-api.postman_collection.json",
    },
  });
}
