import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedRole } from "@/lib/session";
import { rankApplicantsForOpportunity } from "@/lib/matching/adapter";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

  const ranked = await rankApplicantsForOpportunity(params.id);
  return NextResponse.json(ranked);
}
