"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MainChartProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

const dataSets: Record<string, any[]> = {
  'hoje': [
    { date: "08:00", total: 100 },
    { date: "10:00", total: 450 },
    { date: "12:00", total: 320 },
    { date: "14:00", total: 845 },
    { date: "16:00", total: 600 },
    { date: "18:00", total: 720 },
  ],
  '7d': [
    { date: "Seg", total: 800 },
    { date: "Ter", total: 950 },
    { date: "Qua", total: 720 },
    { date: "Qui", total: 1200 },
    { date: "Sex", total: 1500 },
    { date: "Sáb", total: 1800 },
    { date: "Dom", total: 1100 },
  ],
  '30d': [
    { date: "01 Mai", total: 4200 },
    { date: "05 Mai", total: 5800 },
    { date: "10 Mai", total: 4900 },
    { date: "15 Mai", total: 7200 },
    { date: "20 Mai", total: 6800 },
    { date: "24 Mai", total: 9100 },
    { date: "28 Mai", total: 8500 },
    { date: "30 Mai", total: 12400 },
  ],
  'custom': [
    { date: "Período", total: 14280 },
  ]
};

export function MainChart({ activeRange, customDates: _customDates }: MainChartProps) {
  const data = dataSets[activeRange || '30d'] || dataSets['30d'];

  return (
    <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-lg font-bold text-white">Evolução do Faturamento {activeRange === 'hoje' ? 'Hoje' : 'Diário'}</h4>
          <p className="text-sm text-brand-muted">
            Total acumulado no período selecionado
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-brand-primary"></span>
            <span className="text-xs font-medium text-slate-500">Período Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-slate-700"></span>
            <span className="text-xs font-medium text-brand-muted">
              Período Anterior
            </span>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6600ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6600ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              dy={10}
              hide={activeRange === 'hoje'}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(value) => `R$ ${value}`}
              hide
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 border border-brand-darkBorder text-white p-3 rounded-lg shadow-xl text-xs z-10">
                      <p className="font-bold opacity-60 mb-1">
                        {payload[0].payload.date}
                      </p>
                      <p className="text-sm">
                        Total:{" "}
                        <span className="font-bold">
                          R$ {payload[0].value}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#6600ff"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
