"use client";

export default function MultiSelectPills({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from(new Map(options.map((option) => [option.id, option])).values()).map((o) => {
        const selected = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              selected
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
