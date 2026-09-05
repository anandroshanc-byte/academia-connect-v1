// Fixed skill taxonomy. Keeping this centralized and normalized (kebab-case
// ids) is what lets the matching engine assume skillIds are already clean —
// see the prototype's README: "taxonomy/alias resolution is a separate
// upstream concern, not the matching engine's job." This file *is* that
// upstream concern, kept intentionally simple (a flat curated list) so it's
// easy to extend later without touching matching logic.

export interface SkillDef {
  id: string;
  label: string;
  category: string;
}

export const SKILLS: SkillDef[] = [
  { id: "python", label: "Python", category: "Software" },
  { id: "sql", label: "SQL", category: "Software" },
  { id: "machine-learning", label: "Machine Learning", category: "Software" },
  { id: "data-analysis", label: "Data Analysis", category: "Software" },
  { id: "project-management", label: "Project Management", category: "Business" },
  { id: "public-speaking", label: "Public Speaking", category: "Business" },

  // AYUSH / Healthcare / Research
  { id: "ayurveda-fundamentals", label: "Ayurveda Fundamentals", category: "AYUSH" },
  { id: "yoga-naturopathy", label: "Yoga & Naturopathy", category: "AYUSH" },
  { id: "unani-fundamentals", label: "Unani Fundamentals", category: "AYUSH" },
  { id: "siddha-fundamentals", label: "Siddha Fundamentals", category: "AYUSH" },
  { id: "homoeopathy-fundamentals", label: "Homoeopathy Fundamentals", category: "AYUSH" },
  { id: "sowa-rigpa-fundamentals", label: "Sowa-Rigpa Fundamentals", category: "AYUSH" },
  { id: "pharmacognosy", label: "Pharmacognosy", category: "AYUSH Research" },
  { id: "phytochemistry", label: "Phytochemistry", category: "AYUSH Research" },
  { id: "herbal-formulation", label: "Herbal Formulation", category: "AYUSH Research" },
  { id: "quality-control", label: "Herbal Quality Control", category: "AYUSH Research" },
  { id: "clinical-research", label: "Clinical Research", category: "Healthcare Research" },
  { id: "pharmacovigilance", label: "Pharmacovigilance", category: "Healthcare Research" },
  { id: "research-methodology", label: "Research Methodology", category: "Healthcare Research" },
  { id: "literature-review", label: "Literature Review", category: "Healthcare Research" },
  { id: "medicinal-plants", label: "Medicinal Plant Research", category: "AYUSH Research" },

  // Sciences
  { id: "lab-techniques", label: "Lab Techniques", category: "Sciences" },
  { id: "statistical-analysis", label: "Statistical Analysis", category: "Sciences" },

  // Writing / Comms
  { id: "technical-writing", label: "Technical Writing", category: "Writing" },
  { id: "content-writing", label: "Content Writing", category: "Writing" },
];

export const SKILL_CATEGORIES = Array.from(new Set(SKILLS.map((s) => s.category)));

export function skillLabel(id: string): string {
  return SKILLS.find((s) => s.id === id)?.label ?? id;
}

export const CAREER_PATHS: { id: string; label: string }[] = [
  { id: "ayush-clinical-research", label: "AYUSH Clinical Research" },
  { id: "herbal-formulation", label: "Herbal Formulation & Quality" },
  { id: "pharmacovigilance", label: "Pharmacovigilance" },
  { id: "medicinal-plants", label: "Medicinal Plant Research" },
  { id: "digital-health", label: "Digital Health & Informatics" },
  { id: "ayush-education", label: "AYUSH Education & Outreach" },
];

export function careerPathLabel(id?: string | null): string {
  if (!id) return "—";
  return CAREER_PATHS.find((c) => c.id === id)?.label ?? id;
}
