import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireVerifiedRole } from "@/lib/session";
import { scoreStudentForOpportunity } from "@/lib/matching/adapter";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: { skillRequirements: true, company: true },
  });
  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isOwnerCompany = user.role === "COMPANY" && opportunity.company.userId === user.id;
  const publicApproved = opportunity.company.verificationStatus === "VERIFIED" && opportunity.approvalStatus === "APPROVED" && opportunity.status === "open";
  if (!publicApproved && !isOwnerCompany && user.role !== "ADMIN") return NextResponse.json({ error: "Opportunity unavailable" }, { status: 404 });

  let match = null;
  let alreadyApplied = false;
  if (user.role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (profile) {
      match = await scoreStudentForOpportunity(profile.id, opportunity.id);
      const existingApp = await prisma.application.findUnique({
        where: { studentId_opportunityId: { studentId: profile.id, opportunityId: opportunity.id } },
      });
      alreadyApplied = !!existingApp;
    }
  }

  return NextResponse.json({ opportunity, match, alreadyApplied });
}

const updateSchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireVerifiedRole("COMPANY");
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: { company: true },
  });
  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (opportunity.company.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.opportunity.update({
    where: { id: params.id },
    data: { status: parsed.data.status ?? opportunity.status },
  });

  return NextResponse.json(updated);
}
