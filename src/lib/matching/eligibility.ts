import { StudentProfile, Opportunity, EligibilityResult } from "./types";

/**
 * Hard-gate eligibility check. Runs BEFORE any compatibility scoring.
 * Deterministic, no AI involved — mirrors the spec's "Eligibility first,
 * compatibility second" principle. Academic/profile constraints only;
 * skill requirements are handled by the compatibility scorer, not here.
 */
export function checkEligibility(
  student: StudentProfile,
  opportunity: Opportunity
): EligibilityResult {
  const reasons: string[] = [];
  const rules = opportunity.eligibility;

  if (rules.degrees && rules.degrees.length > 0 && !rules.degrees.includes(student.degree)) {
    reasons.push(
      `Degree "${student.degree}" is not in the eligible list (${rules.degrees.join(", ")}).`
    );
  }

  if (rules.minYear !== undefined && student.year < rules.minYear) {
    reasons.push(`Requires year ${rules.minYear} or above; student is in year ${student.year}.`);
  }

  if (rules.maxYear !== undefined && student.year > rules.maxYear) {
    reasons.push(`Requires year ${rules.maxYear} or below; student is in year ${student.year}.`);
  }

  if (rules.minCgpa !== undefined) {
    if (student.cgpa === undefined) {
      reasons.push(`Requires minimum CGPA ${rules.minCgpa}, but student has no CGPA on record.`);
    } else if (student.cgpa < rules.minCgpa) {
      reasons.push(`Requires minimum CGPA ${rules.minCgpa}; student has ${student.cgpa}.`);
    }
  }

  if (rules.location && !rules.remoteAllowed) {
    if (student.location && student.location !== rules.location) {
      reasons.push(
        `Requires location "${rules.location}"; student is based in "${student.location}".`
      );
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
