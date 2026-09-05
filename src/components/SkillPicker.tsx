"use client";

import { SKILLS, SKILL_CATEGORIES } from "@/lib/skills";

export interface PickedSkill {
  skillId: string;
  proficiency: number;
}

const PROF_LABELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

export default function SkillPicker({
  value,
  onChange,
}: {
  value: PickedSkill[];
  onChange: (next: PickedSkill[]) => void;
}) {
  const selectedMap = new Map(value.map((v) => [v.skillId, v.proficiency]));

  function toggle(skillId: string) {
    if (selectedMap.has(skillId)) {
      onChange(value.filter((v) => v.skillId !== skillId));
    } else {
      onChange([...value, { skillId, proficiency: 2 }]);
    }
  }

  function setProficiency(skillId: string, proficiency: number) {
    onChange(value.map((v) => (v.skillId === skillId ? { ...v, proficiency } : v)));
  }

  return (
    <div className="space-y-4">
      {SKILL_CATEGORIES.map((cat) => (
        <div key={cat}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS.filter((s) => s.category === cat).map((s) => {
              const selected = selectedMap.has(s.id);
              return (
                <div key={s.id} className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={`rounded-l-lg px-3 py-1.5 text-sm border ${
                      selected
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    } ${selected ? "" : "rounded-r-lg"}`}
                  >
                    {s.label}
                  </button>
                  {selected && (
                    <select
                      className="rounded-r-lg border border-l-0 border-brand-600 bg-brand-50 text-brand-800 text-xs px-1"
                      value={selectedMap.get(s.id)}
                      onChange={(e) => setProficiency(s.id, Number(e.target.value))}
                    >
                      {[1, 2, 3, 4].map((p) => (
                        <option key={p} value={p}>{PROF_LABELS[p]}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
