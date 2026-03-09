"use client";

interface DonutChartProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

const mockData: Record<string, { label: string; percent: number; val: string; color: string }[]> = {
  hoje: [
    { label: "Lavagem Completa", percent: 55, val: "R$ 465", color: "#8b5cf6" },
    { label: "Dry Clean", percent: 25, val: "R$ 211", color: "#6366f1" },
    { label: "Apenas Passar", percent: 12, val: "R$ 101", color: "#a78bfa" },
    { label: "Enxoval/Outros", percent: 8, val: "R$ 68", color: "#ddd6fe" },
  ],
  "7d": [
    { label: "Lavagem Completa", percent: 50, val: "R$ 2.960", color: "#8b5cf6" },
    { label: "Dry Clean", percent: 28, val: "R$ 1.658", color: "#6366f1" },
    { label: "Apenas Passar", percent: 14, val: "R$ 829", color: "#a78bfa" },
    { label: "Enxoval/Outros", percent: 8, val: "R$ 474", color: "#ddd6fe" },
  ],
  "30d": [
    { label: "Lavagem Completa", percent: 45, val: "R$ 11.002", color: "#8b5cf6" },
    { label: "Dry Clean", percent: 28, val: "R$ 6.846", color: "#6366f1" },
    { label: "Apenas Passar", percent: 17, val: "R$ 4.157", color: "#a78bfa" },
    { label: "Enxoval/Outros", percent: 10, val: "R$ 2.445", color: "#ddd6fe" },
  ],
  custom: [
    { label: "Lavagem Completa", percent: 48, val: "R$ 6.854", color: "#8b5cf6" },
    { label: "Dry Clean", percent: 27, val: "R$ 3.856", color: "#6366f1" },
    { label: "Apenas Passar", percent: 16, val: "R$ 2.285", color: "#a78bfa" },
    { label: "Enxoval/Outros", percent: 9, val: "R$ 1.285", color: "#ddd6fe" },
  ],
};

const totals: Record<string, string> = {
  hoje: "R$ 845",
  "7d": "R$ 5.920",
  "30d": "R$ 24.450",
  custom: "R$ 14.280",
};

export function DonutChart({ activeRange }: DonutChartProps) {
  const key = activeRange || "30d";
  const data = mockData[key] || mockData["30d"];
  const total = totals[key] || totals["30d"];

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
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
      <div className="p-6 border-b border-brand-darkBorder">
        <h4 className="text-lg font-bold text-brand-text">Faturamento por Categoria</h4>
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
