import { skillLabel } from "@/lib/skills";

interface Detail {
  skillId: string;
  status: "matched" | "weak" | "missing";
  requiredProficiency: number;
  studentProficiency: number | null;
  requirementType: string;
}

const PROF_LABELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

export default function SkillBreakdown({
  matchedSkills,
  weakSkills,
  missingSkills,
}: {
  matchedSkills: Detail[];
  weakSkills: Detail[];
  missingSkills: Detail[];
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-3 text-sm">
      <SkillGroup title="Matched" tone="emerald" items={matchedSkills} />
      <SkillGroup title="Weak" tone="amber" items={weakSkills} />
      <SkillGroup title="Missing" tone="slate" items={missingSkills} />
    </div>
  );
}

function SkillGroup({ title, tone, items }: { title: string; tone: string; items: Detail[] }) {
  if (items.length === 0) return null;
  const dot: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    slate: "bg-slate-400",
  };
  return (
    <div>
      <p className="font-medium text-slate-600 mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((d) => (
          <li key={d.skillId} className="flex items-start gap-1.5">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot[tone]}`} />
            <span>
              {skillLabel(d.skillId)}
              <span className="text-slate-400">
                {" "}({d.requirementType}, needs {PROF_LABELS[d.requiredProficiency]}
                {d.studentProficiency ? `, has ${PROF_LABELS[d.studentProficiency]}` : ""})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
