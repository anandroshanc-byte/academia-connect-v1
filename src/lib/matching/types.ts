// ============================================================
// Domain types for the Academia-Industry matching engine.
//
// These are plain data shapes on purpose — no DB/ORM types leak
// in here, so this module can sit behind any backend/provider.
// ============================================================

export enum ProficiencyLevel {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
  Expert = 4,
}

export enum VerificationLevel {
  SelfDeclared = 1,
  Assessed = 2,
  InstitutionVerified = 3,
  IndustryVerified = 4,
}

export enum RequirementType {
  Mandatory = "Mandatory",
  Preferred = "Preferred",
  Bonus = "Bonus",
}

export interface StudentSkill {
  skillId: string; // assumed already normalized by the skill taxonomy layer
  proficiency: ProficiencyLevel;
  verification: VerificationLevel;
}

export interface StudentProfile {
  id: string;
  name: string;
  degree: string;
  year: number; // current year of study, e.g. 3
  cgpa?: number;
  location?: string;
  skills: StudentSkill[];
  careerInterests: string[]; // career path ids
  projectSkillIds: string[]; // skills demonstrated via projects
  experienceSkillIds: string[]; // skills demonstrated via prior internships/jobs
}

export interface SkillRequirement {
  skillId: string;
  requiredProficiency: ProficiencyLevel;
  weight: number; // relative importance within this opportunity (e.g. 1-10)
  type: RequirementType;
}

export interface EligibilityRules {
  degrees?: string[]; // allowed degrees; omit = any degree
  minYear?: number;
  maxYear?: number;
  minCgpa?: number;
  location?: string; // required location; ignored if remoteAllowed
  remoteAllowed?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  role: string;
  careerPathId?: string;
  eligibility: EligibilityRules;
  skillRequirements: SkillRequirement[];
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[]; // failed constraints; empty when eligible
}

export type SkillMatchStatus = "matched" | "weak" | "missing";

export interface SkillMatchDetail {
  skillId: string;
  status: SkillMatchStatus;
  requiredProficiency: ProficiencyLevel;
  studentProficiency: ProficiencyLevel | null;
  requirementType: RequirementType;
  weight: number;
}

export interface MatchResult {
  studentId: string;
  opportunityId: string;
  eligible: boolean;
  eligibilityReasons: string[];
  compatibilityScore: number; // 0-100; only meaningful when eligible
  matchedSkills: SkillMatchDetail[];
  weakSkills: SkillMatchDetail[];
  missingSkills: SkillMatchDetail[];
  isNearMatch: boolean;
  reasonForRecommendation: string;
}
