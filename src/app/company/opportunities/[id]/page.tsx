"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import MatchScoreBadge from "@/components/MatchScoreBadge";
import SkillBreakdown from "@/components/SkillBreakdown";

const STATUSES = ["applied", "shortlisted", "accepted", "rejected"] as const;
const STATUS_STYLE: Record<string, string> = {
  applied: "bg-slate-100 text-slate-600",
  shortlisted: "bg-brand-50 text-brand-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

export default function CompanyOpportunityPage() {
  useSession({ required: true });
  const { id } = useParams<{ id: string }>();

  const [opportunity, setOpportunity] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/opportunities/${id}`).then((r) => r.json()).then((d) => setOpportunity(d.opportunity));
    fetch(`/api/opportunities/${id}/applicants`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Could not load applicants.");
        return r.json();
      })
      .then(setApplicants)
      .catch((e) => setError(e.message));
  }, [id]);

  async function toggleStatus(applicationId: string, opportunityStatus: string) {
    setOpportunity((o: any) => ({ ...o, status: opportunityStatus }));
    await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: opportunityStatus }),
    });
  }

  async function updateApplicationStatus(applicationId: string, status: string) {
    setApplicants((prev) =>
      prev ? prev.map((a) => (a.applicationId === applicationId ? { ...a, applicationStatus: status } : a)) : prev
    );
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  if (!opportunity) return <div className="max-w-4xl mx-auto px-4 py-16 text-slate-400">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{opportunity.title}</h1>
          <p className="text-slate-500 mt-1">{opportunity.role}</p>
        </div>
        <button
          onClick={() => toggleStatus("", opportunity.status === "open" ? "closed" : "open")}
          className="btn-secondary"
        >
          Mark as {opportunity.status === "open" ? "closed" : "open"}
        </button>
      </div>

      <h2 className="font-semibold text-ink mt-8 mb-3">
        Applicants {applicants ? `(${applicants.length})` : ""}
      </h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {applicants && applicants.length === 0 && (
          <div className="card p-8 text-center text-slate-400">No applicants yet.</div>
        )}
        {applicants?.map((a) => (
          <div key={a.applicationId} className="card p-5">
            <div
              className="flex items-center justify-between gap-4 cursor-pointer"
              onClick={() => setExpanded(expanded === a.applicationId ? null : a.applicationId)}
            >
              <div>
                <p className="font-medium text-ink">{a.student.user.name}</p>
                <p className="text-sm text-slate-500">{a.student.degree} · Year {a.student.year}</p>
              </div>
              <div className="flex items-center gap-3">
                <MatchScoreBadge score={a.compatibilityScore} isNearMatch={a.isNearMatch} />
                <select
                  className={`badge border-0 text-sm ${STATUS_STYLE[a.applicationStatus]}`}
                  value={a.applicationStatus}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateApplicationStatus(a.applicationId, e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {expanded === a.applicationId && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-3">{a.reasonForRecommendation}</p>
                <SkillBreakdown matchedSkills={a.matchedSkills} weakSkills={a.weakSkills} missingSkills={a.missingSkills} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
