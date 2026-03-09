"use client";

interface BarChartProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

const mockData: Record<string, { method: string; percent: number; value: string; color: string; icon: string }[]> = {
  hoje: [
    { method: "PIX", percent: 75, value: "R$ 634", color: "#10b981", icon: "⚡" },
    { method: "Cartão de Crédito", percent: 14, value: "R$ 118", color: "#8b5cf6", icon: "💳" },
    { method: "Cartão de Débito", percent: 8, value: "R$ 68", color: "#6366f1", icon: "💳" },
    { method: "Dinheiro / Outros", percent: 3, value: "R$ 25", color: "#f59e0b", icon: "💵" },
  ],
  "7d": [
    { method: "PIX", percent: 68, value: "R$ 4.026", color: "#10b981", icon: "⚡" },
    { method: "Cartão de Crédito", percent: 18, value: "R$ 1.066", color: "#8b5cf6", icon: "💳" },
    { method: "Cartão de Débito", percent: 9, value: "R$ 533", color: "#6366f1", icon: "💳" },
    { method: "Dinheiro / Outros", percent: 5, value: "R$ 296", color: "#f59e0b", icon: "💵" },
  ],
  "30d": [
    { method: "PIX", percent: 65, value: "R$ 15.893", color: "#10b981", icon: "⚡" },
    { method: "Cartão de Crédito", percent: 20, value: "R$ 4.890", color: "#8b5cf6", icon: "💳" },
    { method: "Cartão de Débito", percent: 10, value: "R$ 2.445", color: "#6366f1", icon: "💳" },
    { method: "Dinheiro / Outros", percent: 5, value: "R$ 1.222", color: "#f59e0b", icon: "💵" },
  ],
  custom: [
    { method: "PIX", percent: 70, value: "R$ 9.996", color: "#10b981", icon: "⚡" },
    { method: "Cartão de Crédito", percent: 18, value: "R$ 2.570", color: "#8b5cf6", icon: "💳" },
    { method: "Cartão de Débito", percent: 8, value: "R$ 1.142", color: "#6366f1", icon: "💳" },
    { method: "Dinheiro / Outros", percent: 4, value: "R$ 571", color: "#f59e0b", icon: "💵" },
  ],
};

export function BarChart({ activeRange }: BarChartProps) {
  const key = activeRange || "30d";
  const data = mockData[key] || mockData["30d"];

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
      <div className="p-6 border-b border-brand-darkBorder">
        <h4 className="text-lg font-bold text-brand-text">Formas de Pagamento</h4>
        <p className="text-sm text-brand-muted mt-0.5">Distribuição por método de pagamento</p>
      </div>

      <div className="p-6 space-y-5">
        {data.map((item) => (
          <div key={item.method}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-semibold text-brand-text">{item.method}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-muted">{item.value}</span>
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: `${item.color}18`, color: item.color }}
                >
                  {item.percent}%
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden border border-brand-darkBorder/50">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.percent}%`,
                  background: `linear-gradient(90deg, ${item.color}dd, ${item.color})`,
                  boxShadow: `0 0 8px ${item.color}55`,
                }}
              />
            </div>
          </div>
        ))}

        {/* Totals footer */}
        <div className="mt-2 pt-4 border-t border-brand-darkBorder grid grid-cols-2 gap-3">
          <div className="bg-brand-bg rounded-xl p-3 border border-brand-darkBorder text-center">
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Digital</p>
            <p className="text-base font-black text-brand-text mt-0.5">
              {data[0].percent + data[1].percent + data[2].percent}%
            </p>
          </div>
          <div className="bg-brand-bg rounded-xl p-3 border border-brand-darkBorder text-center">
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Físico</p>
            <p className="text-base font-black text-brand-text mt-0.5">{data[3].percent}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
