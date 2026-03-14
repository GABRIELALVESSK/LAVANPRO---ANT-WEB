"use client";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

interface BarChartProps {
  activeRange?: string;
  data?: { method: string; value: number }[];
}

const COLORS: Record<string, { color: string; icon: string }> = {
  "PIX": { color: "#10b981", icon: "⚡" },
  "Cartão de Crédito": { color: "#8b5cf6", icon: "💳" },
  "Cartão de Débito": { color: "#6366f1", icon: "💳" },
  "Dinheiro": { color: "#f59e0b", icon: "💵" },
  "Dinheiro / Outros": { color: "#f59e0b", icon: "💵" },
  "Boleto": { color: "#3b82f6", icon: "📄" },
  "Faturado": { color: "#6366f1", icon: "📊" },
  "Outros": { color: "#94a3b8", icon: "✨" },
};

export function BarChart({ data: propData }: BarChartProps) {
  const router = useRouter();
  const data = (propData && propData.length > 0) ? propData.slice(0, 4).map((item) => {
    const totalValue = propData.reduce((s, curr) => s + curr.value, 0);
    const config = COLORS[item.method] || COLORS["Outros"];
    return {
      ...item,
      percent: totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0,
      value: `R$ ${item.value.toLocaleString("pt-BR")}`,
      color: config.color,
      icon: config.icon
    };
  }) : [
    { method: "Sem dados", percent: 0, value: "R$ 0", color: "#2d2d42", icon: "∅" }
  ];

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden group">
      <div 
        onClick={() => router.push('/finance')}
        className="p-6 border-b border-brand-darkBorder cursor-pointer hover:bg-white/5 transition-all group/header"
      >
        <h4 className="text-lg font-bold text-brand-text group-hover/header:text-brand-primary transition-colors flex items-center justify-between">
          Formas de Pagamento
          <ArrowUpRight className="size-4 opacity-0 group-hover/header:opacity-100 transition-all" />
        </h4>
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

      </div>
    </div>
  );
}
