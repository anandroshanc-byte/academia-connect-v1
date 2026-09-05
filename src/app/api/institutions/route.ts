import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const institutions = await prisma.institutionProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    select: { id: true, institutionName: true },
    orderBy: { institutionName: "asc" }
  });
  return NextResponse.json(institutions);
}
