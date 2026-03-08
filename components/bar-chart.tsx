interface BarChartProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

export function BarChart({ activeRange, customDates: _customDates }: BarChartProps) {
  const mockData: Record<string, any> = {
    'hoje': { pix: 80, cartao: 15, dinheiro: 5 },
    '7d': { pix: 70, cartao: 20, dinheiro: 10 },
    '30d': { pix: 65, cartao: 25, dinheiro: 10 },
    'custom': { pix: 75, cartao: 20, dinheiro: 5 },
  };

  const data = mockData[activeRange || '30d'] || mockData['30d'];

  return (
    <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
      <h4 className="text-lg font-bold mb-6 text-white">Formas de Pagamento</h4>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-brand-muted">
            <span>Pix</span>
            <span>{data.pix}%</span>
          </div>
          <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden border border-brand-darkBorder">
            <div
              className="h-full bg-brand-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-500"
              style={{ width: `${data.pix}%` }}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-brand-muted">
            <span>Cartão de Crédito</span>
            <span>{data.cartao}%</span>
          </div>
          <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden border border-brand-darkBorder">
            <div
              className="h-full bg-brand-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${data.cartao}%` }}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-brand-muted">
            <span>Dinheiro / Outros</span>
            <span>{data.dinheiro}%</span>
          </div>
          <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden border border-brand-darkBorder">
            <div
              className="h-full bg-brand-primary/40 rounded-full transition-all duration-500"
              style={{ width: `${data.dinheiro}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
