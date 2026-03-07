export function Filters() {
  return (
    <div className="px-8 py-6 flex flex-wrap gap-4 items-center">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white">
          Hoje
        </button>
        <button className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white">
          Últimos 7 dias
        </button>
        <button className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all bg-white dark:bg-slate-700 text-primary shadow-sm">
          Últimos 30 dias
        </button>
        <button className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white">
          Personalizado
        </button>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Unidade:
        </span>
        <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold focus:ring-primary pr-10 py-2 pl-3 outline-none">
          <option>Todas as Unidades</option>
          <option>Unidade Centro</option>
          <option>Unidade Norte</option>
          <option>Unidade Jardins</option>
        </select>
      </div>
    </div>
  );
}
