"use client";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DonutChartProps {
  activeRange?: string;
  data?: { label: string; value: number }[];
}

const COLORS = ["#8b5cf6", "#6366f1", "#a78bfa", "#ddd6fe", "#7c3aed", "#4f46e5"];

export function DonutChart({ data: propData }: DonutChartProps) {
  const router = useRouter();
  const data = (propData && propData.length > 0) ? propData.slice(0, 5).map((item, i) => {
    const total = propData.reduce((s, curr) => s + curr.value, 0);
    return {
      ...item,
      percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
      val: `R$ ${item.value.toLocaleString("pt-BR")}`,
      color: COLORS[i % COLORS.length]
    };
  }) : [
    { label: "Sem dados", percent: 0, val: "R$ 0", color: "#2d2d42" }
  ];

  const totalValue = propData ? propData.reduce((s, curr) => s + curr.value, 0) : 0;
  const total = `R$ ${totalValue.toLocaleString("pt-BR")}`;

  // Build SVG donut segments
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data.map((item) => {
    const dash = (item.percent / 100) * circumference;
    const gap = circumference - dash;
    const seg = { ...item, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden group">
      <div 
        onClick={() => router.push('/reports')}
        className="p-6 border-b border-brand-darkBorder cursor-pointer hover:bg-white/5 transition-all group/header"
      >
        <h4 className="text-lg font-bold text-brand-text group-hover/header:text-brand-primary transition-colors flex items-center justify-between">
          Faturamento por Categoria
          <ArrowUpRight className="size-4 opacity-0 group-hover/header:opacity-100 transition-all" />
        </h4>
        <p className="text-sm text-brand-muted mt-0.5">Distribuição por tipo de serviço</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* SVG Donut */}
          <div className="relative shrink-0 size-44">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              {/* Background ring */}
              <circle
                cx="18" cy="18" r={radius}
                fill="none"
                stroke="var(--color-brand-darkBorder, #2d2d42)"
                strokeWidth="3.5"
              />
              {segments.map((seg, i) => (
                <circle
                  key={i}
                  cx="18" cy="18" r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3.5"
                  strokeDasharray={`${seg.dash.toFixed(2)} ${seg.gap.toFixed(2)}`}
                  strokeDashoffset={-seg.offset.toFixed(2)}
                  strokeLinecap="butt"
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[9px] text-brand-muted uppercase font-bold tracking-widest">Total</p>
              <p className="text-base font-black text-brand-text leading-tight">{total}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3 w-full">
            {data.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-xs font-semibold text-brand-text">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-brand-muted">{item.val}</span>
                    <span className="text-[10px] font-bold text-brand-text w-8 text-right">{item.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percent}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
