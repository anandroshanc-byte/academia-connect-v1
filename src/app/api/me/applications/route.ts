import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  let user;
  try {
    user = await requireRole("STUDENT");
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json([]);

  const applications = await prisma.application.findMany({
    where: { studentId: profile.id },
    include: { opportunity: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}
