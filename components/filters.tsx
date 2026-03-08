import { Calendar } from "lucide-react";

interface FiltersProps {
  activeRange: string;
  onChange: (range: string) => void;
  customDates: { start: string; end: string };
  onCustomDatesChange: (dates: { start: string; end: string }) => void;
}

export function Filters({ activeRange, onChange, customDates, onCustomDatesChange }: FiltersProps) {
  const ranges = [
    { id: 'hoje', label: 'Hoje' },
    { id: '7d', label: '7 dias' },
    { id: '30d', label: '30 dias' },
    { id: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="px-8 py-6 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex bg-brand-card p-1 rounded-lg border border-brand-darkBorder">
          {ranges.map((range) => (
            <button
              key={range.id}
              onClick={() => onChange(range.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeRange === range.id
                ? "bg-brand-primary/20 text-brand-primary shadow-sm"
                : "text-brand-muted hover:text-white"
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {activeRange === 'custom' && (
          <div className="flex items-center gap-3 bg-brand-card p-1.5 px-3 rounded-lg border border-brand-darkBorder animate-in fade-in slide-in-from-left-2 duration-300">
            <Calendar className="size-4 text-brand-primary" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => onCustomDatesChange({ ...customDates, start: e.target.value })}
                className="bg-transparent border-none text-xs font-semibold text-white outline-none [color-scheme:dark]"
              />
              <span className="text-brand-muted text-xs">até</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => onCustomDatesChange({ ...customDates, end: e.target.value })}
                className="bg-transparent border-none text-xs font-semibold text-white outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Unidade:
          </span>
          <select className="bg-brand-card border border-brand-darkBorder rounded-lg text-sm font-semibold focus:ring-brand-primary pr-10 py-2 pl-3 outline-none text-white appearance-none cursor-pointer hover:border-brand-primary/50 transition-colors">
            <option>Todas as Unidades</option>
            <option>Unidade Centro</option>
            <option>Unidade Norte</option>
            <option>Unidade Jardins</option>
          </select>
        </div>
      </div>
    </div>
  );
}
