import { StudentProfile, Opportunity, SkillMatchDetail, RequirementType } from "./types";

const REQUIREMENT_TYPE_MULTIPLIER: Record<RequirementType, number> = {
  [RequirementType.Mandatory]: 1.5,
  [RequirementType.Preferred]: 1.0,
  [RequirementType.Bonus]: 0.5,
};

// A missing Mandatory skill doesn't fail eligibility (that's an academic/profile
// gate, not a skill gate) — but it must cap how high compatibility can score, so
// it never quietly disappears into a decent-looking aggregate number.
export const MANDATORY_GAP_SCORE_CAP = 55;

function verificationTrust(level: number): number {
  // Self-declared counts less than verified evidence, but an unverified skill
  // still counts — this is a modifier (0.7-1.0), not a gate.
  return 0.7 + 0.1 * (level - 1);
}

export function evaluateSkills(
  student: StudentProfile,
  opportunity: Opportunity
): { details: SkillMatchDetail[]; rawScore: number; maxScore: number; hasMandatoryGap: boolean } {
  const details: SkillMatchDetail[] = [];
  let rawScore = 0;
  let maxScore = 0;
  let hasMandatoryGap = false;

  for (const req of opportunity.skillRequirements) {
    const studentSkill = student.skills.find((s) => s.skillId === req.skillId);
    const multiplier = REQUIREMENT_TYPE_MULTIPLIER[req.type];
    const weightedMax = req.weight * multiplier;
    maxScore += weightedMax;

    if (!studentSkill) {
      details.push({
        skillId: req.skillId,
        status: "missing",
        requiredProficiency: req.requiredProficiency,
        studentProficiency: null,
        requirementType: req.type,
        weight: req.weight,
      });
      if (req.type === RequirementType.Mandatory) hasMandatoryGap = true;
      continue;
    }

    const proficiencyRatio = Math.min(studentSkill.proficiency / req.requiredProficiency, 1);
    const trust = verificationTrust(studentSkill.verification);
    rawScore += weightedMax * proficiencyRatio * trust;

    const status = studentSkill.proficiency >= req.requiredProficiency ? "matched" : "weak";
    if (status === "weak" && req.type === RequirementType.Mandatory) hasMandatoryGap = true;

    details.push({
      skillId: req.skillId,
      status,
      requiredProficiency: req.requiredProficiency,
      studentProficiency: studentSkill.proficiency,
      requirementType: req.type,
      weight: req.weight,
    });
  }

  return { details, rawScore, maxScore, hasMandatoryGap };
}

export function scoreCareerAlignment(student: StudentProfile, opportunity: Opportunity): number {
  if (!opportunity.careerPathId) return 0;
  return student.careerInterests.includes(opportunity.careerPathId) ? 5 : 0;
}

export function scoreExperienceOverlap(student: StudentProfile, opportunity: Opportunity): number {
  const requiredIds = new Set(opportunity.skillRequirements.map((r) => r.skillId));
  const demonstrated = new Set([...student.projectSkillIds, ...student.experienceSkillIds]);
  let overlap = 0;
  requiredIds.forEach((id) => {
    if (demonstrated.has(id)) overlap += 1;
  });
  return Math.min(overlap * 2, 10); // small bonus, capped so it can't dominate the score
}
