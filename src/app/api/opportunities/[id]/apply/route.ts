import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { scoreStudentForOpportunity } from "@/lib/matching/adapter";
import { createNotification } from "@/lib/notifications";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireRole("STUDENT");
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });

  const opportunity = await prisma.opportunity.findUnique({ where: { id: params.id }, include: { company: { select: { userId: true } } } });
  if (!opportunity || opportunity.status !== "open" || opportunity.approvalStatus !== "APPROVED") {
    return NextResponse.json({ error: "Opportunity is not open" }, { status: 400 });
  }

  const match = await scoreStudentForOpportunity(profile.id, opportunity.id);
  if (!match) return NextResponse.json({ error: "Could not score match" }, { status: 500 });
  if (!match.eligible) {
    return NextResponse.json(
      { error: "You are not eligible for this opportunity.", reasons: match.eligibilityReasons },
      { status: 400 }
    );
  }

  const existing = await prisma.application.findUnique({
    where: { studentId_opportunityId: { studentId: profile.id, opportunityId: opportunity.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already applied to this opportunity." }, { status: 409 });
  }

  let application;
  try {
    application = await prisma.application.create({
      data: {
        studentId: profile.id,
        opportunityId: opportunity.id,
        score: match.compatibilityScore,
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "You already applied to this opportunity." }, { status: 409 });
    throw e;
  }

  await createNotification({
    userId: opportunity.company.userId,
    type: "APPLICATION_RECEIVED",
    title: "New application received",
    message: `${user.name} applied for ${opportunity.title}. Match score: ${match.compatibilityScore}/100.`,
    href: `/company/opportunities/${opportunity.id}`,
  });

  return NextResponse.json(application, { status: 201 });
}
