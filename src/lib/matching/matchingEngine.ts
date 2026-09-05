import { StudentProfile, Opportunity, MatchResult, RequirementType, SkillMatchDetail } from "./types";
import { checkEligibility } from "./eligibility";
import {
  evaluateSkills,
  scoreCareerAlignment,
  scoreExperienceOverlap,
  MANDATORY_GAP_SCORE_CAP,
} from "./compatibility";

const NEAR_MATCH_MIN_SCORE = 50;
const NEAR_MATCH_MAX_GAPS = 2;

export function matchStudentToOpportunity(
  student: StudentProfile,
  opportunity: Opportunity
): MatchResult {
  const eligibility = checkEligibility(student, opportunity);

  if (!eligibility.eligible) {
    return {
      studentId: student.id,
      opportunityId: opportunity.id,
      eligible: false,
      eligibilityReasons: eligibility.reasons,
      compatibilityScore: 0,
      matchedSkills: [],
      weakSkills: [],
      missingSkills: [],
      isNearMatch: false,
      reasonForRecommendation: `Not eligible: ${eligibility.reasons.join(" ")}`,
    };
  }

  const { details, rawScore, maxScore, hasMandatoryGap } = evaluateSkills(student, opportunity);
  const careerBonus = scoreCareerAlignment(student, opportunity);
  const experienceBonus = scoreExperienceOverlap(student, opportunity);

  let score = maxScore > 0 ? (rawScore / maxScore) * 90 : 90; // skills worth up to 90 points
  score += careerBonus + experienceBonus; // up to +15 more
  score = Math.min(Math.round(score), 100);

  if (hasMandatoryGap) {
    score = Math.min(score, MANDATORY_GAP_SCORE_CAP);
  }

  const matchedSkills = details.filter((d) => d.status === "matched");
  const weakSkills = details.filter((d) => d.status === "weak");
  const missingSkills = details.filter((d) => d.status === "missing");
  const totalGaps = weakSkills.length + missingSkills.length;

  const isNearMatch =
    score >= NEAR_MATCH_MIN_SCORE && totalGaps > 0 && totalGaps <= NEAR_MATCH_MAX_GAPS;

  const reasonForRecommendation = buildExplanation({
    score,
    matchedSkills,
    weakSkills,
    missingSkills,
    isNearMatch,
    careerBonus,
  });

  return {
    studentId: student.id,
    opportunityId: opportunity.id,
    eligible: true,
    eligibilityReasons: [],
    compatibilityScore: score,
    matchedSkills,
    weakSkills,
    missingSkills,
    isNearMatch,
    reasonForRecommendation,
  };
}

function buildExplanation(args: {
  score: number;
  matchedSkills: SkillMatchDetail[];
  weakSkills: SkillMatchDetail[];
  missingSkills: SkillMatchDetail[];
  isNearMatch: boolean;
  careerBonus: number;
}): string {
  const { score, matchedSkills, weakSkills, missingSkills, isNearMatch, careerBonus } = args;
  const parts: string[] = [];

  if (matchedSkills.length > 0) {
    parts.push(`Meets ${matchedSkills.length} required skill(s) at the needed level.`);
  }
  if (careerBonus > 0) {
    parts.push(`Aligns with a stated career interest.`);
  }
  if (missingSkills.length > 0) {
    const mandatoryMissing = missingSkills.filter((m) => m.requirementType === RequirementType.Mandatory);
    if (mandatoryMissing.length > 0) {
      parts.push(`Missing mandatory skill(s): ${mandatoryMissing.map((m) => m.skillId).join(", ")}.`);
    }
    const otherMissing = missingSkills.filter((m) => m.requirementType !== RequirementType.Mandatory);
    if (otherMissing.length > 0) {
      parts.push(`Missing preferred/bonus skill(s): ${otherMissing.map((m) => m.skillId).join(", ")}.`);
    }
  }
  if (weakSkills.length > 0) {
    parts.push(`Below target proficiency in: ${weakSkills.map((w) => w.skillId).join(", ")}.`);
  }
  if (isNearMatch) {
    parts.push(`Near match — closing this small gap would meaningfully strengthen the match.`);
  }

  return `${score}/100. ${parts.join(" ")}`.trim();
}
