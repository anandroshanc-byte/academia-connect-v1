"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SkillRequirementEditor, { SkillReq } from "@/components/SkillRequirementEditor";
import MultiSelectPills from "@/components/MultiSelectPills";
import { CAREER_PATHS } from "@/lib/skills";

const DEGREE_SUGGESTIONS = [
  "BAMS", "BHMS", "BUMS", "BSMS", "BNYS", "B.Pharm", "M.Pharm",
  "B.Sc Life Sciences", "M.Sc Biotechnology", "M.Sc Biochemistry", "PhD",
];

export default function NewOpportunityPage() {
  useSession({ required: true });
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("INTERNSHIP");
  const [duration, setDuration] = useState("");
  const [stipend, setStipend] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [careerPathId, setCareerPathId] = useState("");
  const [degrees, setDegrees] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");
  const [minCgpa, setMinCgpa] = useState<string>("");
  const [location, setLocation] = useState("");
  const [remoteAllowed, setRemoteAllowed] = useState(false);
  const [skillRequirements, setSkillRequirements] = useState<SkillReq[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, role, type, duration: duration || undefined, stipend: stipend || undefined, deadline: deadline ? new Date(deadline).toISOString() : undefined,
        description: description || undefined,
        careerPathId: careerPathId || undefined,
        degrees: degrees.length > 0 ? degrees : undefined,
        minYear: minYear ? Number(minYear) : undefined,
        maxYear: maxYear ? Number(maxYear) : undefined,
        minCgpa: minCgpa ? Number(minCgpa) : undefined,
        location: location || undefined,
        remoteAllowed,
        skillRequirements,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? "Could not post opportunity.");
      return;
    }
    const created = await res.json();
    router.push(`/company/opportunities/${created.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-ink">Post an opportunity</h1>
      <p className="text-slate-500 text-sm mt-1">
        Eligibility rules are a hard gate. Skill requirements drive the compatibility score for eligible students.
      </p>

      <div className="rounded-xl bg-brand-50 border border-brand-100 text-brand-800 p-4 text-sm mt-6">Your posting will enter <strong>Pending approval</strong> after submission. Only verified companies can publish opportunities.</div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-8">
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink">Basics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Data Science Intern" />
            </div>
            <div>
              <label className="label">Role</label>
              <input className="input" required value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend Developer" />
            </div>
            <div>
              <label className="label">Opportunity type</label>
              <select className="input" value={type} onChange={e=>setType(e.target.value)}><option value="INTERNSHIP">Internship</option><option value="ENTRY_JOB">Entry-level job</option><option value="LIVE_PROJECT">Live project</option><option value="APPRENTICESHIP">Apprenticeship</option><option value="TRAINING">Training program</option></select>
            </div>
            <div><label className="label">Duration</label><input className="input" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="e.g. 3 months"/></div>
            <div><label className="label">Stipend</label><input className="input" value={stipend} onChange={e=>setStipend(e.target.value)} placeholder="e.g. ₹15,000/month"/></div>
            <div><label className="label">Application deadline</label><input className="input" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Career path (optional)</label>
            <select className="input" value={careerPathId} onChange={(e) => setCareerPathId(e.target.value)}>
              <option value="">None</option>
              {CAREER_PATHS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink">Eligibility (hard gate)</h2>
          <div>
            <label className="label">Eligible degrees (leave empty for any)</label>
            <MultiSelectPills
              options={DEGREE_SUGGESTIONS.map((d) => ({ id: d, label: d }))}
              value={degrees}
              onChange={setDegrees}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Min year</label>
              <input className="input" type="number" min={1} max={8} value={minYear} onChange={(e) => setMinYear(e.target.value)} />
            </div>
            <div>
              <label className="label">Max year</label>
              <input className="input" type="number" min={1} max={8} value={maxYear} onChange={(e) => setMaxYear(e.target.value)} />
            </div>
            <div>
              <label className="label">Min CGPA</label>
              <input className="input" type="number" step="0.1" min={0} max={10} value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="label">Location</label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} disabled={remoteAllowed} />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
              <input type="checkbox" checked={remoteAllowed} onChange={(e) => setRemoteAllowed(e.target.checked)} />
              Remote allowed
            </label>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink">Skill requirements</h2>
          <p className="text-sm text-slate-500">
            A missing <strong>Mandatory</strong> skill doesn't disqualify a student — it caps their score and shows
            up clearly as a gap, so strong near-matches still surface.
          </p>
          <SkillRequirementEditor value={skillRequirements} onChange={setSkillRequirements} />
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Posting…" : "Post opportunity"}
        </button>
      </form>
    </div>
  );
}
