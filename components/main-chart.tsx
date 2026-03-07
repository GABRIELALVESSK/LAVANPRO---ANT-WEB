"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "01 Mai", total: 1200 },
  { date: "05 Mai", total: 1300 },
  { date: "10 Mai", total: 1100 },
  { date: "15 Mai", total: 1600 },
  { date: "20 Mai", total: 1400 },
  { date: "24 Mai", total: 2450 },
  { date: "28 Mai", total: 2100 },
  { date: "30 Mai", total: 2300 },
];

export function MainChart() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-lg font-bold">Evolução do Faturamento Diário</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total acumulado nos últimos 30 dias
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-primary"></span>
            <span className="text-xs font-medium text-slate-500">Este mês</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-slate-300"></span>
            <span className="text-xs font-medium text-slate-500">
              Mês anterior
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
              hide
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
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs z-10">
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
