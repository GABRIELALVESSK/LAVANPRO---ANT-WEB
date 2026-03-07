"use client";

export function DonutChart() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <h4 className="text-lg font-bold mb-6">Faturamento por Categoria</h4>
      <div className="flex items-center justify-around h-64">
        <div className="relative size-48">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <circle
              className="stroke-slate-100 dark:stroke-slate-700"
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
              strokeDasharray="45 100"
              strokeWidth="4"
            ></circle>
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="16"
              stroke="#8b5cf6"
              strokeDasharray="30 100"
              strokeDashoffset="-45"
              strokeWidth="4"
            ></circle>
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="16"
              stroke="#c084fc"
              strokeDasharray="25 100"
              strokeDashoffset="-75"
              strokeWidth="4"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-slate-500 font-medium">Total</p>
            <p className="text-xl font-black">100%</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-primary"></span>
            <div>
              <p className="text-xs font-bold">Wash & Fold</p>
              <p className="text-sm font-medium opacity-60">45% (R$ 20.376)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-[#8b5cf6]"></span>
            <div>
              <p className="text-xs font-bold">Industrial</p>
              <p className="text-sm font-medium opacity-60">30% (R$ 13.584)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-[#c084fc]"></span>
            <div>
              <p className="text-xs font-bold">Dry Clean</p>
              <p className="text-sm font-medium opacity-60">25% (R$ 11.320)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
