import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireVerifiedRole } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

export const dynamic = 'force-dynamic';

const schema = z.object({
  skillId: z.string().min(1),
});

// Institution admins can bump a self-declared/assessed skill up to
// "institution-verified" (level 3) for students belonging to their own
// institution. They cannot grant "industry-verified" (level 4) — that's
// reserved for companies confirming a skill through real work, which this
// MVP doesn't wire up yet (see README "Not built yet").
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireVerifiedRole("INSTITUTION");
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }

  const institution = await prisma.institutionProfile.findUnique({ where: { userId: user.id } });
  if (!institution) return NextResponse.json({ error: "Institution profile not found" }, { status: 404 });

  const student = await prisma.studentProfile.findUnique({ where: { id: params.id } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  if (student.institutionId !== institution.id) {
    return NextResponse.json({ error: "This student is not part of your institution." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const skill = await prisma.studentSkill.findUnique({
    where: { studentId_skillId: { studentId: student.id, skillId: parsed.data.skillId } },
  });
  if (!skill) return NextResponse.json({ error: "Skill not found on student profile" }, { status: 404 });

  const updated = await prisma.studentSkill.update({
    where: { id: skill.id },
    data: { verification: Math.max(skill.verification, 3) }, // 3 = InstitutionVerified
  });
  const studentUser = await prisma.studentProfile.findUnique({ where: { id: student.id }, select: { userId: true } });
  if (studentUser) await createNotification({ userId: studentUser.userId, type: "SKILL_VERIFIED", title: "Skill verified", message: `${parsed.data.skillId} was verified by your institution.`, href: "/student/profile" });

  return NextResponse.json(updated);
}
