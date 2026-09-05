import { prisma } from "@/lib/prisma";
import {
  StudentProfile as EngineStudent,
  Opportunity as EngineOpportunity,
  RequirementType,
} from "./types";
import { matchStudentToOpportunity } from "./matchingEngine";
import type { MatchResult } from "./types";

// ---- Prisma row -> engine plain-object mapping -----------------------
// The matching engine intentionally takes no DB/ORM types (see prototype
// README). This file is the only place that knows about Prisma shapes.

function safeJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type DbStudent = NonNullable<
  Awaited<ReturnType<typeof loadStudentById>>
>;

export async function loadStudentById(studentId: string) {
  return prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { skills: true },
  });
}

export function toEngineStudent(student: {
  id: string;
  name?: string;
  degreeType?: string;
  degree: string;
  year: number;
  cgpa: number | null;
  location: string | null;
  careerInterests: string;
  projectSkillIds: string;
  experienceSkillIds: string;
  skills: { skillId: string; proficiency: number; verification: number }[];
}): EngineStudent {
  return {
    id: student.id,
    name: student.name ?? "",
    degree: student.degreeType ?? student.degree,
    year: student.year,
    cgpa: student.cgpa ?? undefined,
    location: student.location ?? undefined,
    skills: student.skills.map((s) => ({
      skillId: s.skillId,
      proficiency: s.proficiency,
      verification: s.verification,
    })),
    careerInterests: safeJsonArray(student.careerInterests),
    projectSkillIds: safeJsonArray(student.projectSkillIds),
    experienceSkillIds: safeJsonArray(student.experienceSkillIds),
  };
}

export function toEngineOpportunity(opp: {
  id: string;
  title: string;
  role: string;
  careerPathId: string | null;
  degrees: string | null;
  minYear: number | null;
  maxYear: number | null;
  minCgpa: number | null;
  location: string | null;
  remoteAllowed: boolean;
  skillRequirements: {
    skillId: string;
    requiredProficiency: number;
    weight: number;
    type: string;
  }[];
}): EngineOpportunity {
  return {
    id: opp.id,
    title: opp.title,
    role: opp.role,
    careerPathId: opp.careerPathId ?? undefined,
    eligibility: {
      degrees: opp.degrees ? safeJsonArray(opp.degrees) : undefined,
      minYear: opp.minYear ?? undefined,
      maxYear: opp.maxYear ?? undefined,
      minCgpa: opp.minCgpa ?? undefined,
      location: opp.location ?? undefined,
      remoteAllowed: opp.remoteAllowed,
    },
    skillRequirements: opp.skillRequirements.map((r) => ({
      skillId: r.skillId,
      requiredProficiency: r.requiredProficiency,
      weight: r.weight,
      type: r.type as RequirementType,
    })),
  };
}

// ---- High-level operations used by API routes ------------------------

export async function rankOpportunitiesForStudent(studentId: string): Promise<
  (MatchResult & { opportunity: Awaited<ReturnType<typeof prisma.opportunity.findMany>>[number] })[]
> {
  const studentRow = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { skills: true },
  });
  if (!studentRow) return [];

  const opportunities = await prisma.opportunity.findMany({
    where: { status: "open", approvalStatus: "APPROVED", company: { verificationStatus: "VERIFIED" } },
    include: { skillRequirements: true, company: true },
    orderBy: { createdAt: "desc" },
  });

  const engineStudent = toEngineStudent(studentRow);

  const results = opportunities.map((opp) => {
    const engineOpp = toEngineOpportunity(opp);
    const result = matchStudentToOpportunity(engineStudent, engineOpp);
    return { ...result, opportunity: opp };
  });

  // Eligible + higher score first; ineligible pushed to the bottom.
  results.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return b.compatibilityScore - a.compatibilityScore;
  });

  return results;
}

export async function rankApplicantsForOpportunity(opportunityId: string): Promise<
  (MatchResult & { student: DbStudent & { user: { name: string; email: string } } })[]
> {
  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: { skillRequirements: true },
  });
  if (!opp) return [];

  const applications = await prisma.application.findMany({
    where: { opportunityId },
    include: { student: { include: { skills: true, user: { select: { name: true, email: true } } } } },
  });

  const engineOpp = toEngineOpportunity(opp);

  const results = applications.map((app) => {
    const engineStudent = toEngineStudent(app.student);
    const result = matchStudentToOpportunity(engineStudent, engineOpp);
    return { ...result, student: app.student, applicationId: app.id, applicationStatus: app.status };
  });

  results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return results as any;
}

export async function scoreStudentForOpportunity(studentId: string, opportunityId: string) {
  const [studentRow, opp] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { id: studentId }, include: { skills: true } }),
    prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { skillRequirements: true },
    }),
  ]);
  if (!studentRow || !opp) return null;
  return matchStudentToOpportunity(toEngineStudent(studentRow), toEngineOpportunity(opp));
}
