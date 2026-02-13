import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const test = await prisma.test.create({
    data: {
      name: "Tiri works 🚀",
    },
  });

  return NextResponse.json(test);
}
