"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MatchScoreBadge from "@/components/MatchScoreBadge";
import SkillBreakdown from "@/components/SkillBreakdown";
import { skillLabel, careerPathLabel } from "@/lib/skills";

export default function OpportunityDetailPage() {
  const { status } = useSession({ required: true });
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/opportunities/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load this opportunity.");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [status, id]);

  async function apply() {
    setApplying(true);
    setApplyError(null);
    const res = await fetch(`/api/opportunities/${id}/apply`, { method: "POST" });
    setApplying(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setApplyError(b.error ?? "Could not apply.");
      return;
    }
    setData((d: any) => ({ ...d, alreadyApplied: true }));
  }

  if (status === "loading" || (!data && !error)) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-slate-400">Loading…</div>;
  }
  if (error) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-slate-500">{error}</div>;
  }

  const { opportunity, match, alreadyApplied } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-ink">← Back</button>

      <div className="card p-6 mt-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-ink">{opportunity.title}</h1>
            <p className="text-slate-500 mt-1">
              {opportunity.company.companyName} · {opportunity.role}
              {opportunity.careerPathId && ` · ${careerPathLabel(opportunity.careerPathId)}`}
            </p>
          </div>
          {match && <MatchScoreBadge score={match.eligible ? match.compatibilityScore : 0} isNearMatch={match.isNearMatch} />}
        </div>

        {opportunity.description && (
          <p className="mt-4 text-slate-700 whitespace-pre-wrap">{opportunity.description}</p>
        )}

        <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
          {opportunity.degrees && (
            <p><span className="font-medium">Eligible degrees:</span> {JSON.parse(opportunity.degrees).join(", ")}</p>
          )}
          {(opportunity.minYear || opportunity.maxYear) && (
            <p><span className="font-medium">Year:</span> {opportunity.minYear ?? "any"}–{opportunity.maxYear ?? "any"}</p>
          )}
          {opportunity.minCgpa && <p><span className="font-medium">Min CGPA:</span> {opportunity.minCgpa}</p>}
          <p><span className="font-medium">Location:</span> {opportunity.remoteAllowed ? "Remote OK" : opportunity.location || "Not specified"}</p>
        </div>

        <div className="mt-5">
          <p className="font-medium text-sm text-slate-700 mb-2">Skill requirements</p>
          <div className="flex flex-wrap gap-2">
            {opportunity.skillRequirements.map((r: any) => (
              <span key={r.skillId} className="badge bg-slate-100 text-slate-600">
                {skillLabel(r.skillId)} · {r.type}
              </span>
            ))}
          </div>
        </div>

        {match && !match.eligible && (
          <div className="mt-6 card !shadow-none border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700 text-sm">You're not eligible for this one</p>
            <ul className="list-disc list-inside text-sm text-red-600 mt-1">
              {match.eligibilityReasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {match && match.eligible && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="font-medium text-sm text-slate-700 mb-3">Why this score</p>
            <p className="text-sm text-slate-600 mb-4">{match.reasonForRecommendation}</p>
            <SkillBreakdown
              matchedSkills={match.matchedSkills}
              weakSkills={match.weakSkills}
              missingSkills={match.missingSkills}
            />

            <div className="mt-6">
              {alreadyApplied ? (
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">Applied</span>
              ) : (
                <button onClick={apply} disabled={applying} className="btn-primary">
                  {applying ? "Applying…" : "Apply"}
                </button>
              )}
              {applyError && <p className="text-sm text-red-600 mt-2">{applyError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
