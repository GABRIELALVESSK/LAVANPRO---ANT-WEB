"use client";
import { Calendar, ChevronDown, Building2, Wifi } from "lucide-react";
import { useState } from "react";

interface FiltersProps {
  activeRange: string;
  onChange: (range: string) => void;
  customDates: { start: string; end: string };
  onCustomDatesChange: (dates: { start: string; end: string }) => void;
  selectedUnit?: string;
  onUnitChange?: (unit: string) => void;
  title?: string;
  subtitle?: string;
}

const UNITS = [
  "Todas as Unidades",
  "Unidade Centro",
  "Unidade Norte",
  "Unidade Jardins",
];

export function Filters({
  activeRange,
  onChange,
  customDates,
  onCustomDatesChange,
  selectedUnit = "Todas as Unidades",
  onUnitChange,
  title = "Visão Geral",
  subtitle = "Acompanhe a performance operacional e financeira em tempo real",
}: FiltersProps) {
  const [isUnitOpen, setIsUnitOpen] = useState(false);

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
    <div className="sticky top-0 z-30 bg-brand-bg border-b border-brand-darkBorder backdrop-blur-sm">
      {/* Page Header */}
      <div className="px-8 pt-6 pb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <Wifi className="size-3" />
              Sistema Online
            </span>
          </div>
          <h1 className="text-2xl font-black text-brand-text tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Unit Selector */}
        <div className="relative">
          <button
            onClick={() => setIsUnitOpen(!isUnitOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-sm font-semibold text-brand-text hover:border-brand-primary/50 transition-colors"
          >
            <Building2 className="size-4 text-brand-primary" />
            <span>{selectedUnit}</span>
            <ChevronDown className={`size-4 text-brand-muted transition-transform ${isUnitOpen ? "rotate-180" : ""}`} />
          </button>
          {isUnitOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-brand-card border border-brand-darkBorder rounded-xl shadow-2xl z-50 overflow-hidden">
              {UNITS.map((unit) => (
                <button
                  key={unit}
                  onClick={() => {
                    onUnitChange?.(unit);
                    setIsUnitOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-brand-primary/5 ${selectedUnit === unit
                    ? "text-brand-primary font-bold bg-brand-primary/5"
                    : "text-brand-text font-medium"
                    }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="px-8 pb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex bg-brand-card p-1 rounded-lg border border-brand-darkBorder">
            {ranges.map((range) => (
              <button
                key={range.id}
                onClick={() => onChange(range.id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeRange === range.id
                  ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30"
                  : "text-brand-muted hover:text-brand-text"
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {activeRange === "custom" && (
            <div className="flex items-center gap-3 bg-brand-card p-1.5 px-3 rounded-lg border border-brand-darkBorder animate-in fade-in slide-in-from-left-2 duration-300">
              <Calendar className="size-4 text-brand-primary" />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) =>
                    onCustomDatesChange({ ...customDates, start: e.target.value })
                  }
                  className="bg-transparent border-none text-xs font-semibold text-brand-text outline-none [color-scheme:dark]"
                />
                <span className="text-brand-muted text-xs">até</span>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) =>
                    onCustomDatesChange({ ...customDates, end: e.target.value })
                  }
                  className="bg-transparent border-none text-xs font-semibold text-brand-text outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <span className="font-semibold">Período:</span>
          <span className="font-bold text-brand-text">{getPeriodLabel()}</span>
        </div>
      </div>
    </div>
  );
}
