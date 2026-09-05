import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const institutions = await prisma.institutionProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    select: { id: true, institutionName: true },
    orderBy: { institutionName: "asc" }
  });
  return NextResponse.json(institutions);
}
