export default function MatchScoreBadge({ score, isNearMatch }: { score: number; isNearMatch?: boolean }) {
  const color =
    score >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-slate-50 text-slate-500 border-slate-200";

  return (
    <div className="flex items-center gap-2">
      <span className={`badge border ${color} text-sm font-semibold`}>{score}/100</span>
      {isNearMatch && (
        <span className="badge bg-brand-50 text-brand-700 border border-brand-200">Near match</span>
      )}
    </div>
  );
}
