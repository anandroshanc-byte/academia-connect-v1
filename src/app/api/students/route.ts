import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedRole } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  let user;
  try {
    user = await requireVerifiedRole("INSTITUTION");
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }

  const institution = await prisma.institutionProfile.findUnique({ where: { userId: user.id } });
  if (!institution) return NextResponse.json([]);

  const students = await prisma.studentProfile.findMany({
    where: { institutionId: institution.id },
    include: { skills: true, user: { select: { name: true, email: true } }, applications: { select: { id: true, status: true, opportunityId: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}
