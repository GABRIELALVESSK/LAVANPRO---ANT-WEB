import { TrendingUp, TrendingDown } from "lucide-react";

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Faturamento Mensal
            </p>
            <h3 className="text-2xl font-bold mt-1">R$ 45.280,00</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
            <TrendingUp className="size-3" /> +12.5%
          </span>
        </div>
        <div className="w-full h-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-md overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-emerald-500/20 to-transparent relative">
            <svg
              className="w-full h-full preserve-3d"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0 35 Q 20 10, 40 25 T 80 15 T 100 20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Ticket Médio
            </p>
            <h3 className="text-2xl font-bold mt-1">R$ 82,50</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
            <TrendingUp className="size-3" /> +3.2%
          </span>
        </div>
        <div className="w-full h-10 bg-primary/5 rounded-md overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-primary/20 to-transparent relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0 20 Q 25 25, 50 15 T 100 10"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Novos Pedidos
            </p>
            <h3 className="text-2xl font-bold mt-1">1.240</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center gap-1">
            <TrendingDown className="size-3" /> -1.5%
          </span>
        </div>
        <div className="w-full h-10 bg-rose-50 dark:bg-rose-900/10 rounded-md overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-rose-500/20 to-transparent relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0 10 Q 30 20, 60 35 T 100 30"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Taxa de Retirada
            </p>
            <h3 className="text-2xl font-bold mt-1">94%</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
            <TrendingUp className="size-3" /> +0.8%
          </span>
        </div>
        <div className="w-full h-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-md overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-emerald-500/20 to-transparent relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0 30 Q 50 10, 100 5"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
