import { Search, FileDown } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showActions?: boolean;
}

export function Header({
  title = "Painel de Faturamento Detalhado",
  subtitle = "Análise financeira completa das operações",
  showActions = true
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-brand-darkBorder sticky top-0 bg-brand-bg/90 backdrop-blur-md z-10">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-brand-muted">
          {subtitle}
        </p>
      </div>
      {showActions && (
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Buscar relatório..."
              className="pl-10 pr-4 py-2 bg-brand-card border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary w-64 text-sm outline-none text-white placeholder-brand-muted"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20">
            <FileDown className="size-5" />
            Exportar PDF
          </button>
        </div>
      )}
    </header>
  );
}
