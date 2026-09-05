"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const STATUS_STYLE: Record<string, string> = {
  applied: "bg-slate-100 text-slate-600",
  shortlisted: "bg-brand-50 text-brand-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

export default function StudentApplicationsPage() {
  const { status } = useSession({ required: true });
  const [apps, setApps] = useState<any[] | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/me/applications").then((r) => r.json()).then(setApps);
  }, [status]);

  if (status === "loading" || !apps) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-slate-400">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-ink">My applications</h1>

      <div className="mt-6 space-y-3">
        {apps.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            No applications yet. <Link href="/student/dashboard" className="text-brand-600">Browse opportunities →</Link>
          </div>
        )}
        {apps.map((a) => (
          <Link
            key={a.id}
            href={`/student/opportunities/${a.opportunity.id}`}
            className="card p-4 flex items-center justify-between gap-4 block"
          >
            <div>
              <p className="font-medium text-ink">{a.opportunity.title}</p>
              <p className="text-sm text-slate-500">{a.opportunity.company.companyName}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">{a.score}/100</span>
              <span className={`badge ${STATUS_STYLE[a.status]}`}>{a.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
