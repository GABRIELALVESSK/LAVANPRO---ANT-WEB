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
  chartData: { date: string; atual: number; anterior: number }[];
  totalFaturado: number;
  pedidosTotal: number;
}

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

export function MainChart({ chartData, totalFaturado, pedidosTotal }: MainChartProps) {
  return (
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
      <div className="p-6 border-b border-brand-darkBorder flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-brand-text">
            Evolução do Faturamento
          </h4>
          <p className="text-sm text-brand-muted mt-0.5">
            Acompanhamento de receita em tempo real
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-brand-primary" />
            <span className="text-xs font-medium text-brand-muted">Período Selecionado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px]">
        {/* Chart */}
        <div className="p-6 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAtual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
              <p className="text-xl font-black text-brand-text">
                {totalFaturado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <div className="h-px bg-brand-darkBorder" />
            <div>
              <p className="text-xs text-brand-muted mb-0.5">Status do Crescimento</p>
              <p className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                Acompanhando Mercado
              </p>
            </div>
            <div className="h-px bg-brand-darkBorder" />
            <div>
              <p className="text-xs text-brand-muted mb-0.5">Previsão</p>
              <p className="text-sm font-bold text-brand-text">Em análise...</p>
            </div>
            <div className="h-px bg-brand-darkBorder" />
            <div className="p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter">Dica do Sistema</p>
              <p className="text-[10px] text-brand-muted mt-1 leading-relaxed">Seu ticket médio subiu nos últimos 7 dias!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
