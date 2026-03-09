"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface MainChartProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

const dataSets: Record<string, { atual: any[]; anterior: any[] }> = {
  hoje: {
    atual: [
      { date: "08:00", atual: 100, anterior: 80 },
      { date: "10:00", atual: 450, anterior: 320 },
      { date: "12:00", atual: 320, anterior: 400 },
      { date: "14:00", atual: 845, anterior: 610 },
      { date: "16:00", atual: 600, anterior: 500 },
      { date: "18:00", atual: 720, anterior: 590 },
    ],
    anterior: [],
  },
  "7d": {
    atual: [
      { date: "Seg", atual: 800, anterior: 680 },
      { date: "Ter", atual: 950, anterior: 820 },
      { date: "Qua", atual: 720, anterior: 900 },
      { date: "Qui", atual: 1200, anterior: 1050 },
      { date: "Sex", atual: 1500, anterior: 1300 },
      { date: "Sáb", atual: 1800, anterior: 1600 },
      { date: "Dom", atual: 1100, anterior: 950 },
    ],
    anterior: [],
  },
  "30d": {
    atual: [
      { date: "01 Mai", atual: 4200, anterior: 3800 },
      { date: "05 Mai", atual: 5800, anterior: 5100 },
      { date: "10 Mai", atual: 4900, anterior: 4600 },
      { date: "15 Mai", atual: 7200, anterior: 6500 },
      { date: "20 Mai", atual: 6800, anterior: 6100 },
      { date: "24 Mai", atual: 9100, anterior: 8200 },
      { date: "28 Mai", atual: 8500, anterior: 7800 },
      { date: "30 Mai", atual: 12400, anterior: 10800 },
    ],
    anterior: [],
  },
  custom: {
    atual: [
      { date: "Semana 1", atual: 3200, anterior: 2900 },
      { date: "Semana 2", atual: 4800, anterior: 4200 },
      { date: "Semana 3", atual: 3900, anterior: 3600 },
      { date: "Semana 4", atual: 6200, anterior: 5400 },
    ],
    anterior: [],
  },
};

const summaryData: Record<string, { total: string; media: string; melhor: string; crescimento: string }> = {
  hoje: { total: "R$ 845", media: "R$ 141/h", melhor: "14:00h", crescimento: "+5.4%" },
  "7d": { total: "R$ 5.920", media: "R$ 845/dia", melhor: "Sábado", crescimento: "+10.2%" },
  "30d": { total: "R$ 24.450", media: "R$ 815/dia", melhor: "30 Mai", crescimento: "+12.5%" },
  custom: { total: "R$ 14.280", media: "R$ 3.570/sem", melhor: "Semana 4", crescimento: "+8.4%" },
};

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-card border border-brand-darkBorder text-brand-text p-3 rounded-xl shadow-2xl text-xs z-10 min-w-[140px]">
        <p className="font-bold text-brand-muted mb-2 uppercase tracking-wider text-[10px]">
          {payload[0].payload.date}
        </p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: p.color }} />
              <span className="text-brand-muted">{p.dataKey === "atual" ? "Atual" : "Anterior"}</span>
            </div>
            <span className="font-bold">
              R$ {Number(p.value).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function MainChart({ activeRange, customDates: _customDates }: MainChartProps) {
  const key = activeRange || "30d";
  const data = dataSets[key]?.atual || dataSets["30d"].atual;
  const summary = summaryData[key] || summaryData["30d"];

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
      <div className="p-6 border-b border-brand-darkBorder flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-brand-text">
            Evolução do Faturamento
          </h4>
          <p className="text-sm text-brand-muted mt-0.5">
            Comparativo com o período anterior
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-brand-primary" />
            <span className="text-xs font-medium text-brand-muted">Período Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-slate-600" />
            <span className="text-xs font-medium text-brand-muted">Período Anterior</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px]">
        {/* Chart */}
        <div className="p-6 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAtual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAnterior" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#475569" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="anterior"
                stroke="#475569"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#gradAnterior)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="atual"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradAtual)"
                dot={false}
                activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Panel */}
        <div className="border-l border-brand-darkBorder p-6 flex flex-col gap-5">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Resumo do Período</p>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-brand-muted mb-0.5">Total faturado</p>
              <p className="text-xl font-black text-brand-text">{summary.total}</p>
            </div>
            <div className="h-px bg-brand-darkBorder" />
            <div>
              <p className="text-xs text-brand-muted mb-0.5">Média por período</p>
              <p className="text-sm font-bold text-brand-text">{summary.media}</p>
            </div>
            <div className="h-px bg-brand-darkBorder" />
            <div>
              <p className="text-xs text-brand-muted mb-0.5">Melhor período</p>
              <p className="text-sm font-bold text-brand-text">{summary.melhor}</p>
            </div>
            <div className="h-px bg-brand-darkBorder" />
            <div>
              <p className="text-xs text-brand-muted mb-0.5">Crescimento</p>
              <p className="text-sm font-bold text-emerald-500">{summary.crescimento}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
