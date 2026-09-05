"use client";

import { SKILLS } from "@/lib/skills";

export interface SkillReq {
  skillId: string;
  requiredProficiency: number;
  weight: number;
  type: "Mandatory" | "Preferred" | "Bonus";
}

const PROF_LABELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

export default function SkillRequirementEditor({
  value,
  onChange,
}: {
  value: SkillReq[];
  onChange: (next: SkillReq[]) => void;
}) {
  function addRow() {
    onChange([...value, { skillId: SKILLS[0].id, requiredProficiency: 2, weight: 5, type: "Preferred" }]);
  }
  function updateRow(i: number, patch: Partial<SkillReq>) {
    onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeRow(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {value.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 bg-slate-50 rounded-lg p-3">
          <select className="input !w-auto" value={r.skillId} onChange={(e) => updateRow(i, { skillId: e.target.value })}>
            {SKILLS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <select className="input !w-auto" value={r.requiredProficiency} onChange={(e) => updateRow(i, { requiredProficiency: Number(e.target.value) })}>
            {[1, 2, 3, 4].map((p) => <option key={p} value={p}>Needs: {PROF_LABELS[p]}</option>)}
          </select>

          <select className="input !w-auto" value={r.type} onChange={(e) => updateRow(i, { type: e.target.value as SkillReq["type"] })}>
            <option value="Mandatory">Mandatory</option>
            <option value="Preferred">Preferred</option>
            <option value="Bonus">Bonus</option>
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Weight</span>
            <input
              type="number" min={1} max={10} className="input !w-16"
              value={r.weight}
              onChange={(e) => updateRow(i, { weight: Math.max(1, Math.min(10, Number(e.target.value))) })}
            />
          </div>

          <button type="button" onClick={() => removeRow(i)} className="text-red-500 text-sm ml-auto">Remove</button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="btn-secondary !py-1.5 text-sm">+ Add skill requirement</button>
    </div>
  );
}
