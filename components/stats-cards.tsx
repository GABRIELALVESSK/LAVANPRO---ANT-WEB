import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

export function StatsCards({ activeRange, customDates }: StatsCardsProps) {
  // Mock data mapping for simulation
  const mockData: Record<string, any> = {
    'hoje': {
      faturamento: 'R$ 845,00',
      ticket: 'R$ 70,40',
      pedidos: '12',
      taxa: '98%',
      trends: { fat: '+5.4%', ticket: '+1.2%', ped: '+8.3%', taxa: '+0.5%' }
    },
    '7d': {
      faturamento: 'R$ 5.920,00',
      ticket: 'R$ 82,10',
      pedidos: '72',
      taxa: '95%',
      trends: { fat: '+10.2%', ticket: '+4.5%', ped: '+12.4%', taxa: '+1.1%' }
    },
    '30d': {
      faturamento: 'R$ 24.450,00',
      ticket: 'R$ 84,20',
      pedidos: '286',
      taxa: '94%',
      trends: { fat: '+12.5%', ticket: '+5.2%', ped: '-2.4%', taxa: '+1.2%' }
    },
    'custom': {
      faturamento: 'R$ 14.280,00',
      ticket: 'R$ 82,90',
      pedidos: '172',
      taxa: '96%',
      trends: { fat: '+8.4%', ticket: '+2.1%', ped: '+4.3%', taxa: '+1.5%' }
    }
  };

  const data = mockData[activeRange || '30d'] || mockData['30d'];

  const getPeriodLabel = () => {
    if (activeRange === 'hoje') return 'do Dia';
    if (activeRange === 'custom' && customDates) {
      return `de ${new Date(customDates.start).toLocaleDateString('pt-BR')} a ${new Date(customDates.end).toLocaleDateString('pt-BR')}`;
    }
    return `dos últimos ${activeRange?.replace('d', '')} dias`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1 */}
      <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder shadow-xl hover:border-brand-primary active:scale-95 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Faturamento {getPeriodLabel()}
            </p>
            <h3 className="text-2xl font-black mt-1 text-white">{data.faturamento}</h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 ${data.trends.fat.startsWith('+') ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'} rounded-full flex items-center gap-1`}>
            {data.trends.fat.startsWith('+') ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {data.trends.fat}
          </span>
        </div>
        <div className="w-full h-12 mt-2 overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-emerald-500/10 to-transparent relative">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 35 Q 20 10, 40 25 T 80 15 T 100 20" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder shadow-xl hover:border-brand-primary active:scale-95 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-brand-muted">Ticket Médio</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{data.ticket}</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-full flex items-center gap-1">
            <TrendingUp className="size-3" /> {data.trends.ticket}
          </span>
        </div>
        <div className="w-full h-12 mt-2 overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-brand-primary/10 to-transparent relative">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 20 Q 25 25, 50 15 T 100 10" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder shadow-xl hover:border-brand-primary active:scale-95 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-brand-muted">Pedidios no Período</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{data.pedidos}</h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 ${data.trends.ped.startsWith('+') ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'} rounded-full flex items-center gap-1`}>
            {data.trends.ped.startsWith('+') ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {data.trends.ped}
          </span>
        </div>
        <div className="w-full h-12 mt-2 overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-rose-500/10 to-transparent relative">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 10 Q 30 20, 60 35 T 100 30" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder shadow-xl hover:border-brand-primary active:scale-95 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-brand-muted">Taxa de Retirada</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{data.taxa}</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-full flex items-center gap-1">
            <TrendingUp className="size-3" /> {data.trends.taxa}
          </span>
        </div>
        <div className="w-full h-12 mt-2 overflow-hidden flex items-end">
          <div className="w-full h-full bg-gradient-to-t from-emerald-500/10 to-transparent relative">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 30 Q 50 10, 100 5" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
