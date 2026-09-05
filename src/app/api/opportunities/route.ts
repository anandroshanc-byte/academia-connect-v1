import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireVerifiedRole, getCurrentUser } from "@/lib/session";
import { rankOpportunitiesForStudent } from "@/lib/matching/adapter";
import { rateLimit } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";

export const dynamic = 'force-dynamic';

const skillReqSchema = z.object({
  skillId: z.string().min(1),
  requiredProficiency: z.number().int().min(1).max(4),
  weight: z.number().int().min(1).max(10),
  type: z.enum(["Mandatory", "Preferred", "Bonus"]),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  type: z.enum(["INTERNSHIP","ENTRY_JOB","LIVE_PROJECT","APPRENTICESHIP","TRAINING"]).default("INTERNSHIP"),
  duration: z.string().max(120).optional(),
  stipend: z.string().max(120).optional(),
  deadline: z.string().datetime().optional(),
  description: z.string().max(5000).optional(),
  careerPathId: z.string().optional(),
  degrees: z.array(z.string()).optional(),
  minYear: z.number().int().optional(),
  maxYear: z.number().int().optional(),
  minCgpa: z.number().optional(),
  location: z.string().optional(),
  remoteAllowed: z.boolean().default(false),
  skillRequirements: z.array(skillReqSchema).default([]),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (user.role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
    const ranked = await rankOpportunitiesForStudent(profile.id);
    return NextResponse.json(ranked);
  }

  if (user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return NextResponse.json([], { status: 200 });
    const opportunities = await prisma.opportunity.findMany({
      where: { companyId: company.id },
      include: { skillRequirements: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(opportunities);
  }

  // Institution admins can browse everything open, no scoring context.
  const opportunities = await prisma.opportunity.findMany({
    where: { status: "open", approvalStatus: "APPROVED", company: { verificationStatus: "VERIFIED" } },
    include: { skillRequirements: true, company: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(opportunities);
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`opportunity-create:${req.headers.get("x-forwarded-for") || "unknown"}`, 20, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  let user;
  try {
    user = await requireVerifiedRole("COMPANY");
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
  if (!company) return NextResponse.json({ error: "Company profile not found" }, { status: 404 });

  const opportunity = await prisma.opportunity.create({
    data: {
      companyId: company.id,
      title: data.title,
      role: data.role,
      type: data.type,
      duration: data.duration,
      stipend: data.stipend,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      description: data.description,
      careerPathId: data.careerPathId,
      degrees: data.degrees && data.degrees.length > 0 ? JSON.stringify(data.degrees) : null,
      minYear: data.minYear,
      maxYear: data.maxYear,
      minCgpa: data.minCgpa,
      location: data.location,
      remoteAllowed: data.remoteAllowed,
      approvalStatus: "PENDING",
      skillRequirements: {
        create: data.skillRequirements.map((r) => ({
          skillId: r.skillId,
          requiredProficiency: r.requiredProficiency,
          weight: r.weight,
          type: r.type,
        })),
      },
    },
    include: { skillRequirements: true },
  });

  await createNotification({ userId: user.id, type: "OPPORTUNITY_SUBMITTED", title: "Opportunity submitted", message: `${opportunity.title} is pending admin approval.`, href: `/company/opportunities/${opportunity.id}` });
  return NextResponse.json(opportunity, { status: 201 });
}
