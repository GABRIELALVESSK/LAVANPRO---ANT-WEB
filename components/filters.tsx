"use client";
import { Calendar, Wifi } from "lucide-react";

interface FiltersProps {
  activeRange: string;
  onChange: (range: string) => void;
  customDates: { start: string; end: string };
  onCustomDatesChange: (dates: { start: string; end: string }) => void;
  title?: string;
  subtitle?: string;
}

export function Filters({
  activeRange,
  onChange,
  customDates,
  onCustomDatesChange,
  title = "Visão Geral",
  subtitle = "Acompanhe a performance operacional e financeira em tempo real",
}: FiltersProps) {
  const ranges = [
    { id: "hoje", label: "Hoje" },
    { id: "7d", label: "7 dias" },
    { id: "30d", label: "30 dias" },
    { id: "custom", label: "Personalizado" },
  ];

  const getPeriodLabel = () => {
    if (activeRange === "hoje") return "Hoje";
    if (activeRange === "7d") return "Últimos 7 dias";
    if (activeRange === "30d") return "Últimos 30 dias";
    if (activeRange === "custom" && customDates)
      return `${new Date(customDates.start + "T12:00:00").toLocaleDateString("pt-BR")} → ${new Date(customDates.end + "T12:00:00").toLocaleDateString("pt-BR")}`;
    return "Período";
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10">
            <Wifi className="size-3" />
            Sistema Online
          </span>
        </div>
        <h1 className="text-3xl font-black text-brand-text tracking-tight uppercase italic flex items-center gap-3">
          {title}
          <div className="h-px bg-brand-darkBorder flex-1 opacity-20" />
        </h1>
        <p className="text-sm text-brand-muted mt-1 max-w-xl">
          {subtitle}
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex bg-brand-card p-1 rounded-xl border border-brand-darkBorder shadow-inner">
          {ranges.map((range) => (
            <button
              key={range.id}
              onClick={() => onChange(range.id)}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeRange === range.id
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]"
                : "text-brand-muted hover:text-brand-text hover:bg-white/5"
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {activeRange === "custom" && (
          <div className="flex items-center gap-4 bg-brand-card p-1.5 px-4 rounded-xl border border-brand-darkBorder animate-in fade-in slide-in-from-left-4 duration-500 shadow-inner">
            <Calendar className="size-4 text-brand-primary" />
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) =>
                  onCustomDatesChange({ ...customDates, start: e.target.value })
                }
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-brand-text outline-none [color-scheme:dark]"
              />
              <span className="text-brand-muted text-[10px] font-black opacity-50 uppercase tracking-widest">Até</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) =>
                  onCustomDatesChange({ ...customDates, end: e.target.value })
                }
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-brand-text outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        )}

        <div className="ml-auto text-right hidden sm:block">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none mb-1 opacity-50">Visualizando Período</p>
          <p className="text-xs font-bold text-brand-primary">{getPeriodLabel()}</p>
        </div>
      </div>
    </div>
  );
}
