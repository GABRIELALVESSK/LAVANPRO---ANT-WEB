export function BarChart() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <h4 className="text-lg font-bold mb-6">Formas de Pagamento</h4>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Pix</span>
            <span>62%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: "62%" }}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Cartão de Crédito</span>
            <span>28%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/70 rounded-full"
              style={{ width: "28%" }}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Dinheiro / Outros</span>
            <span>10%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/40 rounded-full"
              style={{ width: "10%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
