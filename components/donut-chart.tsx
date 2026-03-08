"use client";

interface DonutChartProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

export function DonutChart({ activeRange, customDates: _customDates }: DonutChartProps) {
  const mockData: Record<string, any> = {
    'hoje': [
      { label: 'Wash & Fold', percent: 60, val: 'R$ 507' },
      { label: 'Industrial', percent: 25, val: 'R$ 211' },
      { label: 'Dry Clean', percent: 15, val: 'R$ 127' }
    ],
    '7d': [
      { label: 'Wash & Fold', percent: 50, val: 'R$ 2.960' },
      { label: 'Industrial', percent: 35, val: 'R$ 2.072' },
      { label: 'Dry Clean', percent: 15, val: 'R$ 888' }
    ],
    '30d': [
      { label: 'Wash & Fold', percent: 45, val: 'R$ 11.002' },
      { label: 'Industrial', percent: 30, val: 'R$ 7.335' },
      { label: 'Dry Clean', percent: 25, val: 'R$ 6.112' }
    ],
    'custom': [
      { label: 'Wash & Fold', percent: 55, val: 'R$ 7.854' },
      { label: 'Industrial', percent: 25, val: 'R$ 3.570' },
      { label: 'Dry Clean', percent: 20, val: 'R$ 2.856' }
    ]
  };

  const data = mockData[activeRange || '30d'] || mockData['30d'];

  return (
    <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
      <h4 className="text-lg font-bold mb-6 text-white">Faturamento por Categoria</h4>
      <div className="flex items-center justify-around h-64">
        <div className="relative size-48">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <circle
              className="stroke-brand-darkBorder"
              cx="18"
              cy="18"
              fill="none"
              r="16"
              strokeWidth="4"
            ></circle>
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="16"
              stroke="var(--color-primary)"
              strokeDasharray={`${data[0].percent} 100`}
              strokeWidth="4"
            ></circle>
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="16"
              stroke="#8b5cf6"
              strokeDasharray={`${data[1].percent} 100`}
              strokeDashoffset={-data[0].percent}
              strokeWidth="4"
            ></circle>
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="16"
              stroke="#c084fc"
              strokeDasharray={`${data[2].percent} 100`}
              strokeDashoffset={-(data[0].percent + data[1].percent)}
              strokeWidth="4"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] text-brand-muted uppercase font-bold tracking-widest">Total</p>
            <p className="text-2xl font-black text-white">100%</p>
          </div>
        </div>
        <div className="space-y-4">
          {data.map((item: any, idx: number) => {
            const colors = ['bg-brand-primary', 'bg-[#8b5cf6]', 'bg-[#c084fc]'];
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`size-3 rounded-full ${colors[idx]}`}></span>
                <div>
                  <p className="text-xs font-bold text-white">{item.label}</p>
                  <p className="text-sm font-medium text-brand-muted">{item.percent}% ({item.val})</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
